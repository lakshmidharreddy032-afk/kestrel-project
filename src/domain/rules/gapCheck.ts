import type { DocumentItem, RuleIssue } from '../types.ts';
import { REQUIRED_BANK_MONTHS, REQUIRED_GST_MONTHS } from '../constants.ts';

/**
 * S3: Deterministic check for missing documents, duplicate content hashes, duplicate statement periods,
 * and duration coverage gaps.
 */
export function runGapChecks(documents: DocumentItem[]): RuleIssue[] {
  const issues: RuleIssue[] = [];

  // 1. Missing bank statements
  const validBankDocs = documents.filter(d => d.type === 'bank_statement' && d.status !== 'Duplicate');
  if (validBankDocs.length === 0) {
    issues.push({
      ruleId: "RULE-MISSING-BANK",
      ruleName: "Bank Statement Missing",
      category: "missing",
      passed: false,
      severity: "error",
      reason: "No current account bank statements on file. 6 consecutive months required.",
      fixAction: "Request 6-month current account statement from applicant."
    });
  }

  // 2. Missing GST returns
  const validGstDocs = documents.filter(d => d.type === 'gst_return' && d.status !== 'Duplicate');
  if (validGstDocs.length === 0) {
    issues.push({
      ruleId: "RULE-MISSING-GST",
      ruleName: "GST Returns Missing",
      category: "missing",
      passed: false,
      severity: "error",
      reason: "No GST returns uploaded. Complete 12-month GSTR-3B filing history required.",
      fixAction: "Request 12 months GSTR-3B filings."
    });
  }

  // 3. Missing KYC
  const kycDocs = documents.filter(d => d.type === 'kyc');
  if (kycDocs.length === 0 || kycDocs.every(d => d.status === 'Missing')) {
    issues.push({
      ruleId: "RULE-MISSING-KYC",
      ruleName: "KYC Documents Missing",
      category: "missing",
      passed: false,
      severity: "error",
      reason: "Missing KYC identification for primary promoters/partners.",
      fixAction: "Request certified PAN and Aadhaar copies."
    });
  }

  // 4. Missing Business Proof
  const bizDocs = documents.filter(d => d.type === 'business_proof');
  if (bizDocs.length === 0 || bizDocs.every(d => d.status === 'Missing')) {
    issues.push({
      ruleId: "RULE-MISSING-BIZ",
      ruleName: "Business Proof Missing",
      category: "missing",
      passed: false,
      severity: "error",
      reason: "Missing enterprise registration certificate (Udyam / COI).",
      fixAction: "Request MSME Udyam certificate."
    });
  }

  // 5. Duplicate Content Hashes & Statement Periods
  const seenHashes = new Map<string, DocumentItem>();
  const seenPeriods = new Map<string, DocumentItem>();

  for (const doc of documents) {
    if (doc.status === 'Missing') continue;

    if (doc.fileHash) {
      if (seenHashes.has(doc.fileHash)) {
        const prior = seenHashes.get(doc.fileHash)!;
        issues.push({
          ruleId: "RULE-DUP-HASH",
          ruleName: "Duplicate File Hash",
          category: "duplicate",
          passed: false,
          severity: "error",
          reason: `Duplicate file detected: "${doc.fileName}" has identical content hash (${doc.fileHash.slice(0, 8)}...) to "${prior.fileName}".`,
          fixAction: "Remove redundant upload."
        });
      } else {
        seenHashes.set(doc.fileHash, doc);
      }
    }

    if (doc.periodStart && doc.periodEnd) {
      const periodKey = `${doc.type}_${doc.periodStart}_${doc.periodEnd}`;
      if (seenPeriods.has(periodKey)) {
        const prior = seenPeriods.get(periodKey)!;
        issues.push({
          ruleId: "RULE-DUP-PERIOD",
          ruleName: "Duplicate Statement Period",
          category: "duplicate",
          passed: false,
          severity: "warning",
          reason: `Overlapping period: Period ${doc.periodStart} to ${doc.periodEnd} was already provided in "${prior.fileName}".`,
          fixAction: "Verify whether upload is redundant copy or separate branch account."
        });
      } else {
        seenPeriods.set(periodKey, doc);
      }
    }
  }

  // 6. Period Coverage Shortfalls
  const bankMonths = validBankDocs.reduce((acc, d) => acc + (d.monthsCovered || 0), 0);
  if (validBankDocs.length > 0 && bankMonths < REQUIRED_BANK_MONTHS) {
    issues.push({
      ruleId: "RULE-PERIOD-BANK-SHORT",
      ruleName: "Bank Statement Coverage Shortfall",
      category: "period",
      passed: false,
      severity: "error",
      reason: `Uploaded bank statement only covers ${bankMonths} month(s). Minimum ${REQUIRED_BANK_MONTHS} consecutive months required.`,
      fixAction: `Request supplemental statement for remaining ${REQUIRED_BANK_MONTHS - bankMonths} month(s).`
    });
  }

  const gstMonths = validGstDocs.reduce((acc, d) => acc + (d.monthsCovered || 0), 0);
  if (validGstDocs.length > 0 && gstMonths < REQUIRED_GST_MONTHS) {
    issues.push({
      ruleId: "RULE-PERIOD-GST-SHORT",
      ruleName: "GST Return Coverage Shortfall",
      category: "period",
      passed: false,
      severity: "error",
      reason: `Uploaded GST returns only cover ${gstMonths} month(s). Full ${REQUIRED_GST_MONTHS}-month annual history required.`,
      fixAction: `Request missing ${REQUIRED_GST_MONTHS - gstMonths} month(s) of GSTR-3B filings.`
    });
  }

  return issues;
}
