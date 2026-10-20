"""Automated Tests for Claim Ledger & Evidence Expiry."""
from datetime import datetime, timezone
import pytest
from app.core.claim_ledger import ClaimLedgerEngine
from app.seed.synthetic_brand import WORKSPACE_ID

def test_supported_claim_with_valid_fact(db_session):
    """Claim matching in-date fact in vault is classified as SUPPORTED."""
    ledger = ClaimLedgerEngine()
    claims = [{
        "claim_text": "We certify an infrastructure uptime SLA of 99.98% availability.",
        "claim_type": "NUMERICAL"
    }]
    
    results = ledger.verify_claims_against_vault(db_session, WORKSPACE_ID, claims)
    assert len(results) == 1
    assert results[0]["status"] == "SUPPORTED"
    assert "FACT-SLA-2026" in results[0]["reasoning"]

def test_stale_claim_with_expired_fact(db_session):
    """
    CRITICAL TEST:
    A claim quoting an expired fact (FACT-CUST-2025, expired Dec 2025)
    MUST be classified as STALE, preventing outdated metrics from being approved.
    """
    ledger = ClaimLedgerEngine()
    claims = [{
        "claim_text": "Join over 1,450 verified enterprise organizations.",
        "claim_type": "NUMERICAL"
    }]
    
    results = ledger.verify_claims_against_vault(db_session, WORKSPACE_ID, claims)
    assert len(results) == 1
    assert results[0]["status"] == "STALE"
    assert "expired on 2025-12-31" in results[0]["reasoning"]
    assert "David Miller" in results[0]["reasoning"]

def test_contradicted_numerical_claim(db_session):
    """A claim asserting an inaccurate figure against a certified fact is CONTRADICTED."""
    ledger = ClaimLedgerEngine()
    claims = [{
        "claim_text": "Global average edge latency clocked at 20ms.",
        "claim_type": "NUMERICAL"
    }]
    
    results = ledger.verify_claims_against_vault(db_session, WORKSPACE_ID, claims)
    assert len(results) == 1
    assert results[0]["status"] == "CONTRADICTED"
    assert "specifies certified value of '42ms'" in results[0]["reasoning"]

def test_unsubstantiated_superlative_needs_proof(db_session):
    """Superlative claim ('world's fastest') requires certified proof and returns NEEDS_PROOF."""
    ledger = ClaimLedgerEngine()
    claims = [{
        "claim_text": "Apex Dynamics is the world's fastest telemetry engine.",
        "claim_type": "SUPERLATIVE"
    }]
    
    results = ledger.verify_claims_against_vault(db_session, WORKSPACE_ID, claims)
    assert len(results) == 1
    assert results[0]["status"] == "NEEDS_PROOF"
    assert "requires certified evidence" in results[0]["reasoning"]
