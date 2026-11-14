"""
Automated Pytest Suite for Kestrel Finance Python Engine
Verifies 100% of domain assertions:
1. ₹25L boundary conditions (₹24,99,999 allowed, ₹25,00,000 blocked).
2. Gap check continuity and GST turnover divergence.
3. Analyst verification gate.
4. Credit Officer rationale length limits.
"""

from backend.rules import (
    evaluate_ticket_eligibility,
    evaluate_gap_diagnostics,
    validate_analyst_spreading_gate,
    validate_credit_signoff_gate
)
from backend.schemas import (
    DocumentGapCheckRequest,
    ExtractedFigure,
    BoundingBox,
    DocumentType
)


def test_ticket_size_ceiling_eligibility():
    # Boundary tests
    assert evaluate_ticket_eligibility(1800000.0).is_eligible is True
    assert evaluate_ticket_eligibility(2499999.0).is_eligible is True
    
    # Zero tolerance hard blocks
    assert evaluate_ticket_eligibility(2500000.0).is_eligible is False
    assert evaluate_ticket_eligibility(4500000.0).is_eligible is False
    assert "exceeds ₹25 Lakh ceiling" in evaluate_ticket_eligibility(2500000.0).message


def test_gap_check_period_continuity():
    # 6 continuous months
    req_pass = DocumentGapCheckRequest(
        application_id="APP-1001",
        gst_turnover=16200000.0,
        annualized_bank_credits=16900000.0,
        statement_months_present=["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        statement_months_required=6,
        file_hashes=["hash1", "hash2"]
    )
    results = evaluate_gap_diagnostics(req_pass)
    assert any(r.rule_id == "GAP-101" and r.passed for r in results)
    assert any(r.rule_id == "GAP-301" and r.passed for r in results)

    # Missing months break
    req_break = DocumentGapCheckRequest(
        application_id="APP-1002",
        gst_turnover=16200000.0,
        annualized_bank_credits=16900000.0,
        statement_months_present=["May", "Jun", "Jul"],
        statement_months_required=6,
        file_hashes=["hash1", "hash2"]
    )
    break_results = evaluate_gap_diagnostics(req_break)
    assert any(r.rule_id == "GAP-101" and not r.passed and r.severity == "error" for r in break_results)


def test_gst_banking_turnover_variance_flag():
    # Variance > 15% (₹1.0 Cr vs ₹1.62 Cr = ~38% divergence)
    req_flag = DocumentGapCheckRequest(
        application_id="APP-1003",
        gst_turnover=16200000.0,
        annualized_bank_credits=10000000.0,
        statement_months_present=["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        statement_months_required=6
    )
    flag_results = evaluate_gap_diagnostics(req_flag)
    turnover_issue = next(r for r in flag_results if r.rule_id == "GAP-301")
    assert turnover_issue.passed is False
    assert turnover_issue.severity == "warning"


def test_analyst_spreading_lock_gate():
    bbox = BoundingBox(x=10.0, y=10.0, width=20.0, height=5.0)
    fig_unchecked = ExtractedFigure(
        id="FIG-1",
        field_key="total_credits",
        label="Total Credits",
        document_type=DocumentType.BANK_STATEMENT,
        extracted_value=8450000.0,
        status="Unchecked",
        bounding_box=bbox
    )
    fig_confirmed = ExtractedFigure(
        id="FIG-2",
        field_key="total_debits",
        label="Total Debits",
        document_type=DocumentType.BANK_STATEMENT,
        extracted_value=7820000.0,
        status="Confirmed",
        bounding_box=bbox
    )

    # Locked when unchecked remain
    allowed, msg = validate_analyst_spreading_gate([fig_unchecked, fig_confirmed])
    assert allowed is False
    assert "Gate locked" in msg

    # Unlocked when 100% verified
    fig_unchecked.status = "Confirmed"
    allowed_unlocked, _ = validate_analyst_spreading_gate([fig_unchecked, fig_confirmed])
    assert allowed_unlocked is True


def test_credit_officer_signoff_rationale_gate():
    # Non-officer blocked
    allowed, msg = validate_credit_signoff_gate("Relationship Manager", "Comprehensive underwriting note.")
    assert allowed is False
    assert "Role restriction" in msg

    # Insufficient rationale (< 10 chars) blocked
    allowed, msg = validate_credit_signoff_gate("Credit Officer", "Short")
    assert allowed is False
    assert "at least 10 characters" in msg

    # Valid Credit Officer with comprehensive rationale
    allowed, msg = validate_credit_signoff_gate("Credit Officer", "Facility approved: DSCR 1.82x exceeds benchmark.")
    assert allowed is True
