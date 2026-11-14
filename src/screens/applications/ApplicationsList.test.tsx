import { describe, it, expect } from 'vitest';
import { checkLoanEligibility } from '../../domain/rules/eligibility';

describe('Applications Eligibility Scope (< ₹25L)', () => {
  it('approves loans strictly under ₹25 lakh', () => {
    expect(checkLoanEligibility(1800000).isEligible).toBe(true);
    expect(checkLoanEligibility(2400000).isEligible).toBe(true);
    expect(checkLoanEligibility(500000).isEligible).toBe(true);
  });

  it('strictly blocks loans of ₹25 lakh and above', () => {
    expect(checkLoanEligibility(2500000).isEligible).toBe(false);
    expect(checkLoanEligibility(4500000).isEligible).toBe(false);
    expect(checkLoanEligibility(7500000).isEligible).toBe(false);
  });
});
