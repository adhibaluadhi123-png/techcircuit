"""Tamper-Evident Hash-Chained Audit Ledger and Review Receipts."""
import hashlib
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.db.models import AuditEvent, ReviewReceipt

GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def calculate_sha256(text: str) -> str:
    """Compute standard SHA-256 hex digest."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def calculate_event_hash(prev_hash: str, actor_id: str, event_type: str, payload_hash: str, timestamp_iso: str) -> str:
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
    """
    last_event = (
        db.query(AuditEvent)
        .filter(AuditEvent.workspace_id == workspace_id)
        .order_by(AuditEvent.created_at.desc())
        .first()
    )
    
    prev_hash = last_event.current_event_hash if last_event else GENESIS_PREV_HASH
    payload_str = json.dumps(details, sort_keys=True, default=str)
    payload_hash = calculate_sha256(payload_str)
    
    now = datetime.now(timezone.utc)
    timestamp_iso = now.isoformat()
    current_hash = calculate_event_hash(prev_hash, actor_id, event_type, payload_hash, timestamp_iso)
    
    event = AuditEvent(
        workspace_id=workspace_id,
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
    db.commit()
    db.refresh(event)
    return event

def verify_audit_chain(db: Session, workspace_id: str) -> Dict[str, Any]:
    """
    Verify the integrity of the audit ledger.
    Traverses the chronological sequence and confirms that every current_event_hash
    faithfully reflects the previous link and unmodified payload.
    """
    events = (
        db.query(AuditEvent)
        .filter(AuditEvent.workspace_id == workspace_id)
        .order_by(AuditEvent.created_at.asc())
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
            
        # Re-verify payload hash
        payload_str = json.dumps(ev.details, sort_keys=True, default=str)
        recalculated_payload_hash = calculate_sha256(payload_str)
        if recalculated_payload_hash != ev.payload_hash:
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

    return {
        "is_valid": True,
        "total_events": len(events),
        "verified_events": len(events),
        "broken_event_id": None,
        "message": f"Audit chain verified successfully. All {len(events)} cryptographic blocks intact."
    }
