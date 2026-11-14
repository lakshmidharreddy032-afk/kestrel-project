"""
Standard Library Test Suite for Kestrel Finance Python Rules
Runs with zero external dependencies via: python -m unittest discover backend/tests
"""

import unittest
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


class TestKestrelBusinessRules(unittest.TestCase):

    def test_ticket_size_ceiling_eligibility(self):
        self.assertTrue(evaluate_ticket_eligibility(1800000.0).is_eligible)
        self.assertTrue(evaluate_ticket_eligibility(2499999.0).is_eligible)
        self.assertFalse(evaluate_ticket_eligibility(2500000.0).is_eligible)
        self.assertFalse(evaluate_ticket_eligibility(4500000.0).is_eligible)
        self.assertIn("exceeds ₹25 Lakh ceiling", evaluate_ticket_eligibility(2500000.0).message)

    def test_gap_check_period_continuity(self):
        req_pass = DocumentGapCheckRequest(
            application_id="APP-1001",
            gst_turnover=16200000.0,
            annualized_bank_credits=16900000.0,
            statement_months_present=["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
            statement_months_required=6,
            file_hashes=["hash1", "hash2"]
        )
        results = evaluate_gap_diagnostics(req_pass)
        self.assertTrue(any(r.rule_id == "GAP-101" and r.passed for r in results))
        self.assertTrue(any(r.rule_id == "GAP-301" and r.passed for r in results))

        req_break = DocumentGapCheckRequest(
            application_id="APP-1002",
            gst_turnover=16200000.0,
            annualized_bank_credits=16900000.0,
            statement_months_present=["May", "Jun", "Jul"],
            statement_months_required=6,
            file_hashes=["hash1", "hash2"]
        )
        break_results = evaluate_gap_diagnostics(req_break)
        self.assertTrue(any(r.rule_id == "GAP-101" and not r.passed and r.severity == "error" for r in break_results))

    def test_gst_banking_turnover_variance_flag(self):
        req_flag = DocumentGapCheckRequest(
            application_id="APP-1003",
            gst_turnover=16200000.0,
            annualized_bank_credits=10000000.0,
            statement_months_present=["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
            statement_months_required=6
        )
        flag_results = evaluate_gap_diagnostics(req_flag)
        turnover_issue = next(r for r in flag_results if r.rule_id == "GAP-301")
        self.assertFalse(turnover_issue.passed)
        self.assertEqual(turnover_issue.severity, "warning")

    def test_analyst_spreading_lock_gate(self):
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

        allowed, msg = validate_analyst_spreading_gate([fig_unchecked, fig_confirmed])
        self.assertFalse(allowed)
        self.assertIn("Gate locked", msg)

        fig_unchecked.status = "Confirmed"
        allowed_unlocked, _ = validate_analyst_spreading_gate([fig_unchecked, fig_confirmed])
        self.assertTrue(allowed_unlocked)

    def test_credit_officer_signoff_rationale_gate(self):
        allowed, msg = validate_credit_signoff_gate("Relationship Manager", "Underwriting note.")
        self.assertFalse(allowed)
        self.assertIn("Role restriction", msg)

        allowed, msg = validate_credit_signoff_gate("Credit Officer", "Short")
        self.assertFalse(allowed)
        self.assertIn("at least 10 characters", msg)

        allowed, _ = validate_credit_signoff_gate("Credit Officer", "Facility approved: DSCR 1.82x exceeds benchmark.")
        self.assertTrue(allowed)


if __name__ == '__main__':
    unittest.main()
