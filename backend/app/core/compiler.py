"""Guideline Compiler Engine for CANON Brand Governance.
Compiles static guideline documents into versioned, testable, cited rules
and detects ambiguous or conflicting guidelines before activation.
"""
import re
from typing import List, Dict, Any
from app.core.llm_provider import llm_client

AMBIGUOUS_ADJECTIVES = [
    "clean", "modern", "high quality", "premium", "dynamic", "nice",
    "engaging", "cool", "exciting", "innovative", "user friendly", "sleek"
]

class GuidelineCompiler:
    """Extracts, tests, and validates brand rules from guideline text."""

    async def compile_guideline(self, guideline_text: str) -> List[Dict[str, Any]]:
        """
        Compile guideline text into structured atomic rules with pass/fail test pairs.
        """
        system_prompt = (
            "You are the CANON Guideline Compiler. Your job is to convert brand guidelines into "
            "atomic, testable rules. For every rule, you MUST identify an EXACT quote from the guideline text. "
            "Never invent a rule or quote not in the text.\n\n"
            "Return a JSON object with a single key 'rules', which is a list of rule objects. "
            "Each rule object MUST have:\n"
            "- rule_code (string, e.g. TONE-01, TERM-01, CLAIM-01)\n"
            "- title (string)\n"
            "- category (string: Tone, Terminology, Claims, Visual, or Accessibility)\n"
            "- description (string: clear directive)\n"
            "- source_quote (string: exact verbatim excerpt from input)\n"
            "- source_section (string: e.g. Section 2.1 or Page 4)\n"
            "- severity (string: BLOCKING, WARNING, or ADVISORY)\n"
            "- enforcement_type (string: DETERMINISTIC or SEMANTIC_AI)\n"
            "- pass_example (string: sample text that complies)\n"
            "- fail_example (string: sample text that violates)\n"
            "- ambiguity_status (string: CLEAR, AMBIGUOUS, or CONFLICTING)"
        )
        user_prompt = f"Extract all actionable brand rules from this text:\n\n{guideline_text}"
        
        response = await llm_client.generate_structured(system_prompt, user_prompt)
        rules = response.get("result", {}).get("rules", [])
        
        # If compiler returned empty or fallback triggered, perform heuristic extraction
        if not rules:
            rules = self._heuristic_rule_extraction(guideline_text)

        # Post-process & score ambiguity and citation integrity
        processed_rules = []
        for r in rules:
            processed_rules.append(self._validate_and_score_rule(r, guideline_text))
            
        return processed_rules

    def _validate_and_score_rule(self, rule: Dict[str, Any], full_text: str) -> Dict[str, Any]:
        """Validate source quote existence and score ambiguity."""
        quote = rule.get("source_quote", "").strip()
        desc = rule.get("description", "").lower()
        
        # Ambiguity detection
        is_ambiguous = any(adj in desc for adj in AMBIGUOUS_ADJECTIVES)
        if not rule.get("pass_example") or not rule.get("fail_example"):
            is_ambiguous = True

        status = "CLEAR"
        if is_ambiguous:
            status = "AMBIGUOUS"
        if "never" in desc and "always" in desc:
            status = "CONFLICTING"

        # Citation validation: verify quote is actually in input text
        if quote and quote.lower() not in full_text.lower():
            # If quote wasn't verbatim, mark evidence as missing
            rule["evidence_status"] = "UNVERIFIED"
        else:
            rule["evidence_status"] = "VERIFIED"

        rule["ambiguity_status"] = rule.get("ambiguity_status") or status
        return rule

    def _heuristic_rule_extraction(self, text: str) -> List[Dict[str, Any]]:
        """Fallback rule extraction based on common directive headings."""
        rules = []
        lines = text.split("\n")
        rule_counter = 1
        
        for line in lines:
            line_str = line.strip()
            if not line_str or len(line_str) < 15:
                continue
                
            lower = line_str.lower()
            if any(k in lower for k in ["never use", "do not", "avoid", "always use", "prohibited", "banned"]):
                cat = "Terminology" if any(w in lower for w in ["word", "term", "name", "call"]) else "Tone"
                rules.append({
                    "rule_code": f"{cat[:4].upper()}-{rule_counter:02d}",
                    "title": line_str[:60] + ("..." if len(line_str) > 60 else ""),
                    "category": cat,
                    "description": line_str,
                    "source_quote": line_str,
                    "source_section": "General Guidelines",
                    "severity": "BLOCKING" if "never" in lower or "prohibited" in lower else "WARNING",
                    "enforcement_type": "DETERMINISTIC" if cat == "Terminology" else "SEMANTIC_AI",
                    "pass_example": "Compliant approved wording",
                    "fail_example": line_str.split(":")[-1].strip() if ":" in line_str else "Non-compliant phrasing",
                    "ambiguity_status": "CLEAR"
                })
                rule_counter += 1
                
        return rules


compiler = GuidelineCompiler()
