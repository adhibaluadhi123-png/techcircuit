"""Synthetic Seed Data for CANON Brand Governance Platform.
Fictional Brand: ApexDynamics (Labelled Synthetic Demonstration Data).
Includes users with distinct RBAC roles, active Rulebook with cited quotes and test pairs,
and Approved Fact Vault with in-date and expired facts.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, Base, engine
from app.db.models import (
    Workspace, User, Rulebook, Rule, RuleTestCase, Fact,
    AuditEvent, ProposedAmendment
)
from app.core.security import hash_password
from app.core.audit_chain import calculate_sha256, calculate_event_hash, GENESIS_PREV_HASH

WORKSPACE_ID = "ws-apexdynamics-001"

DEMO_USERS = [
    {
        "id": "usr-admin-01",
        "email": "admin@apexdynamics.example",
        "full_name": "Marcus Vance",
        "role": "ADMIN",
        "password": "Password123!"
    },
    {
        "id": "usr-manager-01",
        "email": "manager@apexdynamics.example",
        "full_name": "Elena Rostova",
        "role": "BRAND_MANAGER",
        "password": "Password123!"
    },
    {
        "id": "usr-creator-01",
        "email": "creator@apexdynamics.example",
        "full_name": "Liam Chen",
        "role": "CREATOR",
        "password": "Password123!"
    },
    {
        "id": "usr-reviewer-01",
        "email": "reviewer@apexdynamics.example",
        "full_name": "Sofia Thorne",
        "role": "AUTHORISED_REVIEWER",
        "password": "Password123!"
    },
    {
        "id": "usr-approver-01",
        "email": "approver@apexdynamics.example",
        "full_name": "Arthur Pendelton",
        "role": "APPROVER",
        "password": "Password123!"
    }
]

DEMO_RULES = [
    {
        "rule_code": "TERM-01",
        "title": "Prohibition of Deprecated 'Apex Cloud' Naming",
        "category": "Brand Naming",
        "description": "The product was rebranded to 'Apex Core'. Use of 'Apex Cloud' is strictly prohibited in all external communications.",
        "source_quote": "Apex Core is our official enterprise engine. Under no circumstances should the deprecated name 'Apex Cloud' be used in marketing, sales, or public collateral.",
        "source_section": "Section 2.1: Product Naming Architecture (Page 6)",
        "severity": "BLOCKING",
        "enforcement_type": "DETERMINISTIC",
        "pass_example": "Deploy mission-critical workloads seamlessly on Apex Core.",
        "fail_example": "Apex Cloud provides unprecedented reliability for enterprises.",
        "pattern": r"\bApex\s+Cloud\b",
        "ambiguity_status": "CLEAR"
    },
    {
        "rule_code": "NAME-01",
        "title": "Master Brand Orthography & CamelCase Capitalization",
        "category": "Brand Naming",
        "description": "The master brand name is strictly written as ApexDynamics with capital A and capital D, without internal spaces. Lowercase or spaced spellings are prohibited.",
        "source_quote": "The master brand name is strictly written as ApexDynamics with capital A and capital D, without internal spaces.",
        "source_section": "Section 2.2: Orthography and Capitalization (Page 6)",
        "severity": "BLOCKING",
        "enforcement_type": "DETERMINISTIC",
        "pass_example": "ApexDynamics powers next-generation enterprise hardware and telemetry.",
        "fail_example": "apexdynamics delivers real-time cluster telemetry.",
        "pattern": r"\b(?:apexdynamics|Apex\s+dynamics|apex\s+dynamics)\b",
        "ambiguity_status": "CLEAR"
    },
    {
        "rule_code": "TM-01",
        "title": "Mandatory Trademark Symbol on First Reference",
        "category": "Brand Naming & Trademarks",
        "description": "ApexDynamics® must display the registered trademark symbol upon its initial occurrence in all product collateral and packaging.",
        "source_quote": "ApexDynamics® and Apex Core™ must display their respective trademark designations upon their initial occurrence in all customer-facing collateral.",
        "source_section": "Section 2.4: Trademark & Legal Nomenclature (Page 7)",
        "severity": "WARNING",
        "enforcement_type": "DETERMINISTIC",
        "pass_example": "ApexDynamics® introduces next-generation computing architectures.",
        "fail_example": "ApexDynamics without registered trademark symbol.",
        "pattern": r"\bApexDynamics(?!\u00AE)\b",
        "ambiguity_status": "CLEAR"
    },
    {
        "rule_code": "LOGO-01",
        "title": "Logo Clearspace & Isolation Perimeter",
        "category": "Logo & Visual Identity",
        "description": "The primary ApexDynamics mark must always be surrounded by an isolation boundary equal to the height of the primary monogram 'A'. Never crowd or place elements within this zone.",
        "source_quote": "The primary ApexDynamics mark must always be surrounded by an isolation boundary equal to the height of the primary monogram 'A'. Never crowd or touch the logo border.",
        "source_section": "Section 3.1: Logo Isolation & Clear Space Standards (Page 8)",
        "severity": "BLOCKING",
        "enforcement_type": "DETERMINISTIC",
        "pass_example": "The official logo is placed with standard isolation clearance.",
        "fail_example": "crowded logo with overlapping elements",
        "pattern": r"\b(?:crowded\s+logo|unapproved\s+logo\s+variant|altered\s+logomark)\b",
        "ambiguity_status": "CLEAR"
    },
    {
        "rule_code": "LOGO-02",
        "title": "Forbidden Logo Alterations & Distortions",
        "category": "Logo & Visual Identity",
        "description": "Logomarks must only appear in approved single-tone White, Onyx Black, or Apex Ochre. Custom drop shadows, bevels, or unapproved gradients on the logo are strictly prohibited.",
        "source_quote": "Never apply drop shadows, 3D extrusions, or unauthorized color fills to the official logomark.",
        "source_section": "Section 3.3: Forbidden Logo Alterations (Page 10)",
        "severity": "BLOCKING",
        "enforcement_type": "DETERMINISTIC",
        "pass_example": "Monochrome logo printed on matte hardware packaging.",
        "fail_example": "distorted logo with unapproved styling",
        "pattern": r"\b(?:distorted\s+logo|recolored\s+logo|drop\s+shadow\s+on\s+logo)\b",
        "ambiguity_status": "CLEAR"
    },
    {
        "rule_code": "TERM-02",
        "title": "Prohibition of Absolute '100% Uptime Guaranteed' Claims",
        "category": "Product Claims",
        "description": "Never claim 100% uptime or absolute reliability. Refer only to our certified 99.98% availability SLA.",
        "source_quote": "We never claim '100% uptime guaranteed'. All system reliability communications must cite our certified SLA of 99.98% availability.",
        "source_section": "Section 3.4: Reliability and Legal Guarantees (Page 11)",
        "severity": "BLOCKING",
        "enforcement_type": "DETERMINISTIC",
        "pass_example": "Engineered for 99.98% SLA availability under high enterprise throughput.",
        "fail_example": "Enjoy uninterrupted service with 100% uptime guaranteed.",
        "pattern": r"\b(?:100%\s+uptime\s+guaranteed|guaranteed\s+100%\s+uptime)\b",
        "ambiguity_status": "CLEAR"
    },
    {
        "rule_code": "CLAIM-01",
        "title": "Substantiation of Comparative and Superlative Claims",
        "category": "Product Claims",
        "description": "Claims of being 'fastest' or 'industry-leading' require verifiable certified benchmark citations in footnote or accompanying text.",
        "source_quote": "Comparative claims including 'fastest' or 'market-leading' must have documented third-party benchmark proof before publication.",
        "source_section": "Section 4.3: Comparative Claims & Regulatory Compliance (Page 14)",
        "severity": "BLOCKING",
        "enforcement_type": "DETERMINISTIC",
        "pass_example": "Rated top quartile in API throughput according to the 2026 Cloud Benchmark Report.",
        "fail_example": "Apex Dynamics is the undisputed fastest platform in the world.",
        "pattern": r"\b(?:fastest\s+platform\s+in\s+the\s+world|undisputed\s+leader)\b",
        "ambiguity_status": "CLEAR"
    },
    {
        "rule_code": "TONE-01",
        "title": "Measured, Authoritative Brand Voice for Product Collateral",
        "category": "Brand Voice",
        "description": "Communications must remain professional, measured, and objective. Avoid sensationalized clickbait, desperation, or multi-exclamation marks.",
        "source_quote": "Our brand voice is confident, precise, and measured. Avoid sensationalized clickbait, multiple exclamation marks, or excessive emoji flourishes.",
        "source_section": "Section 1.2: Brand Voice Principles (Page 3)",
        "severity": "WARNING",
        "enforcement_type": "SEMANTIC_AI",
        "pass_example": "Our distributed infrastructure delivers consistent latency across global regions.",
        "fail_example": "You WON'T BELIEVE how crazy fast our platform is!!! Don't miss out 🚀🔥",
        "pattern": None,
        "ambiguity_status": "CLEAR"
    },
    {
        "rule_code": "AMBIG-01",
        "title": "General Brand Aesthetic & Premium Finish (Demonstration Ambiguous Rule)",
        "category": "Visual",
        "description": "Visual layouts should feel modern, clean, sleek, and high quality.",
        "source_quote": "Marketing headers and visuals should always appear sleek, clean, and high quality.",
        "source_section": "Section 5.1: General Visual Principles (Page 18)",
        "severity": "ADVISORY",
        "enforcement_type": "SEMANTIC_AI",
        "pass_example": "A well-balanced layout with ample white space.",
        "fail_example": "Cluttered graphics with conflicting elements.",
        "pattern": None,
        "ambiguity_status": "AMBIGUOUS"
    }
]

DEMO_FACTS = [
    {
        "fact_code": "FACT-TM-7492019",
        "subject": "Registered Trademark USPTO Reg #7,492,019",
        "approved_statement": "ApexDynamics® is a registered trademark of ApexDynamics Corporation under USPTO Registration No. 7,492,019 in Class 9 (hardware/telemetry) and Class 42 (software services).",
        "normalized_value": "7492019",
        "normalized_unit": "USPTO Reg",
        "source_document": "USPTO Certificate of Registration #7,492,019",
        "source_quote": "Registration granted on the Principal Register for ApexDynamics® under Serial No. 97-482,109.",
        "owner_name": "Marcus Vance",
        "owner_email": "admin@apexdynamics.example",
        "valid_from": datetime(2024, 1, 1, tzinfo=timezone.utc),
        "valid_until": datetime(2034, 12, 31, tzinfo=timezone.utc),
        "status": "ACTIVE"
    },
    {
        "fact_code": "FACT-LOGO-SPEC",
        "subject": "Official Vector Logo Specs & Clearspace",
        "approved_statement": "The official horizontal logo lockup requires a 4:1 aspect ratio, minimum 24px digital display height, and minimum 12mm print packaging width with 1x 'A' monogram isolation boundary.",
        "normalized_value": "4:1",
        "normalized_unit": "ratio",
        "source_document": "ApexDynamics Master Brand & Identity Guidelines v2.0",
        "source_quote": "The primary mark requires 4:1 width-to-height ratio with isolation boundary equal to monogram height on all four sides.",
        "owner_name": "Elena Rostova",
        "owner_email": "manager@apexdynamics.example",
        "valid_from": datetime(2026, 1, 1, tzinfo=timezone.utc),
        "valid_until": datetime(2028, 12, 31, tzinfo=timezone.utc),
        "status": "ACTIVE"
    },
    {
        "fact_code": "FACT-COLOR-CORE",
        "subject": "Certified Brand Palette Hex Codes",
        "approved_statement": "The certified master brand palette comprises Apex Ochre (#C87539), Warm Canvas (#FFF9F3), Midnight Brown (#382A20), and Apricot Glow (#F5A66B).",
        "normalized_value": "#C87539",
        "normalized_unit": "hex",
        "source_document": "ApexDynamics Master Brand & Identity Guidelines v2.0",
        "source_quote": "Apex Ochre #C87539 and Midnight Brown #382A20 constitute our primary brand signatures.",
        "owner_name": "Elena Rostova",
        "owner_email": "manager@apexdynamics.example",
        "valid_from": datetime(2026, 1, 1, tzinfo=timezone.utc),
        "valid_until": datetime(2028, 12, 31, tzinfo=timezone.utc),
        "status": "ACTIVE"
    },
    {
        "fact_code": "FACT-SLA-2026",
        "subject": "System Availability SLA",
        "approved_statement": "ApexDynamics guarantees an infrastructure uptime SLA of 99.98% across all multi-region clusters.",
        "normalized_value": "99.98",
        "normalized_unit": "%",
        "source_document": "2026 Service Level Agreement v4.2",
        "source_quote": "Multi-region cluster availability is certified at 99.98% monthly uptime.",
        "owner_name": "Sarah Chen",
        "owner_email": "sarah.chen@apexdynamics.example",
        "valid_from": datetime(2026, 1, 1, tzinfo=timezone.utc),
        "valid_until": datetime(2027, 12, 31, tzinfo=timezone.utc),
        "status": "ACTIVE"
    },
    {
        "fact_code": "FACT-CUST-2025",
        "subject": "Enterprise Customer Count",
        "approved_statement": "Over 1,450 verified enterprise organizations run their core telemetry on ApexDynamics.",
        "normalized_value": "1450",
        "normalized_unit": "customers",
        "source_document": "Q3 2025 Audited Growth Metrics",
        "source_quote": "Active enterprise customer count stands at 1,450 verified organizations.",
        "owner_name": "David Miller",
        "owner_email": "david.miller@apexdynamics.example",
        "valid_from": datetime(2025, 7, 1, tzinfo=timezone.utc),
        "valid_until": datetime(2025, 12, 31, tzinfo=timezone.utc),  # STALE / EXPIRED
        "status": "STALE"
    },
    {
        "fact_code": "FACT-LAT-2026",
        "subject": "Global Edge Latency",
        "approved_statement": "Global average edge latency is certified at 42ms for tier-1 metropolitan access points.",
        "normalized_value": "42",
        "normalized_unit": "ms",
        "source_document": "2026 Network Benchmark Report",
        "source_quote": "Global P95 roundtrip latency clocked at 42 milliseconds across 180 edge nodes.",
        "owner_name": "Alex Rivera",
        "owner_email": "alex.rivera@apexdynamics.example",
        "valid_from": datetime(2026, 1, 15, tzinfo=timezone.utc),
        "valid_until": datetime(2027, 1, 15, tzinfo=timezone.utc),
        "status": "ACTIVE"
    },
    {
        "fact_code": "FACT-COMP-2026",
        "subject": "Security Compliance",
        "approved_statement": "ApexDynamics is officially certified under SOC 2 Type II and ISO 27001 standards.",
        "normalized_value": "SOC 2 Type II",
        "normalized_unit": None,
        "source_document": "Annual Security Audit Attestation 2026",
        "source_quote": "Independent auditor issued clean SOC 2 Type II certification valid through Q2 2027.",
        "owner_name": "Elena Rostova",
        "owner_email": "elena.rostova@apexdynamics.example",
        "valid_from": datetime(2026, 2, 1, tzinfo=timezone.utc),
        "valid_until": datetime(2027, 5, 15, tzinfo=timezone.utc),
        "status": "ACTIVE"
    }
]

def seed_database(db: Session = None):
    """Seed initial synthetic workspace, users, rules, and facts."""
    close_db = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        # 1. Create Workspace
        ws = db.query(Workspace).filter(Workspace.id == WORKSPACE_ID).first()
        if not ws:
            ws = Workspace(
                id=WORKSPACE_ID,
                name="ApexDynamics (Synthetic Demo)",
                slug="apexdynamics"
            )
            db.add(ws)
            db.flush()

        # 2. Seed Users
        for u_data in DEMO_USERS:
            existing_user = db.query(User).filter(User.email == u_data["email"]).first()
            if not existing_user:
                new_user = User(
                    id=u_data["id"],
                    workspace_id=WORKSPACE_ID,
                    email=u_data["email"],
                    full_name=u_data["full_name"],
                    role=u_data["role"],
                    hashed_password=hash_password(u_data["password"])
                )
                db.add(new_user)
        db.flush()

        # 3. Seed Rulebook & Rules
        rulebook = db.query(Rulebook).filter(Rulebook.workspace_id == WORKSPACE_ID).first()
        if not rulebook:
            rulebook = Rulebook(
                workspace_id=WORKSPACE_ID,
                version="1.0.0",
                title="ApexDynamics Master Brand & Identity Guidelines v1.0",
                description="Official compiled brand governance rulebook covering product naming architecture, trademarks, logo clearspace, color palettes, and certified product specifications.",
                status="ACTIVE"
            )
            db.add(rulebook)
            db.flush()
        else:
            rulebook.version = "1.0.0"
            rulebook.title = "ApexDynamics Master Brand & Identity Guidelines v1.0"
            rulebook.description = "Official compiled brand governance rulebook covering product naming architecture, trademarks, logo clearspace, color palettes, and certified product specifications."
            db.flush()

        for r_data in DEMO_RULES:
            existing_rule = db.query(Rule).filter(
                Rule.rulebook_id == rulebook.id,
                Rule.rule_code == r_data["rule_code"]
            ).first()

            if not existing_rule:
                rule = Rule(
                    rulebook_id=rulebook.id,
                    rule_code=r_data["rule_code"],
                    title=r_data["title"],
                    category=r_data["category"],
                    description=r_data["description"],
                    source_quote=r_data["source_quote"],
                    source_section=r_data["source_section"],
                    severity=r_data["severity"],
                    enforcement_type=r_data["enforcement_type"],
                    pass_example=r_data["pass_example"],
                    fail_example=r_data["fail_example"],
                    ambiguity_status=r_data["ambiguity_status"],
                    status="ACTIVE"
                )
                db.add(rule)
                db.flush()

                # Add test cases for rule
                tc_pass = RuleTestCase(
                    rule_id=rule.id,
                    input_text=r_data["pass_example"],
                    expected_verdict="PASS",
                    explanation=f"Valid compliance example for {r_data['rule_code']}"
                )
                tc_fail = RuleTestCase(
                    rule_id=rule.id,
                    input_text=r_data["fail_example"],
                    expected_verdict="FAIL",
                    explanation=f"Violation sample for {r_data['rule_code']}"
                )
                db.add_all([tc_pass, tc_fail])
            else:
                existing_rule.title = r_data["title"]
                existing_rule.category = r_data["category"]
                existing_rule.description = r_data["description"]
                existing_rule.source_quote = r_data["source_quote"]
                existing_rule.source_section = r_data["source_section"]
                existing_rule.pass_example = r_data["pass_example"]
                existing_rule.fail_example = r_data["fail_example"]
                existing_rule.ambiguity_status = r_data["ambiguity_status"]
        db.flush()

        # 4. Seed Facts
        for f_data in DEMO_FACTS:
            existing_fact = db.query(Fact).filter(
                Fact.workspace_id == WORKSPACE_ID,
                Fact.fact_code == f_data["fact_code"]
            ).first()
            if not existing_fact:
                fact = Fact(
                    workspace_id=WORKSPACE_ID,
                    fact_code=f_data["fact_code"],
                    subject=f_data["subject"],
                    approved_statement=f_data["approved_statement"],
                    normalized_value=f_data["normalized_value"],
                    normalized_unit=f_data["normalized_unit"],
                    source_document=f_data["source_document"],
                    source_quote=f_data["source_quote"],
                    owner_name=f_data["owner_name"],
                    owner_email=f_data["owner_email"],
                    valid_from=f_data["valid_from"],
                    valid_until=f_data["valid_until"],
                    status=f_data["status"]
                )
                db.add(fact)

        # 5. Seed Genesis Audit Event
        existing_event = db.query(AuditEvent).filter(AuditEvent.workspace_id == WORKSPACE_ID).first()
        if not existing_event:
            now = datetime.now(timezone.utc)
            payload_str = '{"action": "GENESIS_SEED", "workspace": "ApexDynamics"}'
            p_hash = calculate_sha256(payload_str)
            genesis_hash = calculate_event_hash(
                GENESIS_PREV_HASH, "usr-admin-01", "WORKSPACE_INITIALIZATION", p_hash, now.isoformat()
            )
            event = AuditEvent(
                workspace_id=WORKSPACE_ID,
                event_type="WORKSPACE_INITIALIZATION",
                actor_id="usr-admin-01",
                actor_role="ADMIN",
                payload_hash=p_hash,
                prev_event_hash=GENESIS_PREV_HASH,
                current_event_hash=genesis_hash,
                timestamp_str=now.isoformat(),
                details={"action": "GENESIS_SEED", "workspace": "ApexDynamics"},
                created_at=now
            )
            db.add(event)

        db.commit()
        print("✓ Synthetic seed data successfully populated for ApexDynamics.")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_database()
