import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.core.security import create_access_token, hash_password
from app.db.models import Workspace, User
from app.seed.synthetic_brand import WORKSPACE_ID

@pytest.fixture
def auth_tokens():
    creator_token = create_access_token({'sub': 'usr-creator-01', 'email': 'creator@apexdynamics.example', 'role': 'CREATOR', 'workspace_id': WORKSPACE_ID})
    approver_token = create_access_token({'sub': 'usr-approver-01', 'email': 'approver@apexdynamics.example', 'role': 'APPROVER', 'workspace_id': WORKSPACE_ID})
    manager_token = create_access_token({'sub': 'usr-manager-01', 'email': 'manager@apexdynamics.example', 'role': 'BRAND_MANAGER', 'workspace_id': WORKSPACE_ID})
    return {'creator': {'Authorization': f'Bearer {creator_token}'}, 'approver': {'Authorization': f'Bearer {approver_token}'}, 'manager': {'Authorization': f'Bearer {manager_token}'}}

def test_full_e2e_acceptance_lifecycle(client: TestClient, db_session, auth_tokens):
    res = client.get('/api/v1/rulebooks', headers=auth_tokens['creator'])
    assert res.status_code == 200
    rulebook = res.json()
    assert rulebook['rules_count'] > 0
    fact_payload = {'fact_code': 'FACT-ACCEPTANCE-2026', 'subject': 'Platform Latency', 'approved_statement': 'ApexDynamics guarantees 28ms median latency across all clusters.', 'source_document': 'Platform Benchmarks 2026', 'source_quote': 'Guaranteed median latency is 28ms.', 'owner_name': 'Elena Rostova', 'owner_email': 'manager@apexdynamics.example', 'valid_until': '2028-12-31T23:59:59Z'}
    res = client.post('/api/v1/facts', headers=auth_tokens['manager'], json=fact_payload)
    assert res.status_code == 200
    bad_content = 'Migrate your enterprise clusters to Apex Cloud today. ApexDynamics guarantees 100% unbreakable uptime and infinite throughput. For more details, click here to get started.'
    res = client.post('/api/v1/reviews/run', headers=auth_tokens['creator'], data={'title': 'Q3 Enterprise Campaign', 'content_text': bad_content})
    assert res.status_code == 200
    review_data = res.json()
    findings = review_data['findings']
    rule_codes = [f['rule_code'] for f in findings]
    assert 'TERM-01' in rule_codes
    assert 'A11Y-LINK-TEXT' in rule_codes
    term_finding = next((f for f in findings if f['rule_code'] == 'TERM-01'))
    assert term_finding['severity'] == 'BLOCKING'
    assert term_finding['source_quote'] is not None
    assert term_finding['matched_text'] == 'Apex Cloud'
    assert term_finding['verification_status'] == 'VERIFIED'
    assert review_data['suggested_full_text'] is not None
    assert 'Apex Cloud' not in review_data['suggested_full_text']
    clean_content = 'Migrate your enterprise clusters to Apex Core today. ApexDynamics guarantees an infrastructure uptime SLA of 99.98% across all multi-region clusters. Visit our documentation portal to get started.'
    res = client.post('/api/v1/reviews/run', headers=auth_tokens['creator'], data={'title': 'Q3 Enterprise Campaign (Revised)', 'content_text': clean_content})
    assert res.status_code == 200
    clean_data = res.json()
    clean_sub_id = clean_data['submission_id']
    blocking_findings = [f for f in clean_data['findings'] if f['severity'] == 'BLOCKING']
    assert len(blocking_findings) == 0
    res = client.post(f'/api/v1/approvals/{clean_sub_id}', headers=auth_tokens['creator'], json={'decision': 'APPROVED', 'reason': 'Self-approval'})
    assert res.status_code == 403
    res = client.post(f'/api/v1/approvals/{clean_sub_id}', headers=auth_tokens['approver'], json={'decision': 'APPROVED', 'reason': 'Verified and compliance confirmed.'})
    assert res.status_code == 200
    receipt = res.json()
    assert receipt['decision'] == 'APPROVED'
    assert receipt['receipt_id'] is not None
    assert receipt['content_hash'] is not None
    receipt_res = client.get(f"/api/v1/audit/receipt/{receipt['receipt_id']}", headers=auth_tokens['creator'])
    assert receipt_res.status_code == 200
    assert receipt_res.json()['final_verdict'] == 'APPROVED'
    res = client.get('/api/v1/audit/verify', headers=auth_tokens['creator'])
    assert res.status_code == 200
    audit_data = res.json()
    assert audit_data['is_valid'] is True
    assert audit_data['verified_events'] > 0
    tenant_ws = Workspace(id='ws-other-tenant-777', name='Other Tenant', slug='other-tenant')
    db_session.add(tenant_ws)
    tenant_user = User(id='usr-other-tenant-777', workspace_id=tenant_ws.id, email='tenant@other.example', hashed_password=hash_password('Password123!'), full_name='Other Tenant', role='CREATOR', is_active=True)
    db_session.add(tenant_user)
    db_session.commit()
    other_token = create_access_token({'sub': tenant_user.id, 'email': tenant_user.email, 'role': tenant_user.role, 'workspace_id': tenant_ws.id})
    res = client.get(f'/api/v1/reviews/submissions/{clean_sub_id}', headers={'Authorization': f'Bearer {other_token}'})
    assert res.status_code in [403, 404]
    img = Image.new('RGB', (600, 100), color=(249, 115, 22))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    logo_bytes = buf.getvalue()
    res = client.post('/api/v1/reviews/run', headers=auth_tokens['creator'], data={'title': 'Distorted Logo'}, files={'file': ('test_logo.png', logo_bytes, 'image/png')})
    assert res.status_code == 200
    visual_codes = [f['rule_code'] for f in res.json()['findings']]
    assert 'LOGO-RATIO' in visual_codes
