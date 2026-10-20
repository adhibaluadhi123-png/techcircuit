"""Automated Tests for Deterministic Rules, Contrast & Readability."""
import pytest
from app.core.deterministic import (
    check_terminology_rules,
    calculate_contrast_ratio,
    check_wcag_contrast,
    match_brand_palette,
    calculate_readability_metrics
)

def test_deterministic_terminology_detection():
    """Verify exact coordinate spans and rule identification."""
    rules = [
        {
            "id": "rule-term-01",
            "rule_code": "TERM-01",
            "category": "Terminology",
            "severity": "BLOCKING",
            "enforcement_type": "DETERMINISTIC",
            "pattern": r"\bApex\s+Cloud\b",
            "description": "Apex Cloud is deprecated. Use Apex Core.",
            "source_quote": "Never use Apex Cloud.",
            "source_section": "Section 2.1",
            "pass_example": "Apex Core"
        }
    ]
    text = "Experience the high throughput of Apex Cloud on bare metal."
    findings = check_terminology_rules(text, rules)
    assert len(findings) == 1
    f = findings[0]
    assert f["rule_code"] == "TERM-01"
    assert f["matched_text"] == "Apex Cloud"
    assert f["span_start"] == 34
    assert f["span_end"] == 44
    assert f["confidence_tier"] == "DETERMINISTIC"

def test_wcag_contrast_calculations():
    """Verify WCAG AA contrast ratio calculations for editorial palette."""
    # Main dark brown (#382A20) on off-white background (#FFF9F3)
    res_dark_on_light = check_wcag_contrast("#382A20", "#FFF9F3")
    assert res_dark_on_light["contrast_ratio"] >= 4.5
    assert res_dark_on_light["passes_wcag_aa"] is True

    # Low contrast pair (e.g. pale border #F1E1D4 on white #FFFFFF)
    res_low_contrast = check_wcag_contrast("#F1E1D4", "#FFFFFF")
    assert res_low_contrast["passes_wcag_aa"] is False

def test_brand_palette_matching():
    """Check brand palette color proximity."""
    approved = ["#F5A66B", "#C87539", "#382A20", "#FFF9F3", "#FFFFFF"]
    # Exact match
    res_exact = match_brand_palette("#F5A66B", approved)
    assert res_exact["is_exact_match"] is True
    assert res_exact["is_approved"] is True

    # Unapproved color (e.g. bright neon green #00FF00)
    res_unapproved = match_brand_palette("#00FF00", approved)
    assert res_unapproved["is_approved"] is False

def test_readability_metrics():
    """Verify Flesch Reading Ease computation."""
    text = "The quick brown fox jumps over the lazy dog. It is a simple sentence."
    metrics = calculate_readability_metrics(text)
    assert metrics["word_count"] > 10
    assert metrics["sentence_count"] == 2
    assert metrics["flesch_reading_ease"] > 60.0
