"""Automated Tests for the Citation Verifier ('No Citation, No Flag')."""
import pytest
from app.core.citation import CitationVerifier, normalize_source_text
from app.db.models import Rulebook, Rule
from app.seed.synthetic_brand import WORKSPACE_ID

def test_source_text_normalization():
    """Verify Unicode, quotes, and whitespace normalization."""
    raw = "  “Apex Core is   our official enterprise engine.”  \n"
    normalized = normalize_source_text(raw)
    assert normalized == '"apex core is our official enterprise engine."'

def test_valid_evidence_backed_ai_finding(db_session):
    """Confirm valid cited rule and source quote receives EVIDENCE_BACKED_AI tier."""
    rulebook = db_session.query(Rulebook).filter(Rulebook.workspace_id == WORKSPACE_ID).first()
    rule = db_session.query(Rule).filter(Rule.rule_code == "TERM-01").first()
    
    verifier = CitationVerifier(db_session)
    content = "We recommend migrating to Apex Cloud for enterprise workloads."
    
    candidate = {
        "rule_code": "TERM-01",
        "category": "Terminology",
        "severity": "BLOCKING",
        "span_start": 26,
        "span_end": 36,
        "matched_text": "Apex Cloud",
        "source_quote": rule.source_quote,
        "explanation": "Prohibited deprecated term used."
    }
    
    verified = verifier.verify_finding(candidate, rulebook.id, content)
    assert verified["verification_status"] == "VERIFIED"
    assert verified["confidence_tier"] == "EVIDENCE_BACKED_AI"
    assert verified["evidence_status"] == "VERIFIED"
    assert verified["severity"] == "BLOCKING"
    assert verified["rejection_reason"] is None

def test_hallucinated_rule_id_demoted_to_advisory(db_session):
    """
    CRITICAL INVARIANT TEST:
    If the AI invents a rule ID that does not exist in the active rulebook,
    the finding MUST be demoted to non-blocking ADVISORY.
    """
    rulebook = db_session.query(Rulebook).filter(Rulebook.workspace_id == WORKSPACE_ID).first()
    verifier = CitationVerifier(db_session)
    content = "Some promotional content here."
    
    hallucinated_candidate = {
        "rule_code": "NON-EXISTENT-99",
        "category": "Tone",
        "severity": "BLOCKING",  # Attempted blocking flag
        "span_start": 5,
        "span_end": 16,
        "matched_text": "promotional",
        "source_quote": "Invented guideline quote that was hallucinated.",
        "explanation": "Hallucinated finding."
    }
    
    result = verifier.verify_finding(hallucinated_candidate, rulebook.id, content)
    assert result["verification_status"] == "DEMOTED"
    assert result["confidence_tier"] == "ADVISORY"
    assert result["severity"] == "ADVISORY"  # Stripped of blocking authority!
    assert result["evidence_status"] == "MISSING"
    assert "does not exist in active rulebook" in result["rejection_reason"]

def test_fabricated_quote_demoted_to_advisory(db_session):
    """
    CRITICAL INVARIANT TEST:
    If the AI cites a real rule code but fabricates an inaccurate source quote,
    the finding MUST be demoted to non-blocking ADVISORY.
    """
    rulebook = db_session.query(Rulebook).filter(Rulebook.workspace_id == WORKSPACE_ID).first()
    verifier = CitationVerifier(db_session)
    content = "Scale with Apex Cloud today."
    
    fabricated_candidate = {
        "rule_code": "TERM-01",
        "category": "Terminology",
        "severity": "BLOCKING",
        "span_start": 11,
        "span_end": 21,
        "matched_text": "Apex Cloud",
        "source_quote": "Totally made up sentence that does not match guideline source text.",
        "explanation": "Fabricated quote test."
    }
    
    result = verifier.verify_finding(fabricated_candidate, rulebook.id, content)
    assert result["verification_status"] == "DEMOTED"
    assert result["confidence_tier"] == "ADVISORY"
    assert result["severity"] == "ADVISORY"
    assert result["evidence_status"] == "UNVERIFIED"
    assert "could not be verified in stored guideline text" in result["rejection_reason"]

def test_deterministic_finding_preserved(db_session):
    """Deterministic findings are trusted directly and retain verified status."""
    rulebook = db_session.query(Rulebook).filter(Rulebook.workspace_id == WORKSPACE_ID).first()
    verifier = CitationVerifier(db_session)
    
    det_finding = {
        "rule_code": "TERM-01",
        "category": "Terminology",
        "severity": "BLOCKING",
        "span_start": 0,
        "span_end": 10,
        "matched_text": "Apex Cloud",
        "source_quote": "Exact source quote",
        "explanation": "Deterministic regex match.",
        "confidence_tier": "DETERMINISTIC"
    }
    
    result = verifier.verify_finding(det_finding, rulebook.id, "Apex Cloud is here.")
    assert result["confidence_tier"] == "DETERMINISTIC"
    assert result["verification_status"] == "VERIFIED"


def test_forged_deterministic_tier_cannot_bypass_rule_validation(db_session):
    """
    CRITICAL SECURITY CHECK:
    An untrusted caller or model injection passing confidence_tier='DETERMINISTIC'
    must NOT bypass rule existence checks.
    """
    rulebook = db_session.query(Rulebook).filter(Rulebook.workspace_id == WORKSPACE_ID).first()
    verifier = CitationVerifier(db_session)

    forged_finding = {
        "rule_code": "FORGED-RULE-99",
        "category": "Terminology",
        "severity": "BLOCKING",
        "span_start": 0,
        "span_end": 10,
        "matched_text": "Apex Cloud",
        "confidence_tier": "DETERMINISTIC"  # Attempt to bypass verifier
    }

    result = verifier.verify_finding(forged_finding, rulebook.id, "Apex Cloud is here.")
    assert result["verification_status"] == "DEMOTED"
    assert result["severity"] == "ADVISORY"
    assert "does not exist in active rulebook" in result["rejection_reason"]


def test_forged_deterministic_tier_cannot_bypass_span_validation(db_session):
    """
    CRITICAL INVARIANT CHECK:
    Even with confidence_tier='DETERMINISTIC', if the matched text does not
    exist in the submitted content, the finding must be rejected.
    """
    rulebook = db_session.query(Rulebook).filter(Rulebook.workspace_id == WORKSPACE_ID).first()
    verifier = CitationVerifier(db_session)

    phantom_finding = {
        "rule_code": "TERM-01",
        "category": "Terminology",
        "severity": "BLOCKING",
        "span_start": 0,
        "span_end": 15,
        "matched_text": "NonExistentWord",
        "confidence_tier": "DETERMINISTIC"
    }

    result = verifier.verify_finding(phantom_finding, rulebook.id, "Apex Cloud is here.")
    assert result["verification_status"] == "REJECTED"
    assert result["severity"] == "ADVISORY"
    assert "does not exist in submitted text" in result["rejection_reason"]
