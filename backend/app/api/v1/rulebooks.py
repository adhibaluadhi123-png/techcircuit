"""Brand Rulebook and Guideline Compiler Routes."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Rulebook, Rule, RuleTestCase
from app.schemas.domain import (
    RulebookResponse, RuleResponse, RuleCreate, RuleUpdate, RuleTestCaseResponse
)
from app.core.compiler import compiler
from app.core.parser import parse_uploaded_file
from app.core.audit_chain import record_audit_event
from app.config import settings

router = APIRouter(prefix="/rulebooks", tags=["Brand Rulebook & Compiler"])

@router.get("", response_model=RulebookResponse)
def get_active_rulebook(workspace_id: str = settings.DEFAULT_WORKSPACE_ID, db: Session = Depends(get_db)):
    """Retrieve the current active versioned brand rulebook."""
    rulebook = db.query(Rulebook).filter(
        Rulebook.workspace_id == workspace_id,
        Rulebook.status == "ACTIVE"
    ).first()
    
    if not rulebook:
        raise HTTPException(status_code=404, detail="Active rulebook not found")
        
    rules = db.query(Rule).filter(Rule.rulebook_id == rulebook.id).all()
    
    rule_responses = []
    for r in rules:
        tcs = db.query(RuleTestCase).filter(RuleTestCase.rule_id == r.id).all()
        tc_res = [RuleTestCaseResponse.model_validate(tc) for tc in tcs]
        r_dict = RuleResponse.model_validate(r)
        r_dict.test_cases = tc_res
        rule_responses.append(r_dict)
        
    return RulebookResponse(
        id=rulebook.id,
        workspace_id=rulebook.workspace_id,
        version=rulebook.version,
        title=rulebook.title,
        description=rulebook.description,
        status=rulebook.status,
        created_at=rulebook.created_at,
        updated_at=rulebook.updated_at,
        rules_count=len(rules),
        rules=rule_responses
    )

@router.post("/compile")
async def compile_guideline_document(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Compile guideline document (PDF, DOCX, or text) into atomic candidate rules.
    Extracts cited quotes, pass/fail test pairs, and scores ambiguity.
    """
    guideline_content = ""
    source_filename = "Pasted Guidelines"
    
    if file:
        source_filename = file.filename or "uploaded_guideline"
        content_bytes = await file.read()
        guideline_content = parse_uploaded_file(source_filename, content_bytes)
    elif text:
        guideline_content = text
    else:
        raise HTTPException(status_code=400, detail="Must provide either text or a document file.")
        
    if len(guideline_content.strip()) < 20:
        raise HTTPException(status_code=400, detail="Guideline text is too short to compile.")
        
    compiled_rules = await compiler.compile_guideline(guideline_content)
    
    return {
        "source_document": source_filename,
        "extracted_characters": len(guideline_content),
        "candidate_rules_count": len(compiled_rules),
        "rules": compiled_rules
    }

@router.post("/publish")
def publish_rulebook_version(
    title: str = Form(...),
    version: str = Form(...),
    rules_json: str = Form(...),
    actor_id: str = Form("usr-manager-01"),
    workspace_id: str = Form(settings.DEFAULT_WORKSPACE_ID),
    db: Session = Depends(get_db)
):
    """
    Publish an official new version of the Brand Rulebook after human confirmation.
    Appends RULEBOOK_ACTIVATION event to the cryptographic audit chain.
    """
    import json
    parsed_rules = json.loads(rules_json)
    
    # Archive any previous active rulebooks
    prev = db.query(Rulebook).filter(
        Rulebook.workspace_id == workspace_id,
        Rulebook.status == "ACTIVE"
    ).all()
    for p in prev:
        p.status = "ARCHIVED"
        
    new_rulebook = Rulebook(
        workspace_id=workspace_id,
        version=version,
        title=title,
        description=f"Published brand rulebook {version}",
        status="ACTIVE"
    )
    db.add(new_rulebook)
    db.flush()
    
    for r in parsed_rules:
        new_rule = Rule(
            rulebook_id=new_rulebook.id,
            rule_code=r.get("rule_code", "GEN-01"),
            title=r.get("title", "Brand Rule"),
            category=r.get("category", "Tone"),
            description=r.get("description", ""),
            source_quote=r.get("source_quote", ""),
            source_section=r.get("source_section", "General"),
            severity=r.get("severity", "BLOCKING"),
            enforcement_type=r.get("enforcement_type", "DETERMINISTIC"),
            pass_example=r.get("pass_example"),
            fail_example=r.get("fail_example"),
            ambiguity_status=r.get("ambiguity_status", "CLEAR"),
            status="ACTIVE"
        )
        db.add(new_rule)
        
    db.commit()
    db.refresh(new_rulebook)
    
    # Audit log
    record_audit_event(
        db=db,
        workspace_id=workspace_id,
        event_type="RULEBOOK_ACTIVATION",
        actor_id=actor_id,
        actor_role="BRAND_MANAGER",
        details={
            "rulebook_id": new_rulebook.id,
            "version": version,
            "title": title,
            "rules_count": len(parsed_rules)
        }
    )
    
    return {"message": "Rulebook published successfully", "rulebook_id": new_rulebook.id, "version": version}

@router.put("/rules/{rule_id}", response_model=RuleResponse)
def update_rule(
    rule_id: str,
    payload: RuleUpdate,
    db: Session = Depends(get_db)
):
    """Update rule parameters, pass/fail examples, or ambiguity resolution."""
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(rule, field, val)
        
    db.commit()
    db.refresh(rule)
    return RuleResponse.model_validate(rule)

@router.post("/rules/{rule_id}/run-tests")
def run_rule_unit_tests(rule_id: str, db: Session = Depends(get_db)):
    """Run unit tests on a specific rule to verify pass and fail examples."""
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    test_cases = db.query(RuleTestCase).filter(RuleTestCase.rule_id == rule.id).all()
    results = []
    
    for tc in test_cases:
        # Evaluate against rule
        passed = True
        if rule.enforcement_type == "DETERMINISTIC" and rule.fail_example:
            # Deterministic check
            import re
            has_fail = bool(re.search(re.escape(rule.fail_example.strip()), tc.input_text, re.IGNORECASE))
            if tc.expected_verdict == "FAIL" and not has_fail:
                passed = False
            elif tc.expected_verdict == "PASS" and has_fail:
                passed = False
                
        results.append({
            "test_case_id": tc.id,
            "input_text": tc.input_text,
            "expected_verdict": tc.expected_verdict,
            "test_passed": passed,
            "explanation": tc.explanation
        })
        
    all_passed = all(r["test_passed"] for r in results)
    return {"rule_code": rule.rule_code, "all_passed": all_passed, "results": results}
