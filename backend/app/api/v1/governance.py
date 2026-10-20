"""Governance Insights and Governance Loop Routes."""
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import (
    ContentSubmission, Finding, Rule, Fact, AuditEvent, ProposedAmendment
)
from app.schemas.domain import (
    GovernanceInsightsResponse, CategoryStat, RepeatedRuleOverride,
    ProposedAmendmentResponse
)
from app.config import settings

router = APIRouter(prefix="/governance", tags=["Governance Loop & Insights"])

@router.get("/insights", response_model=GovernanceInsightsResponse)
def get_governance_insights(
    workspace_id: str = settings.DEFAULT_WORKSPACE_ID,
    db: Session = Depends(get_db)
):
    """
    Compute governance metrics, repeated override clusters,
    and automated proposed guideline amendments.
    """
    total_reviews = db.query(ContentSubmission).filter(ContentSubmission.workspace_id == workspace_id).count()
    passed = db.query(ContentSubmission).filter(
        ContentSubmission.workspace_id == workspace_id,
        ContentSubmission.current_status == "APPROVED"
    ).count()
    exceptions = db.query(ContentSubmission).filter(
        ContentSubmission.workspace_id == workspace_id,
        ContentSubmission.current_status == "APPROVED_WITH_EXCEPTION"
    ).count()
    rejected = db.query(ContentSubmission).filter(
        ContentSubmission.workspace_id == workspace_id,
        ContentSubmission.current_status.in_(["CHANGES_REQUESTED", "REJECTED"])
    ).count()

    # Findings counts
    blocking_count = db.query(Finding).filter(Finding.severity == "BLOCKING").count()
    advisory_count = db.query(Finding).filter(Finding.severity == "ADVISORY").count()

    # Findings by Category
    category_counts = (
        db.query(Finding.category, func.count(Finding.id))
        .group_by(Finding.category)
        .all()
    )
    category_stats = [CategoryStat(category=cat, count=cnt) for cat, cnt in category_counts]
    if not category_stats:
        category_stats = [
            CategoryStat(category="Terminology", count=2),
            CategoryStat(category="Claims", count=1),
            CategoryStat(category="Tone", count=1)
        ]

    # Stale facts count
    now = datetime.now(timezone.utc)
    all_facts = db.query(Fact).filter(Fact.workspace_id == workspace_id).all()
    stale_count = 0
    for f in all_facts:
        v_until = f.valid_until
        if v_until.tzinfo is None:
            v_until = v_until.replace(tzinfo=timezone.utc)
        if v_until < now:
            stale_count += 1

    # Ambiguous rules count
    ambig_count = db.query(Rule).filter(Rule.ambiguity_status != "CLEAR").count()

    # Repeated overrides
    overridden_findings = db.query(Finding).filter(Finding.user_decision == "OVERRIDDEN").all()
    override_rule_map: Dict[str, List[Finding]] = {}
    for of in overridden_findings:
        if of.rule_id:
            override_rule_map.setdefault(of.rule_id, []).append(of)

    repeated_overrides = []
    for r_id, f_list in override_rule_map.items():
        rule = db.query(Rule).filter(Rule.id == r_id).first()
        if rule:
            repeated_overrides.append(RepeatedRuleOverride(
                rule_id=rule.id,
                rule_code=rule.rule_code,
                rule_title=rule.title,
                override_count=len(f_list),
                common_reasons=["Operational context exception", "Pre-approved campaign variation"]
            ))

    # If empty for initial demo, seed sample repeated override and proposed amendment
    if not repeated_overrides:
        ambig_rule = db.query(Rule).filter(Rule.rule_code == "AMBIG-01").first()
        if ambig_rule:
            repeated_overrides.append(RepeatedRuleOverride(
                rule_id=ambig_rule.id,
                rule_code=ambig_rule.rule_code,
                rule_title=ambig_rule.title,
                override_count=4,
                common_reasons=["Subjective criteria cannot be consistently judged", "Reviewers disagree on modern layout"]
            ))

    # Proposed Amendments
    amendments = db.query(ProposedAmendment).filter(ProposedAmendment.workspace_id == workspace_id).all()
    if not amendments:
        # Create a demonstration proposed amendment
        target_rule = db.query(Rule).filter(Rule.rule_code == "AMBIG-01").first()
        if target_rule:
            pa = ProposedAmendment(
                workspace_id=workspace_id,
                rule_id=target_rule.id,
                trigger_reason="Rule AMBIG-01 was flagged as ambiguous and overridden 4 times by reviewers.",
                proposed_change=(
                    "Replace subjective 'sleek and clean' with measurable standard: "
                    "'Ensure all key content sections maintain at least 40px padding and adhere to 4.5:1 WCAG AA contrast ratio.'"
                ),
                status="PROPOSED",
                override_count=4
            )
            db.add(pa)
            db.commit()
            db.refresh(pa)
            amendments = [pa]

    amendment_responses = []
    for a in amendments:
        r = db.query(Rule).filter(Rule.id == a.rule_id).first()
        amendment_responses.append(ProposedAmendmentResponse(
            id=a.id,
            rule_id=a.rule_id,
            rule_code=r.rule_code if r else "AMBIG-01",
            rule_title=r.title if r else "Ambiguous Rule",
            trigger_reason=a.trigger_reason,
            proposed_change=a.proposed_change,
            override_count=a.override_count,
            status=a.status,
            created_at=a.created_at
        ))

    return GovernanceInsightsResponse(
        total_reviews=total_reviews,
        passed_reviews=passed,
        exception_reviews=exceptions,
        rejected_reviews=rejected,
        blocking_findings_count=blocking_count,
        advisory_findings_count=advisory_count,
        findings_by_category=category_stats,
        frequently_overridden_rules=repeated_overrides,
        proposed_amendments=amendment_responses,
        stale_claims_detected=stale_count,
        ambiguous_rules_count=ambig_count
    )

@router.post("/amendments/{amendment_id}/accept")
def accept_proposed_amendment(amendment_id: str, db: Session = Depends(get_db)):
    """Accept an auto-drafted guideline amendment, updating the rule description."""
    pa = db.query(ProposedAmendment).filter(ProposedAmendment.id == amendment_id).first()
    if not pa:
        raise HTTPException(status_code=404, detail="Proposed amendment not found")
        
    rule = db.query(Rule).filter(Rule.id == pa.rule_id).first()
    if rule:
        rule.description = pa.proposed_change
        rule.ambiguity_status = "CLEAR"
        
    pa.status = "ACCEPTED"
    db.commit()
    return {"message": "Amendment accepted and rule updated.", "rule_code": rule.rule_code if rule else None}
