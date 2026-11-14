"""
Kestrel Finance — Deterministic Credit Business Rules Engine
Enforces strict NBFC governance guardrails in Python.
"""

from typing import List, Tuple
from backend.schemas import (
    EligibilityResult,
    DiagnosticIssue,
    DocumentGapCheckRequest,
    ExtractedFigure
)

MAX_TICKET_CEILING = 2500000.0  # ₹25,00,000 ceiling limit


def evaluate_ticket_eligibility(amount: float) -> EligibilityResult:
    """
    Guardrail 1: Loans >= ₹25 Lakh are strictly out of scope.
    """
    if amount >= MAX_TICKET_CEILING:
        return EligibilityResult(
            is_eligible=False,
            ticket_ceiling_limit=MAX_TICKET_CEILING,
            status_code="OUT_OF_SCOPE",
            message=f"Out of scope: Ticket size (₹{amount:,.0f}) exceeds ₹25 Lakh ceiling."
        )
    return EligibilityResult(
        is_eligible=True,
        ticket_ceiling_limit=MAX_TICKET_CEILING,
        status_code="ELIGIBLE",
        message="Within policy scope (< ₹25 Lakh fast-track SME loan)."
    )


def evaluate_gap_diagnostics(req: DocumentGapCheckRequest) -> List[DiagnosticIssue]:
    """
    Milestone S3: Deterministic multi-document gap detection.
    """
    issues: List[DiagnosticIssue] = []

    # 1. Period Continuity Check
    missing_count = req.statement_months_required - len(req.statement_months_present)
    if missing_count > 0:
        issues.append(DiagnosticIssue(
            rule_id="GAP-101",
            rule_name="Bank Statement Coverage Break",
            severity="error",
            passed=False,
            reason=f"Found {len(req.statement_months_present)} months. Policy mandates {req.statement_months_required} consecutive months.",
            prescribed_action="Dispatch deficiency notice to borrower for missing months."
        ))
    else:
        issues.append(DiagnosticIssue(
            rule_id="GAP-101",
            rule_name="Bank Statement Coverage Continuity",
            severity="info",
            passed=True,
            reason="All 6 consecutive statement months accounted for.",
            prescribed_action="No action required."
        ))

    # 2. Duplicate File Hash Collision Check
    if len(req.file_hashes) != len(set(req.file_hashes)):
        issues.append(DiagnosticIssue(
            rule_id="GAP-201",
            rule_name="Duplicate Page / Hash Collision",
            severity="error",
            passed=False,
            reason="Identical SHA-256 transaction page hash uploaded multiple times.",
            prescribed_action="Remove duplicate page from appraisal file."
        ))
    else:
        issues.append(DiagnosticIssue(
            rule_id="GAP-201",
            rule_name="Duplicate Page & Hash Check",
            severity="info",
            passed=True,
            reason="Zero duplicate hash collisions detected across documents.",
            prescribed_action="No action required."
        ))

    # 3. GST vs Banking Turnover Reconciliation (15% variance threshold)
    if req.gst_turnover > 0:
        variance_pct = abs(req.annualized_bank_credits - req.gst_turnover) / req.gst_turnover * 100
        if variance_pct > 15.0:
            issues.append(DiagnosticIssue(
                rule_id="GAP-301",
                rule_name="GST vs Banking Turnover Divergence",
                severity="warning",
                passed=False,
                reason=f"Turnover variance is {variance_pct:.1f}% (Bank: ₹{req.annualized_bank_credits:,.0f} vs GST: ₹{req.gst_turnover:,.0f}). Exceeds 15% threshold.",
                prescribed_action="Request CA certified turnover reconciliation certificate."
            ))
        else:
            issues.append(DiagnosticIssue(
                rule_id="GAP-301",
                rule_name="GST vs Banking Turnover Reconciliation",
                severity="info",
                passed=True,
                reason=f"Turnover variance of {variance_pct:.2f}% is within acceptable policy threshold (<= 15%).",
                prescribed_action="No action required."
            ))

    return issues


def validate_analyst_spreading_gate(figures: List[ExtractedFigure]) -> Tuple[bool, str]:
    """
    Guardrail 3: Spreading sync is hard-blocked until 100% of figures are checked by an analyst.
    """
    unchecked = [f for f in figures if f.status == "Unchecked"]
    if unchecked:
        return False, f"Gate locked: {len(unchecked)} of {len(figures)} figures remain unverified."
    return True, "Gate unlocked: 100% of figures verified by Credit Analyst."


def validate_credit_signoff_gate(role: str, rationale: str) -> Tuple[bool, str]:
    """
    Guardrail 4: Only human Credit Officer can sign off with rationale >= 10 chars.
    """
    if role != "Credit Officer":
        return False, f"Role restriction: Logged in as '{role}'. Delegated lending authority requires 'Credit Officer'."
    if not rationale or len(rationale.strip()) < 10:
        return False, "Underwriting rationale is mandatory and must contain at least 10 characters."
    return True, "Credit sign-off criteria validated."
