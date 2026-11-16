import type { ModelPromptConfig } from './types';

export const DEFAULT_PROMPTS: ModelPromptConfig[] = [
  {
    id: 'ocr_extraction',
    name: 'Primary Multimodal Document OCR & Bounding Boxes',
    targetModel: 'gemini-1.5-flash',
    version: 'v2.4-prod',
    prompt: 'You are a deterministic financial document OCR extractor for Indian SME loan underwriting at Kestrel Finance. Extract key financial totals (Total Bank Credits, Total Debits, Average Monthly Balance, GST Turnover) with normalized 0-100 bounding boxes [ymin, xmin, ymax, xmax]. Output strictly adhering to the JSON schema. Do not make credit decisions, do not score risk, and do not decide loan approvals.',
    temperature: 0.0,
    lastUpdatedBy: 'Devina Sen (Platform Owner)',
    lastUpdatedAt: '14 Nov 2026, 02:00 PM IST',
    description: 'Powers the core S4 Split-View OCR extraction engine for bank statements and GSTR-3B filings.'
  },
  {
    id: 'gst_reconciliation',
    name: 'Deep Multi-Period GST vs Bank Cross-Reconciliation',
    targetModel: 'gemini-1.5-pro',
    version: 'v1.8-prod',
    prompt: 'You are a credit underwriting reconciliation assistant. Compare 12-month GSTR-3B filings against 6-month bank credits for Indian SME applicants. Detect missing sequential return periods, identify cash sales variances > 10%, and flag circular trading patterns. Do not extrapolate missing figures.',
    temperature: 0.1,
    lastUpdatedBy: 'Devina Sen (Platform Owner)',
    lastUpdatedAt: '12 Nov 2026, 11:30 AM IST',
    description: 'Powers S3 period continuity and discrepancy analysis between GSTR-3B turnover and banking credits.'
  },
  {
    id: 'intake_classification',
    name: 'Day-1 Document Intake Classification & Duplicate Check',
    targetModel: 'gemini-2.0-flash',
    version: 'v1.2-exp',
    prompt: 'You are a document intake classifier for SME loan files under ₹25 Lakh. Classify incoming PDF/image pages into Bank Statement, GST Return, KYC (PAN/Aadhaar), or Business Proof. Detect duplicate pages via visual layout matching and report completeness against the S1 checklist.',
    temperature: 0.0,
    lastUpdatedBy: 'Devina Sen (Platform Owner)',
    lastUpdatedAt: '10 Nov 2026, 09:15 AM IST',
    description: 'Powers S1 instant intake page classification, duplicate page hashing, and document triage.'
  }
];
