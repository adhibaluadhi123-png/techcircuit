"""Automated Tests for File Ingestion Security, Visual Brand Checks, and Accessibility Auditing."""
import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.core.parser import validate_file_signature, parse_uploaded_file
from app.core.visual_audit import analyze_image_asset, audit_text_accessibility
from app.seed.synthetic_brand import WORKSPACE_ID


@pytest.fixture
def creator_headers():
    token = create_access_token(data={
        "sub": "usr-creator-01",
        "email": "creator@apexdynamics.example",
        "role": "CREATOR",
        "workspace_id": WORKSPACE_ID
    })
    return {"Authorization": f"Bearer {token}"}


def test_empty_file_rejected():
    """Empty files (0 bytes) must fail signature validation."""
    with pytest.raises(ValueError, match="empty"):
        validate_file_signature("empty.pdf", b"")


def test_deceptive_executable_disguised_as_pdf_rejected():
    """Binary executables with ELF or MZ headers disguised as .pdf must be rejected."""
    fake_elf = b"\x7fELF\x02\x01\x01\x00malicious binary content"
    with pytest.raises(ValueError, match="Dangerous file signature detected"):
        validate_file_signature("report.pdf", fake_elf)

    fake_pe = b"MZ\x90\x00\x03\x00\x00\x00fake pe exe"
    with pytest.raises(ValueError, match="Dangerous file signature detected"):
        validate_file_signature("manual.docx", fake_pe)


def test_signature_mismatch_rejected():
    """Text files disguised as PDF must fail magic byte signature check."""
    fake_pdf = b"Just plain text without PDF magic bytes header."
    with pytest.raises(ValueError, match="File signature mismatch"):
        validate_file_signature("invoice.pdf", fake_pdf)


def test_binary_null_bytes_in_txt_rejected():
    """Plain text containing binary null bytes must be rejected."""
    bad_txt = b"Hello world\x00\x00\x00binary shellcode"
    with pytest.raises(ValueError, match="Binary content detected"):
        validate_file_signature("notes.txt", bad_txt)


def test_valid_txt_parsing():
    """Clean plain text files are parsed properly."""
    content = b"Apex Core provides unified mission control."
    parsed = parse_uploaded_file("notes.txt", content)
    assert "Apex Core" in parsed


def test_logo_aspect_ratio_distortion_detected():
    """Distorted logo dimensions (e.g. 500x100 = 5:1 ratio vs required 3.125:1) produce LOGO-RATIO finding."""
    # Create an in-memory 500x100 PNG image
    img = Image.new("RGB", (500, 100), color=(249, 115, 22))  # Brand orange
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()

    result = analyze_image_asset(png_bytes, "apex_logo_distorted.png")
    assert result["is_logo"] is True
    assert result["aspect_ratio"] == 5.0
    rule_codes = [f["rule_code"] for f in result["visual_findings"]]
    assert "LOGO-RATIO" in rule_codes


def test_color_palette_distance_and_contrast():
    """Image with neon lime green (off-brand) triggers COLOR-PALETTE-01 finding."""
    # Create an image with an unapproved neon green (#39FF14)
    img = Image.new("RGB", (200, 200), color=(57, 255, 20))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()

    result = analyze_image_asset(png_bytes, "banner.png")
    rule_codes = [f["rule_code"] for f in result["visual_findings"]]
    assert "COLOR-PALETTE-01" in rule_codes


def test_text_accessibility_checks():
    """Copy accessibility check catches ambiguous link text and shouting ALL-CAPS."""
    bad_text = (
        "To get started right away, click here for instructions. "
        "DO NOT FORGET TO BACKUP YOUR DATABASE IMMEDIATELY."
    )
    findings = audit_text_accessibility(bad_text)
    rule_codes = [f["rule_code"] for f in findings]
    assert "A11Y-LINK-TEXT" in rule_codes
    assert "A11Y-ALL-CAPS" in rule_codes


def test_upload_api_with_distorted_logo(client: TestClient, creator_headers):
    """Submitting a distorted logo to /api/v1/reviews/run produces verified visual findings."""
    img = Image.new("RGB", (600, 100), color=(249, 115, 22))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()

    response = client.post(
        "/api/v1/reviews/run",
        headers=creator_headers,
        data={"title": "Distorted Logo Review"},
        files={"file": ("company_logo.png", png_bytes, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    rule_codes = [f["rule_code"] for f in data["findings"]]
    assert "LOGO-RATIO" in rule_codes


def test_oversized_upload_returns_413(client: TestClient, creator_headers, monkeypatch):
    """Uploading a file exceeding MAX_UPLOAD_SIZE_MB raises HTTP 413."""
    from app.config import settings
    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE_MB", 1)  # 1 MB threshold

    # 1.5 MB dummy content
    oversized_data = b"A" * (1024 * 1024 + 500 * 1024)
    response = client.post(
        "/api/v1/reviews/run",
        headers=creator_headers,
        data={"title": "Oversized Doc"},
        files={"file": ("large.txt", oversized_data, "text/plain")}
    )
    assert response.status_code == 413
    assert "exceeds maximum permitted size" in response.json()["detail"]


def test_extract_facts_from_document_text(client: TestClient, creator_headers):
    """Creators can extract candidate facts from proof document text and certify to vault."""
    report_text = (
        "Q3 2026 Infrastructure Report.\n"
        "Production infrastructure demonstrated 99.98% uptime SLA in Q3.\n"
        "Sub-45ms roundtrip latency was achieved across all European nodes.\n"
        "The system serves over 50,000 enterprise customers globally.\n"
        "The platform completed SOC 2 Type II compliance audit successfully."
    )
    res = client.post(
        "/api/v1/facts/extract",
        headers=creator_headers,
        data={"text": report_text}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["candidate_facts_count"] >= 3
    fact_codes = [f["fact_code"] for f in data["candidate_facts"]]
    assert any("SLA" in c for c in fact_codes)

    # Test certifying an extracted fact into the brand vault
    fact_to_certify = data["candidate_facts"][0]
    create_res = client.post(
        "/api/v1/facts",
        headers=creator_headers,
        json={
            "fact_code": fact_to_certify["fact_code"],
            "subject": fact_to_certify["subject"],
            "approved_statement": fact_to_certify["approved_statement"],
            "normalized_value": fact_to_certify["normalized_value"],
            "normalized_unit": fact_to_certify["normalized_unit"],
            "source_document": "Q3 2026 Infrastructure Report",
            "source_quote": fact_to_certify["source_quote"],
            "owner_name": "Test Creator",
            "owner_email": "creator@canon.example",
            "valid_until": fact_to_certify["valid_until"]
        }
    )
    assert create_res.status_code == 200
    assert create_res.json()["fact_code"] == fact_to_certify["fact_code"]

