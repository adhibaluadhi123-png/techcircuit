"""Tamper-Evident Audit Trail and Receipt Routes."""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import AuditEvent, ReviewReceipt, User
from app.schemas.domain import (
    AuditEventResponse, AuditChainVerificationResult, ReviewReceiptResponse
)
from app.core.audit_chain import verify_audit_chain
from app.config import settings

router = APIRouter(prefix="/audit", tags=["Tamper-Evident Audit Trail"])

@router.get("/events", response_model=List[AuditEventResponse])
def list_audit_events(
    workspace_id: str = settings.DEFAULT_WORKSPACE_ID,
    db: Session = Depends(get_db)
):
    """Retrieve chronological append-only audit events for the workspace."""
    events = (
        db.query(AuditEvent)
        .filter(AuditEvent.workspace_id == workspace_id)
        .order_by(AuditEvent.created_at.desc())
        .limit(100)
        .all()
    )
    return [AuditEventResponse.model_validate(e) for e in events]

@router.get("/verify", response_model=AuditChainVerificationResult)
def verify_workspace_audit_chain(
    workspace_id: str = settings.DEFAULT_WORKSPACE_ID,
    db: Session = Depends(get_db)
):
    """
    Run cryptographic verification over the entire sequential hash chain.
    Recalculates every block hash and confirms zero tampering.
    """
    verification_data = verify_audit_chain(db, workspace_id)
    return AuditChainVerificationResult(**verification_data)

@router.get("/receipt/{receipt_id}", response_model=ReviewReceiptResponse)
def get_review_receipt(receipt_id: str, db: Session = Depends(get_db)):
    """Retrieve an official Review Receipt with content SHA-256 hash and model disclosure."""
    receipt = db.query(ReviewReceipt).filter(ReviewReceipt.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Review receipt not found")
        
    approver = db.query(User).filter(User.id == receipt.approver_id).first() if receipt.approver_id else None
    
    res = ReviewReceiptResponse.model_validate(receipt)
    res.approver_name = approver.full_name if approver else "System Attestation"
    return res
