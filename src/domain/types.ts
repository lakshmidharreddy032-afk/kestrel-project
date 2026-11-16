export type UserRole = 'Relationship Manager' | 'Analyst' | 'Credit Officer' | 'Owner';

export interface LLMCallTrace {
  id: string;
  timestamp: string;
  appId: string;
  applicant: string;
  document: string;
  stage: string;
  model: string;
  endpoint: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  totalTokens: number;
  costUSD: number;
  costINR: number;
  latencyMs: number;
  statusCode: number;
  status: string;
  confidence: number;
  tenancy: string;
  extractedFields: number;
  systemPrompt: string;
  rawResponse: string;
}

export interface LLMModelCatalogItem {
  modelId: string;
  name: string;
  version: string;
  provider: string;
  region: string;
  primaryUse: string;
  pricing: {
    inputPer1MTokensUSD: number;
    cachedInputPer1MTokensUSD: number;
    outputPer1MTokensUSD: number;
  };
  stats: {
    callsCount: number;
    totalTokens: number;
    totalCostUSD: number;
    avgLatencyMs: number;
    successRate: number;
  };
}

export interface SMEApplication {
  id: string;
  applicant: string;
  sector: string;
  amount: number;
  ageDays: number;
  assignedRM: string;
  status: 'Received' | 'Documents Needed' | 'Checks In Progress' | 'Checks Flagged' | 'Figures Verified' | 'Spreading Complete' | 'Approved' | 'Rejected' | 'Referred' | 'Out of Scope';
  isOutOfScope: boolean;
  outOfScopeReason?: string;
  requestSentCount: number;
  lastConsolidatedRequest?: string;
  figuresCheckedCount?: number;
  creditDecision?: CreditDecision;
}

export interface DocumentItem {
  id: string;
  type: 'bank_statement' | 'gst_return' | 'kyc' | 'business_proof';
  title: string;
  fileName: string;
  fileHash?: string;
  status: 'Received' | 'Missing' | 'Duplicate';
  periodStart?: string;
  periodEnd?: string;
  monthsCovered?: number;
  note?: string;
  receivedDate?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedFigure {
  id: string;
  docId?: string;
  sourceDoc?: string;
  documentRef?: string;
  documentType?: string;
  periodLabel?: string;
  sourcePage: number;
  label: string;
  fieldKey: string;
  extractedValue: number;
  confirmedValue: number | null;
  unit: 'INR' | 'count' | 'ratio' | string;
  confidence?: number;
  confidenceScore?: number;
  status: 'Unchecked' | 'Confirmed' | 'Overridden' | string;
  checkedBy?: string;
  checkedAt?: string;
  overrideReason?: string;
  boundingBox: BoundingBox;
}

export interface CreditDecision {
  applicationId: string;
  decision: 'Approved' | 'Rejected' | 'Referred to Committee';
  decisionNotes: string;
  signedBy: string;
  signedRole: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: 'MOCK_EXTRACTION_LOADED' | 'FIGURE_CONFIRMED' | 'FIGURE_OVERRIDDEN' | 'SPREADING_SYNCED' | 'CREDIT_SIGNOFF' | 'CONSOLIDATED_REQUEST_GENERATED';
  applicationId: string;
  details: string;
  modelVersion: string;
}

export interface RuleIssue {
  ruleId: string;
  ruleName: string;
  category: 'eligibility' | 'missing' | 'duplicate' | 'period';
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  reason: string;
  fixAction: string;
}

export interface MetricKPIs {
  minutesPerFile: { current: number; baseline: number; target: number; unit: string };
  documentRoundsPerFile: { current: number; baseline: number; target: number; unit: string };
  medianWorkingDays: { current: number; baseline: number; target: number; unit: string };
  figureAccuracyPostCheck: { current: number; baseline: number; target: number; unit: string };
  grossNPA: { current: number; boardLimit: number; headroom: number; unit: string; status: string };
}
