import pytest
from app.core.audit_chain import record_audit_event, verify_audit_chain
from app.db.models import AuditEvent
from app.seed.synthetic_brand import WORKSPACE_ID

def test_audit_chain_sequential_integrity(db_session):
    record_audit_event(db=db_session, workspace_id=WORKSPACE_ID, event_type='CONTENT_SUBMISSION', actor_id='usr-creator-01', actor_role='CREATOR', details={'submission_id': 'sub-001', 'title': 'Social Campaign Draft'})
    record_audit_event(db=db_session, workspace_id=WORKSPACE_ID, event_type='REVIEW_RUN', actor_id='system-engine', actor_role='SYSTEM', details={'submission_id': 'sub-001', 'findings_count': 2})
    record_audit_event(db=db_session, workspace_id=WORKSPACE_ID, event_type='APPROVAL_DECISION', actor_id='usr-approver-01', actor_role='APPROVER', details={'submission_id': 'sub-001', 'decision': 'APPROVED'})
    result = verify_audit_chain(db_session, WORKSPACE_ID)
    assert result['is_valid'] is True
    assert result['total_events'] >= 4
    assert result['verified_events'] == result['total_events']
    assert result['broken_event_id'] is None

def test_tampered_payload_detected(db_session):
    ev = record_audit_event(db=db_session, workspace_id=WORKSPACE_ID, event_type='APPROVAL_DECISION', actor_id='usr-approver-01', actor_role='APPROVER', details={'decision': 'REJECTED'})
    ev.details = {'decision': 'APPROVED_WITHOUT_AUTHORIZATION'}
    db_session.commit()
    result = verify_audit_chain(db_session, WORKSPACE_ID)
    assert result['is_valid'] is False
    assert result['broken_event_id'] == ev.id
    assert 'Tampered payload detected' in result['message']

def test_concurrent_audit_writes(db_session):
    import concurrent.futures

    def append_event(idx: int):
        record_audit_event(db=db_session, workspace_id=WORKSPACE_ID, event_type='CONCURRENT_ACTION', actor_id=f'usr-worker-{idx}', actor_role='CREATOR', details={'task_index': idx, 'action': f'Concurrent task {idx}'})
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(append_event, i) for i in range(10)]
        for f in concurrent.futures.as_completed(futures):
            f.result()
    result = verify_audit_chain(db_session, WORKSPACE_ID)
    assert result['is_valid'] is True
    assert result['broken_event_id'] is None

def test_signed_checkpoint_creation_and_tamper_detection(db_session):
    from app.core.audit_chain import create_audit_checkpoint
    for i in range(3):
        record_audit_event(db=db_session, workspace_id=WORKSPACE_ID, event_type='MILESTONE_ACTION', actor_id='usr-approver-01', actor_role='APPROVER', details={'step': i})
    ckpt = create_audit_checkpoint(db_session, WORKSPACE_ID)
    assert ckpt.block_count >= 3
    assert ckpt.checkpoint_signature is not None
    initial_check = verify_audit_chain(db_session, WORKSPACE_ID)
    assert initial_check['is_valid'] is True
    last_event = db_session.query(AuditEvent).filter(AuditEvent.workspace_id == WORKSPACE_ID).order_by(AuditEvent.sequence_number.desc()).first()
    db_session.delete(last_event)
    db_session.commit()
    truncated_check = verify_audit_chain(db_session, WORKSPACE_ID)
    assert truncated_check['is_valid'] is False
    assert 'Ledger truncation detected' in truncated_check['message']
