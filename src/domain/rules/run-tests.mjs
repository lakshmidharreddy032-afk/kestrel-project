import assert from 'node:assert';
import { checkLoanEligibility } from './eligibility.ts';
import { checkRequiredDocuments, generateConsolidatedRequest } from './checklist.ts';
import { runGapChecks } from './gapCheck.ts';
import { canSyncToSpreading, validateSignOff } from './signOff.ts';

console.log('========================================================');
console.log('  KESTREL FINANCE — DOMAIN RULES TEST BATTERY (VITEST/NODE)');
console.log('========================================================');

// 1. Eligibility
console.log('Testing Loan Eligibility Scope (< ₹25L)...');
assert.strictEqual(checkLoanEligibility(1800000).isEligible, true);
assert.strictEqual(checkLoanEligibility(2500000).isEligible, false);
assert.strictEqual(checkLoanEligibility(5000000).isEligible, false);
console.log('✔ Loan Eligibility tests passed.');

// 2. S1 Checklist
console.log('Testing S1 Checklist & Consolidated Request...');
const check = checkRequiredDocuments([{ id: '1', type: 'kyc', title: 'KYC', fileName: 'pan.pdf', status: 'Received' }]);
assert.strictEqual(check.isComplete, false);
assert(check.missingList.length > 0);
const req = generateConsolidatedRequest('Malabar Spices', []);
assert(req.includes('Malabar Spices'));
console.log('✔ S1 Checklist tests passed.');

// 3. S3 Gap Checks
console.log('Testing S3 Missing & Duplicate Gap Checks...');
const issues = runGapChecks([]);
assert(issues.some(i => i.ruleId === 'RULE-MISSING-BANK'));
assert(issues.some(i => i.ruleId === 'RULE-MISSING-GST'));

const dupIssues = runGapChecks([
  { id: '1', type: 'bank_statement', title: 'B1', fileName: 'b1.pdf', fileHash: 'hash-abc', status: 'Received' },
  { id: '2', type: 'bank_statement', title: 'B2', fileName: 'b2.pdf', fileHash: 'hash-abc', status: 'Received' }
]);
assert(dupIssues.some(i => i.ruleId === 'RULE-DUP-HASH'));

const shortIssues = runGapChecks([
  { id: '1', type: 'bank_statement', title: 'B1', fileName: 'b1.pdf', monthsCovered: 4, status: 'Received' }
]);
assert(shortIssues.some(i => i.ruleId === 'RULE-PERIOD-BANK-SHORT'));
console.log('✔ S3 Gap Checks passed.');

// 4. S4 Analyst Gate
console.log('Testing S4 Analyst Verification Gate...');
assert.strictEqual(canSyncToSpreading([{ id: '1', status: 'Unchecked' }]).allowed, false);
assert.strictEqual(canSyncToSpreading([{ id: '1', status: 'Confirmed' }]).allowed, true);
console.log('✔ S4 Analyst Gate passed.');

// 5. Credit Officer Sign-off Gate
console.log('Testing Credit Officer Sign-off Gate...');
assert.strictEqual(validateSignOff('Relationship Manager', 'Rationale').allowed, false);
assert.strictEqual(validateSignOff('Analyst', 'Rationale').allowed, false);
assert.strictEqual(validateSignOff('Credit Officer', 'Short').allowed, false);
assert.strictEqual(validateSignOff('Credit Officer', 'Comprehensive underwriting rationale verified.').allowed, true);
console.log('✔ Credit Officer Sign-off Gate passed.');

console.log('========================================================');
console.log('  ALL 5 DOMAIN RULE SUITES PASSED (100% ASSERTIONS)     ');
console.log('========================================================');
