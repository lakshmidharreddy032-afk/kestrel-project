import { describe, it, expect } from 'vitest';
import { checkLoanEligibility } from './eligibility';
import { checkRequiredDocuments, generateConsolidatedRequest } from './checklist';
import { runGapChecks } from './gapCheck';
import { canSyncToSpreading, validateSignOff } from './signOff';
import type { DocumentItem, ExtractedFigure } from '../types';

describe('1. Loan Eligibility Scope (< ₹25L)', () => {
  it('allows simple loans under ₹25 lakh', () => {
    expect(checkLoanEligibility(1800000).isEligible).toBe(true);
    expect(checkLoanEligibility(2400000).isEligible).toBe(true);
  });

  it('blocks loans of ₹25 lakh and above', () => {
    expect(checkLoanEligibility(2500000).isEligible).toBe(false);
    expect(checkLoanEligibility(5000000).isEligible).toBe(false);
  });
});

describe('2. S1 Checklist & Consolidated Request', () => {
  it('detects missing documents', () => {
    const docs: DocumentItem[] = [{ id: '1', type: 'kyc', title: 'KYC', fileName: 'pan.pdf', status: 'Received' }];
    const res = checkRequiredDocuments(docs);
    expect(res.isComplete).toBe(false);
    expect(res.missingList.length).toBeGreaterThan(0);
  });

  it('generates consolidated request text without model call', () => {
    const msg = generateConsolidatedRequest('Malabar Spices', []);
    expect(msg).toContain('Malabar Spices');
    expect(msg).toContain('Kestrel SME Credit Operations');
  });
});

describe('3. S3 Gap Checks (Missing, Duplicates, Periods)', () => {
  it('flags missing bank statement and GST return', () => {
    const issues = runGapChecks([]);
    expect(issues.some(i => i.ruleId === 'RULE-MISSING-BANK')).toBe(true);
    expect(issues.some(i => i.ruleId === 'RULE-MISSING-GST')).toBe(true);
  });

  it('flags duplicate file hash', () => {
    const docs: DocumentItem[] = [
      { id: '1', type: 'bank_statement', title: 'B1', fileName: 'b1.pdf', fileHash: 'hash-abc', status: 'Received' },
      { id: '2', type: 'bank_statement', title: 'B2', fileName: 'b2.pdf', fileHash: 'hash-abc', status: 'Received' }
    ];
    const issues = runGapChecks(docs);
    expect(issues.some(i => i.ruleId === 'RULE-DUP-HASH')).toBe(true);
  });

  it('flags statement period coverage shortfall (<6m)', () => {
    const docs: DocumentItem[] = [
      { id: '1', type: 'bank_statement', title: 'B1', fileName: 'b1.pdf', monthsCovered: 4, status: 'Received' }
    ];
    const issues = runGapChecks(docs);
    expect(issues.some(i => i.ruleId === 'RULE-PERIOD-BANK-SHORT')).toBe(true);
  });
});

describe('4. S4 Analyst Verification Gate', () => {
  it('blocks spreading sync when unchecked figures remain', () => {
    const figures: ExtractedFigure[] = [
      { id: '1', docId: 'd1', sourceDoc: 'B1', sourcePage: 1, label: 'AMB', fieldKey: 'amb', extractedValue: 50000, confirmedValue: null, unit: 'INR', confidence: 0.95, status: 'Unchecked', boundingBox: { x: 0, y: 0, width: 10, height: 10 } }
    ];
    expect(canSyncToSpreading(figures).allowed).toBe(false);
  });

  it('allows spreading sync when 100% of figures are checked', () => {
    const figures: ExtractedFigure[] = [
      { id: '1', docId: 'd1', sourceDoc: 'B1', sourcePage: 1, label: 'AMB', fieldKey: 'amb', extractedValue: 50000, confirmedValue: 50000, unit: 'INR', confidence: 0.95, status: 'Confirmed', boundingBox: { x: 0, y: 0, width: 10, height: 10 } }
    ];
    expect(canSyncToSpreading(figures).allowed).toBe(true);
  });
});

describe('5. Credit Officer Sign-off Gate', () => {
  it('blocks sign-off for RM and Analyst personas', () => {
    expect(validateSignOff('Relationship Manager', 'Rationale note here').allowed).toBe(false);
    expect(validateSignOff('Analyst', 'Rationale note here').allowed).toBe(false);
  });

  it('requires mandatory rationale of at least 10 characters', () => {
    expect(validateSignOff('Credit Officer', 'Short').allowed).toBe(false);
    expect(validateSignOff('Credit Officer', 'Comprehensive underwriting rationale verified.').allowed).toBe(true);
  });
});
