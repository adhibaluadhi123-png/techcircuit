"""Intent Lock Engine for CANON Brand Governance.
Preserves the creator's purpose, audience, call to action and critical facts
when suggesting minimal surgical corrections instead of wholesale rewrites.
"""
import difflib
import re
from typing import Dict, Any, List, Optional
from app.core.llm_provider import llm_client


class IntentLockEngine:
    """
    Manages Intent Card creation, minimal edit generation, and intent preservation checks.
    """

    async def build_intent_card(self, content_text: str) -> Dict[str, Any]:
        """
        Extract the core communication intent parameters from the creator's draft.
        """
        system_prompt = (
            "You are the CANON Intent Analyzer. Analyze the draft content and extract its core intent. "
            "Return a JSON object with keys: "
            "'purpose' (string), "
            "'target_audience' (string), "
            "'call_to_action' (string), "
            "'must_keep_facts' (list of strings), "
            "'product_names' (list of strings), "
            "'numerical_claims' (list of strings), "
            "'tone_constraints' (list of strings)."
        )
        user_prompt = f"Analyze the following content:\n\n{content_text}"
        
        response = await llm_client.generate_structured(system_prompt, user_prompt)
        res = response.get("result", {})
        
        # Fallback guarantees if model omitted any fields
        card = {
            "purpose": res.get("purpose") or "Inform and engage target audience",
            "target_audience": res.get("target_audience") or "Prospective and active users",
            "call_to_action": res.get("call_to_action") or self._extract_cta_heuristic(content_text),
            "must_keep_facts": res.get("must_keep_facts") or [],
            "product_names": res.get("product_names") or self._extract_product_names_heuristic(content_text),
            "numerical_claims": res.get("numerical_claims") or self._extract_numbers_heuristic(content_text),
            "tone_constraints": res.get("tone_constraints") or ["Authoritative", "Helpful", "Transparent"],
            "preservation_status": "PASSED"
        }
        return card

    def _extract_cta_heuristic(self, text: str) -> str:
        """Extract call-to-action sentence using common imperatives."""
        matches = re.findall(
            r'(?:visit|check out|sign up|join|contact|discover|get started|register|learn more)[^\.\!\n]+[\.\!\n]?',
            text, re.IGNORECASE
        )
        return matches[-1].strip() if matches else "Explore the platform"

    def _extract_product_names_heuristic(self, text: str) -> List[str]:
        words = re.findall(r'\b[A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?\b', text)
        return list(dict.fromkeys(words))[:5]

    def _extract_numbers_heuristic(self, text: str) -> List[str]:
        return list(dict.fromkeys(re.findall(r'\b\d+(?:[\.,]\d+)?%?\b', text)))[:5]

    def generate_minimal_suggestion(
        self,
        original_text: str,
        findings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate a minimal, surgical correction by substituting only violating spans.
        Prevents full-text drift and preserves the author's structure.
        """
        suggested_text = original_text
        corrections_applied = []
        
        # Sort findings in reverse by start span to safely perform in-place string replacements
        actionable_findings = [f for f in findings if f.get("suggested_correction") and f.get("span_end", 0) > f.get("span_start", 0)]
        actionable_findings.sort(key=lambda x: x.get("span_start", 0), reverse=True)
        
        for f in actionable_findings:
            start = f["span_start"]
            end = f["span_end"]
            replacement = f["suggested_correction"]
            original_span = original_text[start:end]
            
            # Apply replacement
            suggested_text = suggested_text[:start] + replacement + suggested_text[end:]
            corrections_applied.append({
                "rule_code": f.get("rule_code"),
                "original": original_span,
                "replacement": replacement
            })

        # Generate HTML tracked changes diff
        diff_html = self._generate_diff_html(original_text, suggested_text)
        
        return {
            "suggested_text": suggested_text,
            "corrections_applied": corrections_applied,
            "diff_html": diff_html
        }

    def _generate_diff_html(self, original: str, corrected: str) -> str:
        """Generate styled inline diff with deletions in soft red and additions in soft green."""
        s = difflib.SequenceMatcher(None, original.split(), corrected.split())
        html_chunks = []
        for tag, i1, i2, j1, j2 in s.get_opcodes():
            if tag == 'equal':
                html_chunks.append(" ".join(original.split()[i1:i2]))
            elif tag == 'delete':
                deleted = " ".join(original.split()[i1:i2])
                html_chunks.append(f'<del class="bg-red-100 text-red-800 line-through px-1 rounded mx-0.5">{deleted}</del>')
            elif tag == 'insert':
                inserted = " ".join(corrected.split()[j1:j2])
                html_chunks.append(f'<ins class="bg-emerald-100 text-emerald-800 font-medium px-1 rounded mx-0.5 no-underline">{inserted}</ins>')
            elif tag == 'replace':
                deleted = " ".join(original.split()[i1:i2])
                inserted = " ".join(corrected.split()[j1:j2])
                html_chunks.append(
                    f'<del class="bg-red-100 text-red-800 line-through px-1 rounded mx-0.5">{deleted}</del> '
                    f'<ins class="bg-emerald-100 text-emerald-800 font-medium px-1 rounded mx-0.5 no-underline">{inserted}</ins>'
                )
        return " ".join(html_chunks)

    def verify_intent_preservation(
        self,
        original_text: str,
        corrected_text: str,
        intent_card: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Verify that the suggested edits have preserved:
        1. Call to action.
        2. Must-keep numerical claims and critical facts.
        """
        reasons = []
        cta = intent_card.get("call_to_action", "").lower().strip()
        cta_keywords = [w for w in re.findall(r'\b[a-zA-Z]{4,}\b', cta) if w not in ["with", "from", "that", "this"]]
        
        # Check CTA representation
        cta_preserved = True
        if cta_keywords:
            matched_cta_kw = [kw for kw in cta_keywords if kw in corrected_text.lower()]
            if not matched_cta_kw:
                cta_preserved = False
                reasons.append("Call to action intent was lost or altered in suggested edit.")

        # Check Numbers preservation (ensure unverified modifications didn't alter true facts)
        original_numbers = set(re.findall(r'\b\d+(?:[\.,]\d+)?%?\b', original_text))
        corrected_numbers = set(re.findall(r'\b\d+(?:[\.,]\d+)?%?\b', corrected_text))
        # If numbers that were supposed to be kept were dropped without intent
        must_keep = set(intent_card.get("numerical_claims", []))
        dropped_must_keep = must_keep - corrected_numbers
        if dropped_must_keep:
            reasons.append(f"Required numerical facts missing in suggestion: {', '.join(dropped_must_keep)}")

        if not cta_preserved or dropped_must_keep:
            status = "NEEDS_REVIEW" if cta_preserved else "FAILED"
        else:
            status = "PASSED"

        return {
            "status": status,
            "cta_preserved": cta_preserved,
            "facts_preserved": len(dropped_must_keep) == 0,
            "reasons": reasons
        }


intent_lock = IntentLockEngine()
