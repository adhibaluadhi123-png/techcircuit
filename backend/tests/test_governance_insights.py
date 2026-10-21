"""Automated Tests for Governance Insights & Metrics.
Verifies real workspace-scoped metrics, genuine empty states, and absence of synthetic data fabrication.
"""
import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, hash_password
from app.db.models import Workspace, User, ProposedAmendment, Rule
from app.seed.synthetic_brand import WORKSPACE_ID


@pytest.fixture
def manager_headers():
    token = create_access_token(data={
        "sub": "usr-manager-01",
        "email": "manager@apexdynamics.example",
        "role": "BRAND_MANAGER",
        "workspace_id": WORKSPACE_ID
    })
    return {"Authorization": f"Bearer {token}"}


def test_governance_insights_for_primary_workspace(client: TestClient, manager_headers):
    """Calling /api/v1/governance/insights returns authentic metrics for active workspace."""
    response = client.get("/api/v1/governance/insights", headers=manager_headers)
    assert response.status_code == 200
    data = response.json()

    # Response schema check
    assert "total_reviews" in data
    assert "passed_reviews" in data
    assert "blocking_findings_count" in data
    assert "findings_by_category" in data
    assert "frequently_overridden_rules" in data
    assert "proposed_amendments" in data
    assert "stale_claims_detected" in data
    assert "ambiguous_rules_count" in data

    # Verify no fabricated override counts when none exist
    for rule in data["frequently_overridden_rules"]:
        assert rule["override_count"] > 0


def test_governance_insights_isolated_empty_workspace(client: TestClient, db_session):
    """An empty, newly created workspace must return genuine zeros and empty arrays."""
    isolated_ws = Workspace(
        id="ws-empty-governance-001",
        name="Empty Workspace",
        slug="empty-ws"
    )
    db_session.add(isolated_ws)

    isolated_user = User(
        id="usr-isolated-mgr",
        workspace_id=isolated_ws.id,
        email="mgr@isolated.example",
        hashed_password=hash_password("Password123!"),
        full_name="Isolated Manager",
        role="BRAND_MANAGER",
        is_active=True
    )
    db_session.add(isolated_user)
    db_session.commit()

    token = create_access_token(data={
        "sub": isolated_user.id,
        "email": isolated_user.email,
        "role": isolated_user.role,
        "workspace_id": isolated_ws.id
    })
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/governance/insights", headers=headers)
    assert response.status_code == 200
    data = response.json()

    # True empty state: no leaking from other workspaces
    assert data["total_reviews"] == 0
    assert data["passed_reviews"] == 0
    assert data["exception_reviews"] == 0
    assert data["rejected_reviews"] == 0
    assert data["blocking_findings_count"] == 0
    assert data["advisory_findings_count"] == 0
    assert data["findings_by_category"] == []
    assert data["frequently_overridden_rules"] == []
    assert data["proposed_amendments"] == []
    assert data["stale_claims_detected"] == 0
    assert data["ambiguous_rules_count"] == 0


def test_accept_proposed_amendment_cross_workspace_forbidden(client: TestClient, db_session):
    """User in workspace B cannot accept a proposed amendment belonging to workspace A."""
    # Find an amendment in ws-apexdynamics-001 or create one
    amendment = db_session.query(ProposedAmendment).filter(
        ProposedAmendment.workspace_id == WORKSPACE_ID
    ).first()

    if not amendment:
        rule = db_session.query(Rule).first()
        amendment = ProposedAmendment(
            id="amend-test-001",
            workspace_id=WORKSPACE_ID,
            rule_id=rule.id if rule else "r-1",
            trigger_reason="Test override trigger",
            proposed_change="Updated rule guidance",
            override_count=3,
            status="PENDING"
        )
        db_session.add(amendment)
        db_session.commit()

    # Attacker from another workspace
    attacker_ws = Workspace(id="ws-othercorp-999", name="Other Corp", slug="other-corp")
    db_session.add(attacker_ws)
    attacker_user = User(
        id="usr-attacker-01",
        workspace_id=attacker_ws.id,
        email="attacker@othercorp.example",
        hashed_password=hash_password("Password123!"),
        full_name="Attacker",
        role="BRAND_MANAGER",
        is_active=True
    )
    db_session.add(attacker_user)
    db_session.commit()

    attacker_token = create_access_token(data={
        "sub": attacker_user.id,
        "email": attacker_user.email,
        "role": attacker_user.role,
        "workspace_id": attacker_ws.id
    })
    attacker_headers = {"Authorization": f"Bearer {attacker_token}"}

    # Should 404 because amendment is not in attacker's workspace
    res = client.post(
        f"/api/v1/governance/amendments/{amendment.id}/accept",
        headers=attacker_headers
    )
    assert res.status_code == 404
    assert "Proposed amendment not found" in res.json()["detail"]
