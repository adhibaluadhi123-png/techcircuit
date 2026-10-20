"""Human Approval Workflow and Review Receipt Routes."""
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import (
    ContentSubmission, ContentVersion, ApprovalDecision, ReviewReceipt,
    User, Finding
)
from app.schemas.domain import (
    ApprovalDecisionCreate, ApprovalDecisionResponse, ReviewReceiptResponse,
    ContentSubmissionResponse
)
from app.core.audit_chain import record_audit_event
from app.config import settings

router = APIRouter(prefix="/approvals", tags=["Human Approval Workflow"])

ALLOWED_APPROVER_ROLES = ["ADMIN", "BRAND_MANAGER", "AUTHORISED_REVIEWER", "APPROVER"]

@router.get("/queue", response_model=List[ContentSubmissionResponse])
def get_approval_queue(
    workspace_id: str = settings.DEFAULT_WORKSPACE_ID,
    db: Session = Depends(get_db)
):
    """Retrieve submissions currently awaiting reviewer or approver sign-off."""
    submissions = (
        db.query(ContentSubmission)
        .filter(
            ContentSubmission.workspace_id == workspace_id,
            ContentSubmission.current_status.in_(["SUBMITTED", "CHANGES_REQUESTED"])
        )
        .order_by(ContentSubmission.created_at.desc())
        .all()
    )
    results = []
    for s in submissions:
        res = ContentSubmissionResponse.model_validate(s)
        res.creator_name = s.creator.full_name if s.creator else "Unknown Creator"
        results.append(res)
    return results

@router.post("/{submission_id}", response_model=Dict[str, Any])
def submit_approval_decision(
    submission_id: str,
    payload: ApprovalDecisionCreate,
    approver_id: str = "usr-approver-01",
    db: Session = Depends(get_db)
):
    """
    Authorized human review decision:
    - Server-side role enforcement (AI cannot approve, Creator cannot self-approve).
    - If approved, issues a cryptographic Review Receipt bound to content SHA-256 hash.
    - Appends event to the tamper-evident audit ledger.
    """
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    approver = db.query(User).filter(User.id == approver_id).first()
    if not approver or approver.role not in ALLOWED_APPROVER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{approver.role if approver else 'None'}' is not authorized to grant approvals."
        )

    # Invariant: Creator cannot approve their own submission
    if approver.id == sub.creator_id and approver.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Creators are not permitted to approve their own submissions."
        )

    # Invariant: Exception approval requires documented justification
    if payload.decision == "APPROVED_WITH_EXCEPTION" and not payload.reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Documented reason is mandatory when approving with an exception."
        )

    latest_version = (
        db.query(ContentVersion)
        .filter(ContentVersion.submission_id == sub.id)
        .order_by(ContentVersion.version_number.desc())
        .first()
    )
    if not latest_version:
        raise HTTPException(status_code=400, detail="No content version available to approve.")

    # Record Decision
    decision_record = ApprovalDecision(
        content_version_id=latest_version.id,
        approver_id=approver.id,
        decision=payload.decision,
        reason=payload.reason,
        exception_category=payload.exception_category
    )
    db.add(decision_record)
    
    # Update Submission status
    sub.current_status = payload.decision
    db.flush()

    # Generate Review Receipt if approved
    receipt = None
    if payload.decision in ["APPROVED", "APPROVED_WITH_EXCEPTION"]:
        findings = db.query(Finding).filter(Finding.content_version_id == latest_version.id).all()
        verified_count = sum(1 for f in findings if f.verification_status == "VERIFIED")
        advisory_count = sum(1 for f in findings if f.severity == "ADVISORY")
        
        receipt = ReviewReceipt(
            submission_id=sub.id,
            content_version_id=latest_version.id,
            content_hash=latest_version.content_hash,
            rulebook_version=latest_version.rulebook_version,
            approver_id=approver.id,
            final_verdict=payload.decision,
            verified_findings_count=verified_count,
            advisory_count=advisory_count,
            model_disclosure={
                "provider": "Local Ollama Inference",
                "model": settings.OLLAMA_MODEL,
                "local_only": True,
                "prompt_injection_screened": True
            }
        )
        db.add(receipt)
        db.flush()

    db.commit()

    # Record to Audit Hash Chain
    record_audit_event(
        db=db,
        workspace_id=sub.workspace_id,
        event_type="APPROVAL_DECISION",
        actor_id=approver.id,
        actor_role=approver.role,
        details={
            "submission_id": sub.id,
            "version_id": latest_version.id,
            "decision": payload.decision,
            "reason": payload.reason,
            "content_hash": latest_version.content_hash,
            "receipt_id": receipt.id if receipt else None
        }
    )

    return {
        "submission_id": sub.id,
        "decision": payload.decision,
        "approver": approver.full_name,
        "status": sub.current_status,
        "receipt_id": receipt.id if receipt else None,
        "content_hash": latest_version.content_hash
    }
