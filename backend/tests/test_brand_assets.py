"""Automated Tests for Brand Asset Management System.
Validates multi-tenant isolation, file upload, SVG sanitization, approval lifecycles,
WCAG color contrast calculations, search/filtering, and deterministic logo audits.
"""
import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.seed.synthetic_brand import WORKSPACE_ID
from app.db.models import BrandAsset, Workspace, User


@pytest.fixture
def creator_headers():
    token = create_access_token(data={
        "sub": "usr-creator-01",
        "email": "creator@canon.example",
        "role": "CREATOR",
        "workspace_id": WORKSPACE_ID
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def manager_headers():
    token = create_access_token(data={
        "sub": "usr-manager-01",
        "email": "manager@canon.example",
        "role": "BRAND_MANAGER",
        "workspace_id": WORKSPACE_ID
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def reviewer_headers():
    token = create_access_token(data={
        "sub": "usr-reviewer-01",
        "email": "reviewer@canon.example",
        "role": "AUTHORISED_REVIEWER",
        "workspace_id": WORKSPACE_ID
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def competitor_headers(db_session):
    ws = Workspace(id="ws-competitor-999", name="Competitor", slug="competitor-test")
    db_session.add(ws)
    usr = User(
        id="usr-foreign-01",
        workspace_id="ws-competitor-999",
        email="user@competitor.example",
        full_name="Competitor User",
        role="CREATOR",
        hashed_password="hashed_pass",
        is_active=True
    )
    db_session.add(usr)
    db_session.commit()
    token = create_access_token(data={
        "sub": "usr-foreign-01",
        "email": "user@competitor.example",
        "role": "CREATOR",
        "workspace_id": "ws-competitor-999"
    })
    return {"Authorization": f"Bearer {token}"}



def test_empty_workspace_returns_empty_assets(client: TestClient, competitor_headers):
    """An empty or new workspace returns 0 assets and accurate stats."""
    res = client.get("/api/v1/assets", headers=competitor_headers)
    assert res.status_code == 200
    assert res.json() == []

    stats_res = client.get("/api/v1/assets/stats", headers=competitor_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_assets"] == 0
    assert stats["approved_assets"] == 0
    assert stats["pending_approval"] == 0


def test_upload_valid_logo_png(client: TestClient, creator_headers):
    """Creator uploads a 400x100 PNG logo (4:1 ratio); sets status to PENDING_APPROVAL and extracts metadata."""
    img = Image.new("RGB", (400, 100), color=(200, 117, 57))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()

    response = client.post(
        "/api/v1/assets",
        headers=creator_headers,
        data={
            "name": "Official Horizontal Brandmark",
            "category": "LOGOS",
            "description": "Primary 4:1 horizontal logo lockup.",
            "intended_usage": "Light backgrounds and digital headers",
            "version": "1.0.0"
        },
        files={"file": ("master_logo.png", png_bytes, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Official Horizontal Brandmark"
    assert data["category"] == "LOGOS"
    assert data["status"] == "PENDING_APPROVAL"  # Creators require approval
    assert data["file_format"] == "PNG"
    assert data["metadata_json"]["width"] == 400
    assert data["metadata_json"]["height"] == 100
    assert data["metadata_json"]["aspect_ratio"] == 4.0


def test_upload_sanitizes_svg_xss(client: TestClient, manager_headers):
    """Uploaded SVG containing script tags and event handlers must be sanitized before saving."""
    malicious_svg = b'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <script>alert("XSS")</script>
        <circle cx="50" cy="50" r="40" fill="red" onload="alert(1)"/>
    </svg>'''

    res = client.post(
        "/api/v1/assets",
        headers=manager_headers,
        data={
            "name": "Vector Icon Mark",
            "category": "LOGOS",
            "description": "Scalable SVG brandmark."
        },
        files={"file": ("vector_mark.svg", malicious_svg, "image/svg+xml")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "APPROVED"  # Brand managers auto-approved

    # Download file and check that <script> and onload were removed
    asset_id = data["id"]
    dl = client.get(f"/api/v1/assets/{asset_id}/download", headers=manager_headers)
    assert dl.status_code == 200
    dl_content = dl.content.decode("utf-8")
    assert "<script>" not in dl_content
    assert "onload=" not in dl_content
    assert "circle" in dl_content


def test_upload_invalid_extension_rejected(client: TestClient, creator_headers):
    """Uploading executables or dangerous extensions is rejected."""
    bad_bytes = b"echo 'hack'"
    res = client.post(
        "/api/v1/assets",
        headers=creator_headers,
        data={"name": "Script File", "category": "OTHER"},
        files={"file": ("malicious.sh", bad_bytes, "application/x-sh")}
    )
    assert res.status_code == 400
    assert "Unsupported file format" in res.json()["detail"]


def test_add_brand_color_with_wcag(client: TestClient, manager_headers):
    """Registering a brand color calculates WCAG contrast ratios and assigns AAA/AA ratings."""
    res = client.post(
        "/api/v1/assets/color",
        headers=manager_headers,
        json={
            "name": "Brand Terracotta",
            "hex": "#C87539",
            "role": "Primary",
            "intended_usage": "Core brand signature on cards and headers"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["category"] == "COLORS"
    assert data["status"] == "APPROVED"
    assert data["metadata_json"]["hex"] == "#C87539"
    assert "contrast_on_white" in data["metadata_json"]
    assert "wcag_rating" in data["metadata_json"]


def test_approval_and_rejection_lifecycle(client: TestClient, creator_headers, manager_headers):
    """Brand Manager can review, approve, or reject assets with reasons."""
    # 1. Creator uploads draft guideline
    pdf_bytes = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"
    up_res = client.post(
        "/api/v1/assets",
        headers=creator_headers,
        data={"name": "Identity Manual Draft", "category": "GUIDELINES"},
        files={"file": ("draft_guide.pdf", pdf_bytes, "application/pdf")}
    )
    assert up_res.status_code == 200
    asset_id = up_res.json()["id"]
    assert up_res.json()["status"] == "PENDING_APPROVAL"

    # 2. Creator CANNOT approve asset (RBAC enforcement)
    fake_approve = client.post(
        f"/api/v1/assets/{asset_id}/approval",
        headers=creator_headers,
        json={"decision": "APPROVED"}
    )
    assert fake_approve.status_code == 403

    # 3. Manager rejects with reason
    rej = client.post(
        f"/api/v1/assets/{asset_id}/approval",
        headers=manager_headers,
        json={"decision": "REJECTED", "reason": "Requires legal copyright notice on page 2."}
    )
    assert rej.status_code == 200
    assert rej.json()["status"] == "REJECTED"
    assert rej.json()["rejection_reason"] == "Requires legal copyright notice on page 2."

    # 4. Manager later approves
    appr = client.post(
        f"/api/v1/assets/{asset_id}/approval",
        headers=manager_headers,
        json={"decision": "APPROVED"}
    )
    assert appr.status_code == 200
    assert appr.json()["status"] == "APPROVED"


def test_multi_tenant_workspace_isolation(client: TestClient, manager_headers, competitor_headers):
    """User from another workspace CANNOT view, download, or edit assets from caller's workspace."""
    # 1. Create asset in primary workspace
    res = client.post(
        "/api/v1/assets/color",
        headers=manager_headers,
        json={"name": "Confidential Brand Tone", "hex": "#1E1B4B", "role": "Accent"}
    )
    asset_id = res.json()["id"]

    # 2. Competitor attempts to view -> 404
    foreign_get = client.get(f"/api/v1/assets/{asset_id}", headers=competitor_headers)
    assert foreign_get.status_code == 404

    # 3. Competitor attempts to update -> 404
    foreign_put = client.put(
        f"/api/v1/assets/{asset_id}",
        headers=competitor_headers,
        json={"name": "Hijacked Name"}
    )
    assert foreign_put.status_code == 404


def test_audit_logo_endpoint(client: TestClient, manager_headers):
    """Running logo audit detects aspect ratio and returns deterministic compliance findings."""
    img = Image.new("RGB", (600, 100), color=(249, 115, 22))  # 6:1 ratio vs required ~3.125:1
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()

    up = client.post(
        "/api/v1/assets",
        headers=manager_headers,
        data={"name": "Distorted Banner Logo", "category": "LOGOS"},
        files={"file": ("wide_logo.png", png_bytes, "image/png")}
    )
    asset_id = up.json()["id"]

    audit_res = client.post(f"/api/v1/assets/{asset_id}/audit-logo", headers=manager_headers)
    assert audit_res.status_code == 200
    data = audit_res.json()
    assert data["aspect_ratio"] == 6.0
    assert "visual_findings" in data
    findings = [f["rule_code"] for f in data["visual_findings"]]
    assert "LOGO-RATIO" in findings


def test_authorised_reviewer_can_approve_asset(client: TestClient, creator_headers, reviewer_headers):
    """AUTHORISED_REVIEWER role can approve brand assets and generate cryptographic verification receipts."""
    # 1. Creator uploads pending asset
    res = client.post(
        "/api/v1/assets",
        headers=creator_headers,
        data={"name": "Social Campaign Icon", "category": "MARKETING"}
    )
    assert res.status_code == 200
    asset_id = res.json()["id"]
    assert res.json()["status"] == "PENDING_APPROVAL"

    # 2. Authorised Reviewer approves
    appr = client.post(
        f"/api/v1/assets/{asset_id}/approval",
        headers=reviewer_headers,
        json={"decision": "APPROVED"}
    )
    assert appr.status_code == 200
    data = appr.json()
    assert data["status"] == "APPROVED"
    assert "receipt_id" in data["metadata_json"]
    assert "approval_hash" in data["metadata_json"]
    assert data["metadata_json"]["receipt_id"].startswith("RCPT-ASSET-")


def test_approvals_module_asset_queue(client: TestClient, creator_headers, reviewer_headers):
    """Approvals endpoint /api/v1/approvals/assets returns pending assets and allows signing."""
    # 1. Upload pending asset
    res = client.post(
        "/api/v1/assets",
        headers=creator_headers,
        data={"name": "Typography Guidelines", "category": "TYPOGRAPHY"}
    )
    asset_id = res.json()["id"]

    # 2. Retrieve queue in Approvals module
    q_res = client.get("/api/v1/approvals/assets", headers=reviewer_headers)
    assert q_res.status_code == 200
    queue = q_res.json()
    assert any(a["id"] == asset_id for a in queue)

    # 3. Sign asset from Approvals module
    sign_res = client.post(
        f"/api/v1/approvals/assets/{asset_id}",
        headers=reviewer_headers,
        json={"decision": "APPROVED"}
    )
    assert sign_res.status_code == 200
    assert sign_res.json()["status"] == "APPROVED"
    assert sign_res.json()["receipt_id"].startswith("RCPT-ASSET-")
