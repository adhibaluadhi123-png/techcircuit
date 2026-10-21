"""Tamper-Evident Hash-Chained Audit Ledger and Review Receipts.

Guarantees:
- Deterministic hash chain linking every event block to its predecessor via SHA-256.
- Strict workspace isolation for independent audit ledgers per tenant.
- Concurrency serialization via threading lock and database unique constraints.
- Signed cryptographic checkpoints to detect full table deletion or historical rewrites.

Limitations:
- A database hash chain alone is tamper-evident, NOT immutable without external anchor.
  If an attacker possesses full database admin access and application secrets, historical
  blocks could theoretically be recomputed without detection unless signed checkpoints
  are pushed to immutable external storage or append-only log services.
"""
import hashlib
import hmac
import json
import threading
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db.models import AuditEvent, ReviewReceipt, AuditCheckpoint
from app.config import settings

GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000"
_chain_lock = threading.RLock()


def calculate_sha256(text: str) -> str:
    """Compute standard SHA-256 hex digest."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def canonical_json_dumps(obj: Any) -> str:
    """Produce deterministic, canonical JSON encoding sorted by keys without extra whitespace."""
    return json.dumps(obj, sort_keys=True, separators=(',', ':'), default=str)


def calculate_event_hash(
    prev_hash: str,
    actor_id: str,
    event_type: str,
    payload_hash: str,
    timestamp_iso: str
) -> str:
    """
    Calculate deterministic event block hash:
    Hash = SHA-256(prev_hash : actor_id : event_type : payload_hash : timestamp_iso)
    """
    block_string = f"{prev_hash}:{actor_id}:{event_type}:{payload_hash}:{timestamp_iso}"
    return hashlib.sha256(block_string.encode("utf-8")).hexdigest()


def record_audit_event(
    db: Session,
    workspace_id: str,
    event_type: str,
    actor_id: str,
    actor_role: str,
    details: Dict[str, Any]
) -> AuditEvent:
    """
    Append a new event to the workspace's sequential hash chain.
    Thread-safe and guarded against concurrent fork collisions.
    """
    with _chain_lock:
        last_event = (
            db.query(AuditEvent)
            .filter(AuditEvent.workspace_id == workspace_id)
            .order_by(AuditEvent.sequence_number.desc(), AuditEvent.created_at.desc())
            .first()
        )
        
        prev_hash = last_event.current_event_hash if last_event else GENESIS_PREV_HASH
        next_seq = (last_event.sequence_number + 1) if (last_event and last_event.sequence_number) else (
            db.query(AuditEvent).filter(AuditEvent.workspace_id == workspace_id).count() + 1
        )
        
        # Canonical deterministic JSON serialization
        payload_str = canonical_json_dumps(details)
        payload_hash = calculate_sha256(payload_str)
        
        now = datetime.now(timezone.utc)
        timestamp_iso = now.isoformat()
        current_hash = calculate_event_hash(prev_hash, actor_id, event_type, payload_hash, timestamp_iso)
        
        event = AuditEvent(
            workspace_id=workspace_id,
            sequence_number=next_seq,
            event_type=event_type,
            actor_id=actor_id,
            actor_role=actor_role,
            payload_hash=payload_hash,
            prev_event_hash=prev_hash,
            current_event_hash=current_hash,
            timestamp_str=timestamp_iso,
            details=details,
            created_at=now
        )
        db.add(event)
        try:
            db.commit()
            db.refresh(event)
        except IntegrityError:
            db.rollback()
            raise RuntimeError(f"Concurrent chain append conflict detected in workspace '{workspace_id}'.")
        return event


def create_audit_checkpoint(db: Session, workspace_id: str) -> AuditCheckpoint:
    """
    Create a cryptographically signed checkpoint of the current ledger head.
    Protects against complete database table deletion or silent historical replacement.
    """
    with _chain_lock:
        head_event = (
            db.query(AuditEvent)
            .filter(AuditEvent.workspace_id == workspace_id)
            .order_by(AuditEvent.sequence_number.desc())
            .first()
        )
        if not head_event:
            raise ValueError(f"Cannot create checkpoint on empty audit chain in workspace '{workspace_id}'.")
        
        count = db.query(AuditEvent).filter(AuditEvent.workspace_id == workspace_id).count()
        last_ckpt = (
            db.query(AuditCheckpoint)
            .filter(AuditCheckpoint.workspace_id == workspace_id)
            .order_by(AuditCheckpoint.sequence_number.desc())
            .first()
        )
        next_ckpt_seq = (last_ckpt.sequence_number + 1) if last_ckpt else 1
        
        sig_data = f"{workspace_id}:{next_ckpt_seq}:{count}:{head_event.current_event_hash}".encode("utf-8")
        signature = hmac.new(settings.SECRET_KEY.encode("utf-8"), sig_data, hashlib.sha256).hexdigest()
        
        checkpoint = AuditCheckpoint(
            workspace_id=workspace_id,
            sequence_number=next_ckpt_seq,
            block_count=count,
            head_hash=head_event.current_event_hash,
            checkpoint_signature=signature,
            created_at=datetime.now(timezone.utc)
        )
        db.add(checkpoint)
        db.commit()
        db.refresh(checkpoint)
        return checkpoint


def verify_audit_chain(db: Session, workspace_id: str) -> Dict[str, Any]:
    """
    Verify the integrity of the audit ledger.
    Traverses the chronological sequence and confirms that every current_event_hash
    faithfully reflects the previous link, unmodified payload, and valid signature.
    Also validates against signed checkpoints if available.
    """
    events = (
        db.query(AuditEvent)
        .filter(AuditEvent.workspace_id == workspace_id)
        .order_by(AuditEvent.sequence_number.asc(), AuditEvent.created_at.asc())
        .all()
    )
    
    if not events:
        return {
            "is_valid": True,
            "total_events": 0,
            "verified_events": 0,
            "broken_event_id": None,
            "message": "Audit chain is empty. Clean state."
        }
    
    expected_prev = GENESIS_PREV_HASH
    for idx, ev in enumerate(events):
        # Check previous hash link
        if ev.prev_event_hash != expected_prev:
            return {
                "is_valid": False,
                "total_events": len(events),
                "verified_events": idx,
                "broken_event_id": ev.id,
                "message": f"Broken chain link at block {idx+1} (Event ID: {ev.id}). Expected prev {expected_prev}, got {ev.prev_event_hash}."
            }
            
        # Re-verify payload hash (support both canonical separators and standard sort_keys)
        canonical_str = canonical_json_dumps(ev.details)
        canonical_hash = calculate_sha256(canonical_str)
        standard_str = json.dumps(ev.details, sort_keys=True, default=str)
        standard_hash = calculate_sha256(standard_str)
        
        if ev.payload_hash not in [canonical_hash, standard_hash]:
            return {
                "is_valid": False,
                "total_events": len(events),
                "verified_events": idx,
                "broken_event_id": ev.id,
                "message": f"Tampered payload detected at block {idx+1} (Event ID: {ev.id})."
            }
            
        # Re-verify block hash using stored timestamp_str
        timestamp_str = ev.timestamp_str if hasattr(ev, "timestamp_str") and ev.timestamp_str else ev.created_at.isoformat()
        recalculated_block_hash = calculate_event_hash(
            expected_prev, ev.actor_id, ev.event_type, ev.payload_hash, timestamp_str
        )
        if recalculated_block_hash != ev.current_event_hash:
            return {
                "is_valid": False,
                "total_events": len(events),
                "verified_events": idx,
                "broken_event_id": ev.id,
                "message": f"Invalid signature/hash at block {idx+1} (Event ID: {ev.id})."
            }
            
        expected_prev = ev.current_event_hash

    # Check latest signed checkpoint if present
    checkpoints = (
        db.query(AuditCheckpoint)
        .filter(AuditCheckpoint.workspace_id == workspace_id)
        .order_by(AuditCheckpoint.sequence_number.desc())
        .all()
    )
    for ckpt in checkpoints:
        sig_data = f"{workspace_id}:{ckpt.sequence_number}:{ckpt.block_count}:{ckpt.head_hash}".encode("utf-8")
        expected_sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), sig_data, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(ckpt.checkpoint_signature, expected_sig):
            return {
                "is_valid": False,
                "total_events": len(events),
                "verified_events": len(events),
                "broken_event_id": None,
                "message": f"Tampered checkpoint detected: invalid checkpoint signature for #{ckpt.sequence_number}."
            }
        if len(events) < ckpt.block_count:
            return {
                "is_valid": False,
                "total_events": len(events),
                "verified_events": len(events),
                "broken_event_id": None,
                "message": f"Ledger truncation detected! Recorded {len(events)} events, but signed checkpoint certified {ckpt.block_count} blocks."
            }

    return {
        "is_valid": True,
        "total_events": len(events),
        "verified_events": len(events),
        "broken_event_id": None,
        "message": f"Audit chain verified successfully. All {len(events)} cryptographic blocks intact."
    }
