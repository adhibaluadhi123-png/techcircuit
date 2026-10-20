"""Approved Fact Vault Routes."""
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Fact
from app.schemas.domain import FactResponse, FactCreate, FactUpdate
from app.core.audit_chain import record_audit_event
from app.config import settings

router = APIRouter(prefix="/facts", tags=["Approved Fact Vault"])

@router.get("", response_model=List[FactResponse])
def list_approved_facts(
    workspace_id: str = settings.DEFAULT_WORKSPACE_ID,
    db: Session = Depends(get_db)
):
    """Retrieve all approved facts from the vault with real-time expiry calculations."""
    now = datetime.now(timezone.utc)
    facts = db.query(Fact).filter(Fact.workspace_id == workspace_id).all()
    
    results = []
    for f in facts:
        fact_res = FactResponse.model_validate(f)
        valid_until = f.valid_until
        if valid_until.tzinfo is None:
            valid_until = valid_until.replace(tzinfo=timezone.utc)
        fact_res.is_expired = valid_until < now
        results.append(fact_res)
        
    return results

@router.post("", response_model=FactResponse)
def create_approved_fact(
    payload: FactCreate,
    actor_id: str = "usr-manager-01",
    workspace_id: str = settings.DEFAULT_WORKSPACE_ID,
    db: Session = Depends(get_db)
):
    """Add a new certified fact with owner, source document citation, and expiry date."""
    now = datetime.now(timezone.utc)
    new_fact = Fact(
        workspace_id=workspace_id,
        fact_code=payload.fact_code,
        subject=payload.subject,
        approved_statement=payload.approved_statement,
        normalized_value=payload.normalized_value,
        normalized_unit=payload.normalized_unit,
        source_document=payload.source_document,
        source_quote=payload.source_quote,
        owner_name=payload.owner_name,
        owner_email=payload.owner_email,
        valid_from=payload.valid_from or now,
        valid_until=payload.valid_until,
        status="ACTIVE"
    )
    db.add(new_fact)
    db.commit()
    db.refresh(new_fact)
    
    record_audit_event(
        db=db,
        workspace_id=workspace_id,
        event_type="FACT_VAULT_ADDITION",
        actor_id=actor_id,
        actor_role="BRAND_MANAGER",
        details={
            "fact_id": new_fact.id,
            "fact_code": new_fact.fact_code,
            "subject": new_fact.subject,
            "owner": new_fact.owner_email
        }
    )
    
    res = FactResponse.model_validate(new_fact)
    valid_until = new_fact.valid_until
    if valid_until.tzinfo is None:
        valid_until = valid_until.replace(tzinfo=timezone.utc)
    res.is_expired = valid_until < now
    return res

@router.put("/{fact_id}", response_model=FactResponse)
def update_fact(
    fact_id: str,
    payload: FactUpdate,
    actor_id: str = "usr-manager-01",
    db: Session = Depends(get_db)
):
    """Update approved statement, owner, or extend expiry date."""
    fact = db.query(Fact).filter(Fact.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
        
    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(fact, field, val)
        
    db.commit()
    db.refresh(fact)
    
    res = FactResponse.model_validate(fact)
    now = datetime.now(timezone.utc)
    valid_until = fact.valid_until
    if valid_until.tzinfo is None:
        valid_until = valid_until.replace(tzinfo=timezone.utc)
    res.is_expired = valid_until < now
    return res
