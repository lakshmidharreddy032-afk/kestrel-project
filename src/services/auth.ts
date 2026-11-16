import type { AuthUser, UserRole } from '../domain/types';

export const DEMO_USERS: Record<string, AuthUser> = {
  'rm': {
    id: 'usr-rm-101',
    name: 'Vikram Rao',
    email: 'vikram.rao@kestrelfinance.in',
    role: 'Relationship Manager',
    title: 'Senior Relationship Manager (Fictional)',
    department: 'SME Lending & Business Sourcing',
    employeeId: 'KF-RM-4021',
    avatarClass: 'avatar-rm',
    initials: 'VR',
    lastLogin: 'Today, 09:15 AM IST',
    sessionToken: 'sess-jwt-kf-rm-4021-india-south',
    canSendRequests: true,
    canConfirmFigures: false,
    canOverrideFigures: false,
    canSyncSpreading: false,
    canSignOffCredit: false,
    canViewObservability: false,
    canExportAudit: false,
    allowedActions: [
      'Document Intake & S1 Checklist review for borrower files',
      'Upload borrower Bank Statements, GSTR-3B, KYC & PAN',
      'Dispatch single-chase consolidated deficiency requests to applicants',
      'Monitor file turnaround times against 18-day SLA'
    ],
    restrictedActions: [
      'Cannot verify, modify or override OCR extracted financial metrics',
      'Cannot synchronize figures to the financial spreading model',
      'Cannot approve, sanction, or reject loan facilities',
      'Cannot view internal LLM token costs or model telemetry'
    ]
  },
  'analyst': {
    id: 'usr-ca-202',
    name: 'Meena Pillai',
    email: 'meena.pillai@kestrelfinance.in',
    role: 'Analyst',
    title: 'Lead Credit Analyst (Fictional)',
    department: 'Credit Underwriting & Risk Assessment',
    employeeId: 'KF-CA-8840',
    avatarClass: 'avatar-analyst',
    initials: 'MP',
    lastLogin: 'Today, 09:30 AM IST',
    sessionToken: 'sess-jwt-kf-ca-8840-india-south',
    canSendRequests: false,
    canConfirmFigures: true,
    canOverrideFigures: true,
    canSyncSpreading: true,
    canSignOffCredit: false,
    canViewObservability: false,
    canExportAudit: true,
    allowedActions: [
      'Execute S3 Diagnostic Checks (Period gaps & duplicate hashes)',
      'Side-by-side OCR review against original document bounding boxes (S4)',
      'Verify candidate figures or override smudged scans with documented rationale (≥ 5 chars)',
      'Unlock and commit 100% verified metrics to spreading sheet model',
      'View 5-C SME Risk Scorecard (Capacity, Capital, Collateral, Character, Condition)'
    ],
    restrictedActions: [
      'Cannot make final loan sanction decisions (reserved for Credit Officer Arjun Iyer)',
      'Cannot dispatch external deficiency notices to borrowers',
      'Cannot bypass mandatory 100% verification gate before spreading'
    ]
  },
  'officer': {
    id: 'usr-cro-303',
    name: 'Arjun Iyer',
    email: 'arjun.iyer@kestrelfinance.in',
    role: 'Credit Officer',
    title: 'Chief Risk Officer / Delegated Approver (Fictional)',
    department: 'Credit Governance & Sanctions Committee',
    employeeId: 'KF-CRO-9912',
    avatarClass: 'avatar-officer',
    initials: 'AI',
    lastLogin: 'Today, 10:00 AM IST',
    sessionToken: 'sess-jwt-kf-cro-9912-india-south',
    canSendRequests: false,
    canConfirmFigures: false,
    canOverrideFigures: false,
    canSyncSpreading: false,
    canSignOffCredit: true,
    canViewObservability: false,
    canExportAudit: true,
    allowedActions: [
      'Review Executive Credit Appraisal Memo (CAM) and financial ratios',
      'Exercise delegated lending authority for simple loans under ₹25 Lakh',
      'Execute formal credit decisions: Sanction Facility, Refer to Committee, or Reject',
      'Mandatory written credit rationale (≥ 10 characters) logged to audit trail',
      'Generate and issue formal legally-binding Sanction Letters'
    ],
    restrictedActions: [
      'Cannot approve loans ≥ ₹25 Lakh (hard-blocked by Policy Guardrail #1)',
      'Cannot approve loans with unverified figures (< 100% Analyst verification)',
      'System never auto-approves: requires human officer credentials and signed rationale'
    ]
  },
  'owner': {
    id: 'usr-ops-404',
    name: 'Devina Sen',
    email: 'devina.sen@kestrelfinance.in',
    role: 'Owner',
    title: 'Platform & AI Operations Owner (Fictional)',
    department: 'AI Platform Engineering & Cloud Governance',
    employeeId: 'KF-OPS-0010',
    avatarClass: 'avatar-owner',
    initials: 'DS',
    lastLogin: 'Today, 08:45 AM IST',
    sessionToken: 'sess-jwt-kf-ops-0010-india-south',
    canSendRequests: true,
    canConfirmFigures: true,
    canOverrideFigures: true,
    canSyncSpreading: true,
    canSignOffCredit: false,
    canViewObservability: true,
    canExportAudit: true,
    allowedActions: [
      'Full LLM Observability across Gemini 1.5 Flash, 1.5 Pro, and 2.0 Flash',
      'Real-time token telemetry (prompt, completion, and schema context caching)',
      'Live per-call cost accounting in both INR (₹) and USD ($)',
      'Verify GCP asia-south1 sovereign tenancy & Zero Data Retention compliance',
      'Execute live test model calls with real-time latency waterfall benchmarks',
      'Export SOC-2 and RBI compliance audit telemetry logs (JSON / CSV)',
      'Comprehensive administrative oversight across all files and spreading sheets'
    ],
    restrictedActions: [
      'Cannot approve credit sanction decisions (strictly reserved for Credit Officer Arjun Iyer to preserve regulatory human credit sign-off boundary)'
    ]
  },
  'auditor': {
    id: 'usr-aud-505',
    name: 'Pooja Deshmukh',
    email: 'compliance.audit@kestrelfinance.in',
    role: 'Auditor',
    title: 'Lead RBI Regulatory Auditor (Fictional)',
    department: 'Regulatory Compliance & Internal Audit',
    employeeId: 'KF-AUD-5055',
    avatarClass: 'avatar-auditor',
    initials: 'PD',
    lastLogin: 'Today, 10:15 AM IST',
    sessionToken: 'sess-jwt-kf-aud-5055-india-south',
    canSendRequests: false,
    canConfirmFigures: false,
    canOverrideFigures: false,
    canSyncSpreading: false,
    canSignOffCredit: false,
    canViewObservability: false,
    canExportAudit: true,
    allowedActions: [
      'Read-only inspection of the full immutable audit trail',
      'Verify cryptographic timestamp provenance and tamper-evident logs',
      'Monitor portfolio Gross NPA (< 3.5% ceiling) and Turnaround Time benchmarks',
      'Export compliance audit events and decision memos for RBI review'
    ],
    restrictedActions: [
      'Read-only role: Cannot modify borrower figures or checklist documents',
      'Cannot dispatch deficiency notices or alter spreading sheet models',
      'Cannot execute loan approval or rejection decisions'
    ]
  }
};

export class AuthService {
  private static AUTH_KEY = 'kestrel_auth_session_v1';

  static getInitialSession(): { isAuthenticated: boolean; currentUser: AuthUser | null } {
    try {
      const stored = localStorage.getItem(this.AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated && parsed.currentUser) {
          return parsed;
        }
      }
    } catch {}

    // Default to Relationship Manager authenticated for seamless testing
    return {
      isAuthenticated: true,
      currentUser: DEMO_USERS['rm']
    };
  }

  static login(email: string, _password?: string): { success: boolean; user?: AuthUser; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const foundKey = Object.keys(DEMO_USERS).find(k => DEMO_USERS[k].email.toLowerCase() === cleanEmail);

    if (!foundKey) {
      // Allow fallback login matching first name
      const nameKey = Object.keys(DEMO_USERS).find(k => DEMO_USERS[k].name.toLowerCase().includes(cleanEmail));
      if (nameKey) {
        const user = { ...DEMO_USERS[nameKey], lastLogin: 'Just now' };
        this.saveSession(user);
        return { success: true, user };
      }
      return { success: false, error: 'Invalid credentials. Please select one of the authorized demo personas below.' };
    }

    const user = { ...DEMO_USERS[foundKey], lastLogin: 'Just now' };
    this.saveSession(user);
    return { success: true, user };
  }

  static loginAsRole(roleKey: 'rm' | 'analyst' | 'officer' | 'owner' | 'auditor'): AuthUser {
    const user = { ...DEMO_USERS[roleKey], lastLogin: 'Just now' };
    this.saveSession(user);
    return user;
  }

  static getUserByRole(role: UserRole): AuthUser {
    const key = Object.keys(DEMO_USERS).find(k => DEMO_USERS[k].role === role) || 'rm';
    return DEMO_USERS[key];
  }

  static saveSession(user: AuthUser | null) {
    try {
      if (user) {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify({ isAuthenticated: true, currentUser: user }));
      } else {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify({ isAuthenticated: false, currentUser: null }));
      }
    } catch {}
  }

  static logout() {
    this.saveSession(null);
  }
}
