import { MAX_LOAN_AMOUNT_INR } from '../constants.ts';

export interface EligibilityResult {
  isEligible: boolean;
  reason?: string;
  category: 'simple_sme' | 'out_of_scope_corporate';
}

/**
 * Hard Rule: Only simple SME applications under ₹25 lakh are eligible for this first slice.
 * Applications $\ge$ ₹25 lakh must be marked "Out of scope" and blocked from automated fast-path.
 */
export function checkLoanEligibility(amount: number): EligibilityResult {
  if (amount >= MAX_LOAN_AMOUNT_INR) {
    return {
      isEligible: false,
      category: 'out_of_scope_corporate',
      reason: `Loan facility ₹${amount.toLocaleString('en-IN')} exceeds ₹25 lakh ceiling. Re-route to Corporate Underwriting Committee.`
    };
  }

  return {
    isEligible: true,
    category: 'simple_sme'
  };
}
