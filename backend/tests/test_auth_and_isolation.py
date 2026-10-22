import pytest
from datetime import timedelta
from app.db.models import Workspace, User, ContentSubmission, ContentVersion
from app.core.security import create_access_token, hash_password

def get_auth_headers(user_id: str, email: str, role: str, workspace_id: str) -> dict:
    token = create_access_token({'sub': user_id, 'email': email, 'role': role, 'workspace_id': workspace_id})
    return {'Authorization': f'Bearer {token}'}

def test_login_success_and_jwt_claims(client, db_session):
    res = client.post('/api/v1/auth/login', json={'email': 'creator@apexdynamics.example', 'password': 'Password123!'})
    assert res.status_code == 200
    data = res.json()
    assert 'access_token' in data
    assert data['role'] == 'CREATOR'
    assert data['workspace_id'] == 'ws-apexdynamics-001'

def test_login_invalid_password_rejected(client):
    res = client.post('/api/v1/auth/login', json={'email': 'creator@apexdynamics.example', 'password': 'WrongPassword!'})
    assert res.status_code == 401
    assert 'Incorrect email or password' in res.json()['detail']

def test_protected_routes_reject_unauthenticated(client):
    res_me = client.get('/api/v1/auth/me')
    assert res_me.status_code == 401
    res_facts = client.get('/api/v1/facts')
    assert res_facts.status_code == 401
    res_submissions = client.get('/api/v1/reviews/submissions')
    assert res_submissions.status_code == 401
    res_queue = client.get('/api/v1/approvals/queue')
    assert res_queue.status_code == 401

def test_protected_routes_reject_invalid_token(client):
    res = client.get('/api/v1/auth/me', headers={'Authorization': 'Bearer forged-fake-token-12345'})
    assert res.status_code == 401

def test_registration_prevents_role_escalation(client):
    res = client.post('/api/v1/auth/register', json={'email': 'attacker@external.com', 'full_name': 'Privilege Attacker', 'password': 'HackerPassword123!', 'role': 'ADMIN'})
    assert res.status_code == 200
    data = res.json()
    assert data['role'] == 'CREATOR'

def test_role_enforcement_approvals(client):
    creator_headers = get_auth_headers('usr-creator-01', 'creator@apexdynamics.io', 'CREATOR', 'ws-apexdynamics-001')
    approver_headers = get_auth_headers('usr-approver-01', 'approver@apexdynamics.io', 'APPROVER', 'ws-apexdynamics-001')
    res_queue_creator = client.get('/api/v1/approvals/queue', headers=creator_headers)
    assert res_queue_creator.status_code == 403
    res_queue_approver = client.get('/api/v1/approvals/queue', headers=approver_headers)
    assert res_queue_approver.status_code == 200

def test_admin_only_role_modification(client, db_session):
    creator_headers = get_auth_headers('usr-creator-01', 'creator@apexdynamics.io', 'CREATOR', 'ws-apexdynamics-001')
    admin_headers = get_auth_headers('usr-admin-01', 'admin@apexdynamics.io', 'ADMIN', 'ws-apexdynamics-001')
    res_creator = client.put('/api/v1/auth/users/usr-creator-01/role', headers=creator_headers, json={'role': 'ADMIN'})
    assert res_creator.status_code == 403
    res_admin = client.put('/api/v1/auth/users/usr-creator-01/role', headers=admin_headers, json={'role': 'AUTHORISED_REVIEWER'})
    assert res_admin.status_code == 200
    assert res_admin.json()['role'] == 'AUTHORISED_REVIEWER'

def test_cross_workspace_isolation(client, db_session):
    ws2 = Workspace(id='ws-competitor-002', name='Competitor Corp', slug='competitor')
    db_session.add(ws2)
    user_ws2 = User(id='usr-comp-01', workspace_id=ws2.id, email='dev@competitor.com', full_name='Competitor User', role='CREATOR', hashed_password=hash_password('Pass123!'), is_active=True)
    db_session.add(user_ws2)
    sub_ws2 = ContentSubmission(id='sub-secret-002', workspace_id=ws2.id, creator_id=user_ws2.id, title='Super Confidential Competitor Launch', content_type='TEXT', current_status='SUBMITTED')
    db_session.add(sub_ws2)
    db_session.commit()
    apex_headers = get_auth_headers('usr-creator-01', 'creator@apexdynamics.io', 'CREATOR', 'ws-apexdynamics-001')
    res_detail = client.get(f'/api/v1/reviews/submissions/{sub_ws2.id}', headers=apex_headers)
    assert res_detail.status_code == 404
    res_list = client.get('/api/v1/reviews/submissions', headers=apex_headers)
    assert res_list.status_code == 200
    submissions = res_list.json()
    submission_ids = [s['id'] for s in submissions]
    assert sub_ws2.id not in submission_ids
    apex_approver_headers = get_auth_headers('usr-approver-01', 'approver@apexdynamics.io', 'APPROVER', 'ws-apexdynamics-001')
    res_approve = client.post(f'/api/v1/approvals/{sub_ws2.id}', headers=apex_approver_headers, json={'decision': 'APPROVED'})
    assert res_approve.status_code == 404
