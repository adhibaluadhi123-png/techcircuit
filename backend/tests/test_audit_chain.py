"""Automated Tests for Hash-Chained Audit Ledger."""
import pytest
from app.core.audit_chain import record_audit_event, verify_audit_chain
from app.db.models import AuditEvent
from app.seed.synthetic_brand import WORKSPACE_ID

def test_audit_chain_sequential_integrity(db_session):
    """Appending multiple events builds a verifiable cryptographic chain."""
    record_audit_event(
        db=db_session,
        workspace_id=WORKSPACE_ID,
        event_type="CONTENT_SUBMISSION",
        actor_id="usr-creator-01",
        actor_role="CREATOR",
        details={"submission_id": "sub-001", "title": "Social Campaign Draft"}
    )
    record_audit_event(
        db=db_session,
        workspace_id=WORKSPACE_ID,
        event_type="REVIEW_RUN",
        actor_id="system-engine",
        actor_role="SYSTEM",
        details={"submission_id": "sub-001", "findings_count": 2}
    )
    record_audit_event(
        db=db_session,
        workspace_id=WORKSPACE_ID,
        event_type="APPROVAL_DECISION",
        actor_id="usr-approver-01",
        actor_role="APPROVER",
        details={"submission_id": "sub-001", "decision": "APPROVED"}
    )
    
    result = verify_audit_chain(db_session, WORKSPACE_ID)
    assert result["is_valid"] is True
    assert result["total_events"] >= 4  # 1 genesis + 3 appended
    assert result["verified_events"] == result["total_events"]
    assert result["broken_event_id"] is None

def test_tampered_payload_detected(db_session):
    """
    CRITICAL SECURITY TEST:
    If an attacker or corrupted process modifies the payload or details of a past event,
    verify_audit_chain MUST detect the tampering immediately.
    """
    ev = record_audit_event(
        db=db_session,
        workspace_id=WORKSPACE_ID,
        event_type="APPROVAL_DECISION",
        actor_id="usr-approver-01",
        actor_role="APPROVER",
        details={"decision": "REJECTED"}
    )
    
    # Tamper with the event details directly in the database
    ev.details = {"decision": "APPROVED_WITHOUT_AUTHORIZATION"}
    db_session.commit()
    
    result = verify_audit_chain(db_session, WORKSPACE_ID)
    assert result["is_valid"] is False
    assert result["broken_event_id"] == ev.id
    assert "Tampered payload detected" in result["message"]
