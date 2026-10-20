"""Automated Tests for Intent Lock Engine."""
import pytest
from app.core.intent_lock import IntentLockEngine

def test_minimal_suggestion_diff_generation():
    """Verify that only the violating span is replaced and diff HTML is generated."""
    engine = IntentLockEngine()
    original = "Migrate your enterprise workloads to Apex Cloud today. Sign up on our portal."
    idx = original.find("Apex Cloud")
    findings = [{
        "rule_code": "TERM-01",
        "span_start": idx,
        "span_end": idx + len("Apex Cloud"),
        "suggested_correction": "Apex Core"
    }]
    
    result = engine.generate_minimal_suggestion(original, findings)
    assert result["suggested_text"] == "Migrate your enterprise workloads to Apex Core today. Sign up on our portal."
    assert len(result["corrections_applied"]) == 1
    assert "<del" in result["diff_html"]
    assert "<ins" in result["diff_html"]
    assert "Cloud" in result["diff_html"]
    assert "Core" in result["diff_html"]

def test_intent_preservation_cta_preserved():
    """When the call to action remains intact, preservation status is PASSED."""
    engine = IntentLockEngine()
    original = "Deploy on Apex Cloud. Sign up for a trial today!"
    corrected = "Deploy on Apex Core. Sign up for a trial today!"
    intent_card = {
        "call_to_action": "Sign up for a trial today",
        "numerical_claims": []
    }
    
    preservation = engine.verify_intent_preservation(original, corrected, intent_card)
    assert preservation["status"] == "PASSED"
    assert preservation["cta_preserved"] is True

def test_intent_preservation_cta_deleted_fails():
    """When a suggested edit strips out the call to action, status is flagged as FAILED or NEEDS_REVIEW."""
    engine = IntentLockEngine()
    original = "Deploy on Apex Cloud. Sign up for a trial today!"
    # Overzealous AI rewrite that dropped the call to action:
    overzealous_rewrite = "Apex Core is a high throughput distributed engine."
    intent_card = {
        "call_to_action": "Sign up for a trial today",
        "numerical_claims": []
    }
    
    preservation = engine.verify_intent_preservation(original, overzealous_rewrite, intent_card)
    assert preservation["status"] in ["FAILED", "NEEDS_REVIEW"]
    assert preservation["cta_preserved"] is False
    assert any("Call to action intent was lost" in r for r in preservation["reasons"])
