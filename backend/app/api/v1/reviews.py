"""Hybrid Content Review Engine Routes."""
from datetime import datetime, timezone
import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import (
    ContentSubmission, ContentVersion, IntentCard, ExtractedClaim,
    Finding, Rulebook, Rule, Fact, AuditEvent
)
from app.schemas.domain import (
    ReviewResultResponse, ContentSubmissionResponse, FindingResponse,
    ExtractedClaimResponse, IntentCardResponse, FindingDecisionUpdate
)
from app.core.security import sanitize_and_redact_content
from app.core.audit_chain import calculate_sha256, record_audit_event
from app.core.intent_lock import intent_lock
from app.core.claim_ledger import claim_ledger
from app.core.deterministic import check_terminology_rules
from app.core.citation import CitationVerifier
from app.core.parser import parse_uploaded_file
from app.core.llm_provider import llm_client
from app.config import settings

router = APIRouter(prefix="/reviews", tags=["Content Review"])

@router.post("/run", response_model=ReviewResultResponse)
async def submit_and_review_content(
    title: str = Form(...),
    content_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    creator_id: str = Form("usr-creator-01"),
    workspace_id: str = Form(settings.DEFAULT_WORKSPACE_ID),
    db: Session = Depends(get_db)
):
    """
    Execute full 15-step Hybrid Review Pipeline:
    Ingest -> Redact -> Intent Card -> Claim Ledger -> Deterministic Checks ->
    Constrained AI -> Citation Verifier -> Intent Lock Diff -> Audit Hash Chain.
    """
    raw_content = ""
    content_type = "TEXT"
    filename = None
    
    if file:
        filename = file.filename
        content_type = filename.split(".")[-1].upper() if "." in filename else "FILE"
        content_bytes = await file.read()
        raw_content = parse_uploaded_file(filename, content_bytes)
    elif content_text:
        raw_content = content_text
    else:
        raise HTTPException(status_code=400, detail="Must provide text or upload a document file.")
        
    if not raw_content.strip():
        raise HTTPException(status_code=400, detail="Submitted content cannot be empty.")

    # 1. Redaction Gateway
    redacted_content, redaction_map = sanitize_and_redact_content(raw_content)
    
    # 2. Content SHA-256 Hash
    content_hash = calculate_sha256(raw_content)
    
    # 3. Active Rulebook Lookup
    active_rulebook = db.query(Rulebook).filter(
        Rulebook.workspace_id == workspace_id,
        Rulebook.status == "ACTIVE"
    ).first()
    rulebook_version = active_rulebook.version if active_rulebook else "1.0.0"
    active_rules = db.query(Rule).filter(Rule.rulebook_id == active_rulebook.id).all() if active_rulebook else []
    
    # 4. Intent Card Generation
    intent_data = await intent_lock.build_intent_card(redacted_content)
    
    # 5. Claim Ledger Extraction & Fact Vault Verification
    extracted_claim_dicts = await claim_ledger.extract_claims(redacted_content)
    verified_claims = claim_ledger.verify_claims_against_vault(db, workspace_id, extracted_claim_dicts)
    
    # 6. Deterministic Rule Checks (Zero LLM lag)
    rule_dicts = [
        {
            "id": r.id,
            "rule_code": r.rule_code,
            "category": r.category,
            "severity": r.severity,
            "enforcement_type": r.enforcement_type,
            "source_quote": r.source_quote,
            "source_section": r.source_section,
            "description": r.description,
            "pass_example": r.pass_example,
            "fail_example": r.fail_example
        }
        for r in active_rules
    ]
    candidate_findings = check_terminology_rules(raw_content, rule_dicts)
    
    # Also add claims that failed (STALE, CONTRADICTED, NEEDS_PROOF) as findings
    for vc in verified_claims:
        if vc["status"] in ["STALE", "CONTRADICTED", "NEEDS_PROOF"]:
            # Find span if present in text
            claim_text = vc["claim_text"]
            start_idx = raw_content.find(claim_text)
            end_idx = start_idx + len(claim_text) if start_idx != -1 else 0
            start_idx = max(0, start_idx)
            
            severity = "BLOCKING" if vc["status"] in ["STALE", "CONTRADICTED"] else "WARNING"
            candidate_findings.append({
                "rule_id": None,
                "rule_code": f"CLAIM-{vc['status']}",
                "category": "Claims",
                "severity": severity,
                "span_start": start_idx,
                "span_end": end_idx,
                "matched_text": claim_text,
                "source_quote": "Approved Fact Vault Requirement",
                "source_section": "Fact Ledger",
                "explanation": vc["reasoning"],
                "evidence_status": "VERIFIED",
                "confidence_tier": "DETERMINISTIC",
                "suggested_correction": None,
                "verification_status": "VERIFIED"
            })
            
    # 7. Constrained Semantic AI Checks (Tone and Brand Voice)
    # Check if tone rule exists and needs semantic check
    tone_rules = [r for r in active_rules if r.category == "Tone"]
    model_disclosure = {
        "provider": "Local Ollama Inference",
        "model": settings.OLLAMA_MODEL,
        "is_local": True,
        "is_fallback": False,
        "prompt_injection_screened": True,
        "redacted_tokens_count": len(redaction_map)
    }
    
    if tone_rules:
        tone_prompt = (
            "Analyze this marketing text against the following brand voice requirement:\n"
            f"Rule: {tone_rules[0].description}\n"
            f"Pass Example: {tone_rules[0].pass_example}\n"
            f"Fail Example: {tone_rules[0].fail_example}\n\n"
            "Return JSON: 'has_violation' (boolean), 'matched_phrase' (string), 'explanation' (string), 'suggested_rewrite' (string)"
        )
        ai_res = await llm_client.generate_structured(tone_prompt, redacted_content)
        model_disclosure = ai_res.get("disclosure", model_disclosure)
        ai_tone_data = ai_res.get("result", {})
        
        if ai_tone_data.get("has_violation"):
            matched_phrase = ai_tone_data.get("matched_phrase", "")
            s_idx = raw_content.find(matched_phrase) if matched_phrase else 0
            e_idx = s_idx + len(matched_phrase) if (matched_phrase and s_idx != -1) else 0
            s_idx = max(0, s_idx)
            
            # Candidate AI finding (subject to Citation Verifier)
            candidate_findings.append({
                "rule_id": tone_rules[0].id,
                "rule_code": tone_rules[0].rule_code,
                "category": "Tone",
                "severity": tone_rules[0].severity,
                "span_start": s_idx,
                "span_end": e_idx,
                "matched_text": matched_phrase or raw_content[:40],
                "source_quote": tone_rules[0].source_quote,
                "source_section": tone_rules[0].source_section,
                "explanation": ai_tone_data.get("explanation", "Tone departs from measured brand voice."),
                "evidence_status": "PENDING",
                "confidence_tier": "EVIDENCE_BACKED_AI",
                "suggested_correction": ai_tone_data.get("suggested_rewrite"),
                "verification_status": "PENDING"
            })

    # 8. CITATION VERIFIER: "NO CITATION, NO BLOCKING FLAG"
    verifier = CitationVerifier(db)
    verified_findings = verifier.verify_all(
        candidate_findings,
        active_rulebook.id if active_rulebook else "",
        raw_content
    )
    
    # 9. INTENT LOCK: Minimal Edit Suggestion & Diff Generation
    suggestion_res = intent_lock.generate_minimal_suggestion(raw_content, verified_findings)
    suggested_full_text = suggestion_res["suggested_text"]
    diff_html = suggestion_res["diff_html"]
    
    # 10. Verify Intent Preservation
    preservation_res = intent_lock.verify_intent_preservation(
        raw_content, suggested_full_text, intent_data
    )
    intent_data["preservation_status"] = preservation_res["status"]

    # 11. PERSIST SUBMISSION & REVIEW RECORDS
    submission = ContentSubmission(
        workspace_id=workspace_id,
        creator_id=creator_id,
        title=title,
        content_type=content_type,
        original_filename=filename,
        current_status="SUBMITTED"
    )
    db.add(submission)
    db.flush()
    
    version = ContentVersion(
        submission_id=submission.id,
        version_number=1,
        raw_text=raw_content,
        redacted_text=redacted_content,
        content_hash=content_hash,
        rulebook_version=rulebook_version
    )
    db.add(version)
    db.flush()
    
    # Persist Intent Card
    ic_record = IntentCard(
        content_version_id=version.id,
        purpose=intent_data["purpose"],
        target_audience=intent_data["target_audience"],
        call_to_action=intent_data["call_to_action"],
        must_keep_facts=intent_data["must_keep_facts"],
        product_names=intent_data["product_names"],
        numerical_claims=intent_data["numerical_claims"],
        tone_constraints=intent_data["tone_constraints"],
        preservation_status=intent_data["preservation_status"]
    )
    db.add(ic_record)
    
    # Persist Extracted Claims
    persisted_claims = []
    for vc in verified_claims:
        claim_obj = ExtractedClaim(
            content_version_id=version.id,
            matched_fact_id=vc.get("matched_fact_id"),
            claim_text=vc["claim_text"],
            claim_type=vc["claim_type"],
            status=vc["status"],
            reasoning=vc["reasoning"]
        )
        db.add(claim_obj)
        persisted_claims.append(claim_obj)
        
    # Persist Findings
    persisted_findings = []
    blocking_count = 0
    warning_count = 0
    advisory_count = 0
    
    for vf in verified_findings:
        sev = vf["severity"]
        if sev == "BLOCKING":
            blocking_count += 1
        elif sev == "WARNING":
            warning_count += 1
        else:
            advisory_count += 1
            
        finding_obj = Finding(
            content_version_id=version.id,
            rule_id=vf.get("rule_id"),
            category=vf["category"],
            severity=vf["severity"],
            span_start=vf.get("span_start", 0),
            span_end=vf.get("span_end", 0),
            matched_text=vf.get("matched_text", ""),
            source_quote=vf.get("source_quote"),
            source_section=vf.get("source_section"),
            explanation=vf["explanation"],
            evidence_status=vf.get("evidence_status", "VERIFIED"),
            confidence_tier=vf.get("confidence_tier", "DETERMINISTIC"),
            suggested_correction=vf.get("suggested_correction"),
            verification_status=vf.get("verification_status", "VERIFIED"),
            rejection_reason=vf.get("rejection_reason"),
            user_decision="PENDING"
        )
        db.add(finding_obj)
        persisted_findings.append(finding_obj)

    overall_status = "CHANGES_REQUESTED" if blocking_count > 0 else ("WARNING" if warning_count > 0 else "CLEAN")
    submission.current_status = "CHANGES_REQUESTED" if blocking_count > 0 else "SUBMITTED"
    db.commit()

    # 12. Record Audit Event in Sequential Cryptographic Hash Chain
    record_audit_event(
        db=db,
        workspace_id=workspace_id,
        event_type="REVIEW_EXECUTED",
        actor_id=creator_id,
        actor_role="CREATOR",
        details={
            "submission_id": submission.id,
            "version_id": version.id,
            "content_hash": content_hash,
            "blocking_findings": blocking_count,
            "advisory_findings": advisory_count,
            "rulebook_version": rulebook_version
        }
    )

    # 13. Format and return response
    return ReviewResultResponse(
        submission_id=submission.id,
        version_id=version.id,
        version_number=1,
        content_hash=content_hash,
        rulebook_version=rulebook_version,
        overall_status=overall_status,
        blocking_findings_count=blocking_count,
        warning_findings_count=warning_count,
        advisory_findings_count=advisory_count,
        intent_preservation_status=intent_data["preservation_status"],
        findings=[
            FindingResponse(
                id=pf.id,
                content_version_id=pf.content_version_id,
                rule_id=pf.rule_id,
                rule_code=vf.get("rule_code"),
                category=pf.category,
                severity=pf.severity,
                span_start=pf.span_start,
                span_end=pf.span_end,
                matched_text=pf.matched_text,
                source_quote=pf.source_quote,
                source_section=pf.source_section,
                explanation=pf.explanation,
                evidence_status=pf.evidence_status,
                confidence_tier=pf.confidence_tier,
                suggested_correction=pf.suggested_correction,
                verification_status=pf.verification_status,
                rejection_reason=pf.rejection_reason,
                user_decision=pf.user_decision,
                created_at=pf.created_at
            )
            for pf, vf in zip(persisted_findings, verified_findings)
        ],
        claims=[
            ExtractedClaimResponse(
                id=pc.id,
                content_version_id=pc.content_version_id,
                matched_fact_id=pc.matched_fact_id,
                claim_text=pc.claim_text,
                claim_type=pc.claim_type,
                status=pc.status,
                reasoning=pc.reasoning
            )
            for pc in persisted_claims
        ],
        intent_card=IntentCardResponse.model_validate(ic_record),
        diff_html=diff_html,
        suggested_full_text=suggested_full_text,
        model_disclosure=model_disclosure
    )

@router.get("/submissions", response_model=List[ContentSubmissionResponse])
def list_submissions(
    workspace_id: str = settings.DEFAULT_WORKSPACE_ID,
    db: Session = Depends(get_db)
):
    """List all content submissions with creator metadata and status."""
    submissions = (
        db.query(ContentSubmission)
        .filter(ContentSubmission.workspace_id == workspace_id)
        .order_by(ContentSubmission.created_at.desc())
        .all()
    )
    results = []
    for s in submissions:
        res = ContentSubmissionResponse.model_validate(s)
        res.creator_name = s.creator.full_name if s.creator else "Unknown Creator"
        results.append(res)
    return results

@router.get("/submissions/{submission_id}", response_model=Dict[str, Any])
def get_submission_details(submission_id: str, db: Session = Depends(get_db)):
    """Retrieve complete findings, versions, diff, and receipt for a submission."""
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    latest_version = (
        db.query(ContentVersion)
        .filter(ContentVersion.submission_id == sub.id)
        .order_by(ContentVersion.version_number.desc())
        .first()
    )
    
    findings = db.query(Finding).filter(Finding.content_version_id == latest_version.id).all() if latest_version else []
    claims = db.query(ExtractedClaim).filter(ExtractedClaim.content_version_id == latest_version.id).all() if latest_version else []
    intent_card = db.query(IntentCard).filter(IntentCard.content_version_id == latest_version.id).first() if latest_version else None
    
    return {
        "submission": ContentSubmissionResponse.model_validate(sub),
        "version": {
            "id": latest_version.id if latest_version else None,
            "version_number": latest_version.version_number if latest_version else 1,
            "content_hash": latest_version.content_hash if latest_version else None,
            "raw_text": latest_version.raw_text if latest_version else "",
            "rulebook_version": latest_version.rulebook_version if latest_version else "1.0.0"
        },
        "findings": [FindingResponse.model_validate(f) for f in findings],
        "claims": [ExtractedClaimResponse.model_validate(c) for c in claims],
        "intent_card": IntentCardResponse.model_validate(intent_card) if intent_card else None
    }

@router.put("/findings/{finding_id}/decision")
def update_finding_decision(
    finding_id: str,
    payload: FindingDecisionUpdate,
    actor_id: str = "usr-creator-01",
    db: Session = Depends(get_db)
):
    """
    Creator / Reviewer records a decision on a finding (ACCEPTED, DISPUTED, OVERRIDDEN).
    Feeds directly into the Governance Loop.
    """
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
        
    finding.user_decision = payload.user_decision
    db.commit()
    
    # If overridden, log audit event to feed recurring override cluster
    if payload.user_decision == "OVERRIDDEN":
        record_audit_event(
            db=db,
            workspace_id=settings.DEFAULT_WORKSPACE_ID,
            event_type="OVERRIDE_LOGGED",
            actor_id=actor_id,
            actor_role="CREATOR",
            details={
                "finding_id": finding.id,
                "rule_id": finding.rule_id,
                "reason": payload.override_reason or "Operational context justification"
            }
        )
        
    return {"message": "Finding decision recorded", "finding_id": finding.id, "decision": payload.user_decision}
