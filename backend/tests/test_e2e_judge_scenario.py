import pytest
from app.db.session import SessionLocal
from app.seed.synthetic_brand import WORKSPACE_ID
from app.db.models import Rulebook, Fact, ContentSubmission, ContentVersion, Finding
from app.core.citation import CitationVerifier
from app.core.intent_lock import intent_lock
from app.core.claim_ledger import claim_ledger
from app.core.audit_chain import verify_audit_chain, record_audit_event
from app.core.deterministic import check_terminology_rules

@pytest.mark.asyncio
async def test_complete_judge_demo_flow(db_session):
    rulebook = db_session.query(Rulebook).filter(Rulebook.workspace_id == WORKSPACE_ID).first()
    assert rulebook is not None
    assert rulebook.version == '1.0.0'
    stale_fact = db_session.query(Fact).filter(Fact.fact_code == 'FACT-CUST-2025').first()
    assert stale_fact is not None
    demo_content = 'Migrate your enterprise workloads to Apex Cloud today. Apex Dynamics is the undisputed fastest platform in the world for machine learning inference. Visit our portal to sign up for an evaluation.'
    intent_card = await intent_lock.build_intent_card(demo_content)
    assert intent_card['call_to_action'] is not None
    assert any((term in intent_card['call_to_action'].lower() for term in ['portal', 'sign up', 'migrate', 'visit', 'evaluation']))
    rules_data = [{'id': r.id, 'rule_code': r.rule_code, 'category': r.category, 'severity': r.severity, 'enforcement_type': r.enforcement_type, 'source_quote': r.source_quote, 'source_section': r.source_section, 'description': r.description, 'fail_example': r.fail_example, 'pass_example': r.pass_example} for r in rulebook.rules]
    det_findings = check_terminology_rules(demo_content, rules_data)
    assert len(det_findings) >= 1
    term_finding = next((f for f in det_findings if f['rule_code'] == 'TERM-01'))
    assert term_finding['matched_text'] == 'Apex Cloud'
    assert term_finding['severity'] == 'BLOCKING'
    claims = await claim_ledger.extract_claims(demo_content)
    verified_claims = claim_ledger.verify_claims_against_vault(db_session, WORKSPACE_ID, claims)
    superlative_claim = next((c for c in verified_claims if c['claim_type'] == 'SUPERLATIVE'), None)
    assert superlative_claim is not None
    assert superlative_claim['status'] == 'NEEDS_PROOF'
    verifier = CitationVerifier(db_session)
    verified_findings = verifier.verify_all(det_findings, rulebook.id, demo_content)
    assert verified_findings[0]['verification_status'] == 'VERIFIED'
    assert verified_findings[0]['source_quote'] is not None
    diff_res = intent_lock.generate_minimal_suggestion(demo_content, verified_findings)
    assert 'Apex Core' in diff_res['suggested_text']
    assert 'Apex Cloud' not in diff_res['suggested_text']
    assert 'Visit our portal to sign up' in diff_res['suggested_text']
    preservation = intent_lock.verify_intent_preservation(demo_content, diff_res['suggested_text'], intent_card)
    assert preservation['status'] == 'PASSED'
    assert preservation['cta_preserved'] is True
    record_audit_event(db=db_session, workspace_id=WORKSPACE_ID, event_type='DEMO_JUDGE_REVIEW_COMPLETE', actor_id='usr-approver-01', actor_role='APPROVER', details={'content_hash': 'sha256-verified', 'findings_count': len(verified_findings), 'verdict': 'APPROVED'})
    audit_check = verify_audit_chain(db_session, WORKSPACE_ID)
    assert audit_check['is_valid'] is True
    assert audit_check['verified_events'] >= 2
