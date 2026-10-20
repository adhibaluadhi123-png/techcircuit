"""Claim Ledger Engine for CANON Brand Governance.
Extracts measurable, comparative, and superlative claims from content
and compares them against the Approved Fact Vault with evidence expiry.
"""
from datetime import datetime, timezone
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.models import Fact, ExtractedClaim
from app.core.llm_provider import llm_client

SUPERLATIVE_PATTERNS = [
    r'\b(?:world\'?s\s+)?(best|fastest|cheapest|greatest|most\s+powerful|#1|leading|unmatched|unrivaled)\b',
    r'\b(guaranteed\s+(?:100%|always))\b',
    r'\b(only\s+platform\s+that)\b'
]

class ClaimLedgerEngine:
    """Manages claim extraction, date verification, and claim-to-fact alignment."""

    async def extract_claims(self, text: str) -> List[Dict[str, Any]]:
        """Extract explicit promotional, numerical, and comparative claims."""
        system_prompt = (
            "You are the CANON Claim Extractor. Identify any promotional claims, numerical figures, "
            "superlatives (e.g. 'fastest', 'best'), or comparative statements in the text. "
            "Return a JSON object with key 'claims', containing a list of objects with: "
            "'claim_text' (string), 'claim_type' ('NUMERICAL', 'SUPERLATIVE', 'COMPARATIVE', 'FACTUAL'), "
            "and 'normalized_value' (string or null)."
        )
        user_prompt = f"Extract all claims from:\n\n{text}"
        
        response = await llm_client.generate_structured(system_prompt, user_prompt)
        claims = response.get("result", {}).get("claims", [])
        
        # Augment with deterministic regex checks for superlatives and numbers
        for pat in SUPERLATIVE_PATTERNS:
            for m in re.finditer(pat, text, re.IGNORECASE):
                matched = m.group(0)
                if not any(c.get("claim_text") == matched for c in claims):
                    claims.append({
                        "claim_text": matched,
                        "claim_type": "SUPERLATIVE",
                        "normalized_value": None
                    })
                    
        return claims

    def verify_claims_against_vault(
        self,
        db: Session,
        workspace_id: str,
        claims: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Evaluate extracted claims against the Approved Fact Vault:
        Assigns status: SUPPORTED, STALE, CONTRADICTED, UNSUPPORTED, or NEEDS_PROOF.
        """
        now = datetime.now(timezone.utc)
        active_facts = db.query(Fact).filter(Fact.workspace_id == workspace_id).all()
        results = []

        for c in claims:
            claim_text = c.get("claim_text", "")
            claim_type = c.get("claim_type", "FACTUAL")
            lower_claim = claim_text.lower()
            
            # Superlatives without explicit certified facts always require proof
            if claim_type == "SUPERLATIVE":
                results.append({
                    "claim_text": claim_text,
                    "claim_type": claim_type,
                    "matched_fact_id": None,
                    "status": "NEEDS_PROOF",
                    "reasoning": f"Unsubstantiated superlative '{claim_text}' requires certified evidence document before publication."
                })
                continue

            # Look for matching approved facts
            best_fact: Optional[Fact] = None
            best_match_score = 0
            
            for fact in active_facts:
                subject_words = fact.subject.lower().split()
                matches = sum(1 for w in subject_words if w in lower_claim)
                if matches > best_match_score:
                    best_match_score = matches
                    best_fact = fact

            if not best_fact or best_match_score == 0:
                results.append({
                    "claim_text": claim_text,
                    "claim_type": claim_type,
                    "matched_fact_id": None,
                    "status": "UNSUPPORTED",
                    "reasoning": "No matching approved fact found in the Approved Fact Vault."
                })
                continue

            # We found a matching fact! Check validity dates
            # Handle naive datetime from SQLite if needed
            fact_valid_until = best_fact.valid_until
            if fact_valid_until.tzinfo is None:
                fact_valid_until = fact_valid_until.replace(tzinfo=timezone.utc)
                
            if fact_valid_until < now:
                # Fact is expired / stale!
                results.append({
                    "claim_text": claim_text,
                    "claim_type": claim_type,
                    "matched_fact_id": best_fact.id,
                    "status": "STALE",
                    "reasoning": (
                        f"Approved fact '{best_fact.fact_code}' expired on "
                        f"{best_fact.valid_until.strftime('%Y-%m-%d')}. Owner: {best_fact.owner_name} ({best_fact.owner_email})."
                    )
                })
                continue

            # Check for contradiction in numerical value if fact has normalized value
            if best_fact.normalized_value:
                # If claim asserts a number different from normalized_value
                numbers_in_claim = re.findall(r'\d+(?:\.\d+)?', claim_text)
                if numbers_in_claim and best_fact.normalized_value not in numbers_in_claim:
                    results.append({
                        "claim_text": claim_text,
                        "claim_type": claim_type,
                        "matched_fact_id": best_fact.id,
                        "status": "CONTRADICTED",
                        "reasoning": (
                            f"Claim states '{', '.join(numbers_in_claim)}' but approved fact {best_fact.fact_code} "
                            f"specifies certified value of '{best_fact.normalized_value}{best_fact.normalized_unit or ''}'."
                        )
                    })
                    continue

            # All checks pass: Claim is fully supported
            results.append({
                "claim_text": claim_text,
                "claim_type": claim_type,
                "matched_fact_id": best_fact.id,
                "status": "SUPPORTED",
                "reasoning": f"Verified against approved fact {best_fact.fact_code} ({best_fact.source_document})."
            })

        return results


claim_ledger = ClaimLedgerEngine()
