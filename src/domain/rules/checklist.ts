import type { DocumentItem, RuleIssue } from '../types.ts';

/**
 * S1: Day-One Document Checklist rules & Single Consolidated Request Message Generator.
 */
export function checkRequiredDocuments(docs: DocumentItem[]): { isComplete: boolean; missingList: string[] } {
  const missingList: string[] = [];

  const bankDocs = docs.filter(d => d.type === 'bank_statement' && d.status === 'Received');
  if (bankDocs.length === 0) missingList.push('Bank Statements (6 consecutive months)');

  const gstDocs = docs.filter(d => d.type === 'gst_return' && d.status === 'Received');
  if (gstDocs.length === 0) missingList.push('GST Returns (12 consecutive months / GSTR-3B)');

  const kycDocs = docs.filter(d => d.type === 'kyc' && d.status === 'Received');
  if (kycDocs.length === 0) missingList.push('KYC Identity Proof (Partner/Director PAN and Aadhaar)');

  const bizDocs = docs.filter(d => d.type === 'business_proof' && d.status === 'Received');
  if (bizDocs.length === 0) missingList.push('Business Proof (Udyam MSME Certificate or Incorporation Certificate)');

  return {
    isComplete: missingList.length === 0,
    missingList
  };
}

export function generateConsolidatedRequest(applicantName: string, issues: RuleIssue[]): string {
  let text = `Dear ${applicantName},\n\n`;
  text += `Thank you for applying for an SME loan facility with Kestrel Finance.\n`;
  text += `To ensure your application is reviewed quickly without repeated back-and-forth delays, please provide the following missing or clarified documents in ONE single submission:\n\n`;

  if (issues.length === 0) {
    text += `• All standard primary documents are currently on file and in order.\n`;
  } else {
    issues.forEach((iss, idx) => {
      text += `${idx + 1}. [${iss.ruleName}]: ${iss.reason}\n`;
      text += `   Action needed: ${iss.fixAction}\n\n`;
    });
  }

  text += `Please upload all requested items through your secure applicant link.\n\n`;
  text += `Warm regards,\nKestrel SME Credit Operations (India)`;
  return text;
}
