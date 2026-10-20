"""Pydantic Domain Schemas for CANON Brand Governance Platform."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ==========================================
# Auth & User Schemas
# ==========================================

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str
    full_name: str
    role: str
    workspace_id: str


class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "CREATOR"  # ADMIN, BRAND_MANAGER, CREATOR, AUTHORISED_REVIEWER, APPROVER


class UserCreate(UserBase):
    password: str
    workspace_id: Optional[str] = None


class UserResponse(UserBase):
    id: str
    workspace_id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str


# ==========================================
# Rulebook & Rule Schemas
# ==========================================

class RuleTestCaseBase(BaseModel):
    input_text: str
    expected_verdict: str  # PASS, FAIL
    explanation: Optional[str] = None


class RuleTestCaseResponse(RuleTestCaseBase):
    id: str
    rule_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class RuleBase(BaseModel):
    rule_code: str
    title: str
    category: str
    description: str
    source_document_id: Optional[str] = None
    source_version: str = "1.0"
    source_quote: str  # Mandatory evidence citation
    source_section: str
    severity: str = "BLOCKING"  # BLOCKING, WARNING, ADVISORY
    enforcement_type: str = "DETERMINISTIC"  # DETERMINISTIC, SEMANTIC_AI
    pass_example: Optional[str] = None
    fail_example: Optional[str] = None
    ambiguity_status: str = "CLEAR"  # CLEAR, AMBIGUOUS, CONFLICTING
    status: str = "ACTIVE"


class RuleCreate(RuleBase):
    test_cases: Optional[List[RuleTestCaseBase]] = None


class RuleUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    source_quote: Optional[str] = None
    source_section: Optional[str] = None
    severity: Optional[str] = None
    enforcement_type: Optional[str] = None
    pass_example: Optional[str] = None
    fail_example: Optional[str] = None
    ambiguity_status: Optional[str] = None
    status: Optional[str] = None


class RuleResponse(RuleBase):
    id: str
    rulebook_id: str
    created_at: datetime
    test_cases: List[RuleTestCaseResponse] = []

    class Config:
        from_attributes = True


class RulebookBase(BaseModel):
    version: str
    title: str
    description: Optional[str] = None
    status: str = "ACTIVE"


class RulebookResponse(RulebookBase):
    id: str
    workspace_id: str
    created_at: datetime
    updated_at: datetime
    rules_count: int = 0
    rules: List[RuleResponse] = []

    class Config:
        from_attributes = True


# ==========================================
# Approved Fact Vault Schemas
# ==========================================

class FactBase(BaseModel):
    fact_code: str
    subject: str
    approved_statement: str
    normalized_value: Optional[str] = None
    normalized_unit: Optional[str] = None
    source_document: str
    source_quote: str
    owner_name: str
    owner_email: str
    valid_from: Optional[datetime] = None
    valid_until: datetime
    status: str = "ACTIVE"  # ACTIVE, STALE, SUPERSEDED


class FactCreate(FactBase):
    pass


class FactUpdate(BaseModel):
    subject: Optional[str] = None
    approved_statement: Optional[str] = None
    normalized_value: Optional[str] = None
    normalized_unit: Optional[str] = None
    source_document: Optional[str] = None
    source_quote: Optional[str] = None
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    valid_until: Optional[datetime] = None
    status: Optional[str] = None


class FactResponse(FactBase):
    id: str
    workspace_id: str
    created_at: datetime
    is_expired: bool = False

    class Config:
        from_attributes = True


# ==========================================
# Review & Finding Schemas
# ==========================================

class ExtractedClaimResponse(BaseModel):
    id: str
    content_version_id: str
    matched_fact_id: Optional[str] = None
    claim_text: str
    claim_type: str
    status: str  # SUPPORTED, STALE, CONTRADICTED, UNSUPPORTED, NEEDS_PROOF
    reasoning: Optional[str] = None
    matched_fact: Optional[FactResponse] = None

    class Config:
        from_attributes = True


class IntentCardResponse(BaseModel):
    id: str
    purpose: str
    target_audience: str
    call_to_action: str
    must_keep_facts: List[str] = []
    product_names: List[str] = []
    numerical_claims: List[str] = []
    tone_constraints: List[str] = []
    preservation_status: str

    class Config:
        from_attributes = True


class FindingResponse(BaseModel):
    id: str
    content_version_id: str
    rule_id: Optional[str] = None
    rule_code: Optional[str] = None
    category: str
    severity: str  # BLOCKING, WARNING, ADVISORY
    span_start: int
    span_end: int
    matched_text: str
    source_quote: Optional[str] = None
    source_section: Optional[str] = None
    explanation: str
    evidence_status: str
    confidence_tier: str  # DETERMINISTIC, EVIDENCE_BACKED_AI, ADVISORY
    suggested_correction: Optional[str] = None
    verification_status: str  # VERIFIED, REJECTED, DEMOTED
    rejection_reason: Optional[str] = None
    user_decision: str  # PENDING, ACCEPTED, DISPUTED, OVERRIDDEN
    created_at: datetime

    class Config:
        from_attributes = True


class FindingDecisionUpdate(BaseModel):
    user_decision: str  # ACCEPTED, DISPUTED, OVERRIDDEN
    override_reason: Optional[str] = None


class ContentSubmissionCreate(BaseModel):
    title: str
    content_text: str
    content_type: str = "TEXT"  # TEXT, PDF, DOCX, IMAGE
    filename: Optional[str] = None


class ContentSubmissionResponse(BaseModel):
    id: str
    workspace_id: str
    creator_id: str
    creator_name: Optional[str] = None
    title: str
    content_type: str
    original_filename: Optional[str] = None
    current_status: str
    created_at: datetime
    updated_at: datetime
    latest_version: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class ReviewResultResponse(BaseModel):
    submission_id: str
    version_id: str
    version_number: int
    content_hash: str
    rulebook_version: str
    overall_status: str
    blocking_findings_count: int
    warning_findings_count: int
    advisory_findings_count: int
    intent_preservation_status: str
    findings: List[FindingResponse]
    claims: List[ExtractedClaimResponse]
    intent_card: Optional[IntentCardResponse] = None
    diff_html: Optional[str] = None
    suggested_full_text: Optional[str] = None
    model_disclosure: Dict[str, Any] = {}


# ==========================================
# Approval & Decision Schemas
# ==========================================

class ApprovalDecisionCreate(BaseModel):
    decision: str  # APPROVED, APPROVED_WITH_EXCEPTION, REJECTED, CHANGES_REQUESTED
    reason: Optional[str] = None
    exception_category: Optional[str] = None


class ApprovalDecisionResponse(BaseModel):
    id: str
    content_version_id: str
    approver_id: str
    approver_name: Optional[str] = None
    approver_role: Optional[str] = None
    decision: str
    reason: Optional[str] = None
    exception_category: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# Review Receipt & Audit Schemas
# ==========================================

class ReviewReceiptResponse(BaseModel):
    id: str
    submission_id: str
    content_version_id: str
    content_hash: str
    rulebook_version: str
    approver_id: Optional[str] = None
    approver_name: Optional[str] = None
    final_verdict: str
    verified_findings_count: int
    advisory_count: int
    model_disclosure: Dict[str, Any]
    issued_at: datetime

    class Config:
        from_attributes = True


class AuditEventResponse(BaseModel):
    id: str
    workspace_id: str
    event_type: str
    actor_id: str
    actor_role: str
    payload_hash: str
    prev_event_hash: str
    current_event_hash: str
    details: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class AuditChainVerificationResult(BaseModel):
    is_valid: bool
    total_events: int
    verified_events: int
    broken_event_id: Optional[str] = None
    message: str


# ==========================================
# Governance Insights Schemas
# ==========================================

class CategoryStat(BaseModel):
    category: str
    count: int


class RepeatedRuleOverride(BaseModel):
    rule_id: str
    rule_code: str
    rule_title: str
    override_count: int
    common_reasons: List[str]


class ProposedAmendmentResponse(BaseModel):
    id: str
    rule_id: str
    rule_code: str
    rule_title: str
    trigger_reason: str
    proposed_change: str
    override_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class GovernanceInsightsResponse(BaseModel):
    total_reviews: int
    passed_reviews: int
    exception_reviews: int
    rejected_reviews: int
    blocking_findings_count: int
    advisory_findings_count: int
    findings_by_category: List[CategoryStat]
    frequently_overridden_rules: List[RepeatedRuleOverride]
    proposed_amendments: List[ProposedAmendmentResponse]
    stale_claims_detected: int
    ambiguous_rules_count: int
