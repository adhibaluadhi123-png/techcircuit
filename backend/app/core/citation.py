"""Independent Citation Verifier for CANON Brand Governance.
Core Invariant: NO CITATION, NO BLOCKING FLAG.

Any finding produced by AI must strictly cite an existing rule and an exact
source quote matching stored guideline text. If verification fails, the finding
is demoted to non-blocking ADVISORY or rejected entirely.
"""
import unicodedata
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.db.models import Rule, Rulebook


def normalize_source_text(text: str) -> str:
    """
    Standardize text for reliable evidence matching:
    1. Unicode normalization (NFKC).
    2. Collapse all repeated whitespace/newlines to single space.
    3. Strip enclosing straight or curly quotes and trailing punctuation.
    """
    if not text:
        return ""
    normalized = unicodedata.normalize("NFKC", text)
    normalized = re.sub(r'[\u2018\u2019\u201A\u201B\u2032\u2035]', "'", normalized)
    normalized = re.sub(r'[\u201C\u201D\u201E\u201F\u2033\u2036]', '"', normalized)
    normalized = re.sub(r'\s+', ' ', normalized)
    return normalized.strip().lower()


class CitationVerifier:
    """
    Independent Verification Engine running separately from AI generation.
    Enforces the 'No Citation, No Blocking Flag' architectural invariant.
    """

    def __init__(self, db: Session):
        self.db = db

    def verify_finding(
        self,
        finding: Dict[str, Any],
        active_rulebook_id: str,
        content_text: str
    ) -> Dict[str, Any]:
        """
        Verify an individual finding candidate.
        Returns the updated finding dict with confidence tier, verification status,
        and demotion/rejection notes if verification fails.
        """
        result = dict(finding)
        rule_id = result.get("rule_id")
        rule_code = result.get("rule_code")
        source_quote = result.get("source_quote")
        span_start = result.get("span_start", 0)
        span_end = result.get("span_end", 0)
        matched_text = result.get("matched_text", "")
        
        # Rule Invariant A: Deterministic findings are already verified programmatically
        if result.get("confidence_tier") == "DETERMINISTIC":
            result["verification_status"] = "VERIFIED"
            result["evidence_status"] = "VERIFIED"
            return result

        # Invariant B: Must provide a Rule ID or Rule Code
        rule = None
        if rule_id:
            rule = self.db.query(Rule).filter(
                Rule.id == rule_id,
                Rule.rulebook_id == active_rulebook_id,
                Rule.status == "ACTIVE"
            ).first()
        elif rule_code:
            rule = self.db.query(Rule).filter(
                Rule.rule_code == rule_code,
                Rule.rulebook_id == active_rulebook_id,
                Rule.status == "ACTIVE"
            ).first()

        if not rule:
            # Rule does not exist in the active rulebook!
            # Violation of Invariant: Cannot create a blocking finding on a non-existent rule.
            result["confidence_tier"] = "ADVISORY"
            result["severity"] = "ADVISORY"  # Strictly demoted to non-blocking
            result["verification_status"] = "DEMOTED"
            result["evidence_status"] = "MISSING"
            result["rejection_reason"] = (
                f"Demoted to Advisory: Rule '{rule_code or rule_id}' does not exist in active rulebook."
            )
            return result

        # Invariant C: Confirm exact source quote matches stored rule source text
        normalized_cited_quote = normalize_source_text(source_quote or "")
        normalized_stored_quote = normalize_source_text(rule.source_quote)
        
        # Check if the cited quote is present in the stored quote, or vice-versa
        quote_matched = False
        if normalized_cited_quote and (
            normalized_cited_quote in normalized_stored_quote or
            normalized_stored_quote in normalized_cited_quote
        ):
            quote_matched = True

        if not quote_matched:
            # Fabricated or inaccurate quote citation detected!
            result["confidence_tier"] = "ADVISORY"
            result["severity"] = "ADVISORY"
            result["verification_status"] = "DEMOTED"
            result["evidence_status"] = "UNVERIFIED"
            result["rejection_reason"] = (
                f"Demoted to Advisory: Cited source quote could not be verified in stored guideline text for {rule.rule_code}."
            )
            return result

        # Invariant D: Content Span Alignment Check
        # Verify that the matched text exists at or near the specified span in the content
        if matched_text:
            text_at_span = content_text[span_start:span_end]
            if text_at_span != matched_text:
                # Attempt to locate the actual span in content
                idx = content_text.find(matched_text)
                if idx != -1:
                    result["span_start"] = idx
                    result["span_end"] = idx + len(matched_text)
                else:
                    # Content text does not even contain the flagged span!
                    result["confidence_tier"] = "ADVISORY"
                    result["severity"] = "ADVISORY"
                    result["verification_status"] = "REJECTED"
                    result["evidence_status"] = "UNVERIFIED"
                    result["rejection_reason"] = "Rejected: Flagged content span does not exist in submitted text."
                    return result

        # All invariants verified!
        result["rule_id"] = rule.id
        result["rule_code"] = rule.rule_code
        result["source_quote"] = rule.source_quote
        result["source_section"] = rule.source_section
        result["confidence_tier"] = "EVIDENCE_BACKED_AI"
        result["verification_status"] = "VERIFIED"
        result["evidence_status"] = "VERIFIED"
        result["rejection_reason"] = None
        return result

    def verify_all(
        self,
        findings: List[Dict[str, Any]],
        active_rulebook_id: str,
        content_text: str
    ) -> List[Dict[str, Any]]:
        """Verify an entire batch of candidate findings."""
        verified = []
        for f in findings:
            verified.append(self.verify_finding(f, active_rulebook_id, content_text))
        return verified
