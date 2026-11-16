import type { SMEApplication, DocumentItem, ExtractedFigure, AuditLogEntry, UserRole, ModelPromptConfig } from '../domain/types';
import applicationsSeed from '../data/applications.json';
import documentsSeed from '../data/documents.json';
import extractionsSeed from '../data/extractions.json';
import auditLogSeed from '../data/auditLog.json';
import { DEFAULT_PROMPTS } from '../domain/prompts';
import { AuditLogger } from './auditLogger';

const STORAGE_KEY = 'kestrel_credit_workflow_v2';

export interface AppState {
  applications: SMEApplication[];
  documents: Record<string, DocumentItem[]>;
  extractions: Record<string, ExtractedFigure[]>;
  auditLog: AuditLogEntry[];
  activeCaseId: string;
  currentRole: UserRole;
  currentScreen: string;
  activeDocPage: 'bank' | 'gst';
  systemPrompts: ModelPromptConfig[];
}

class AppStore {
  private state: AppState;
  private listeners: Array<() => void> = [];
  public logger: AuditLogger;

  constructor() {
    this.state = this.loadInitialState();
    this.logger = new AuditLogger(this.state.auditLog);
  }

  private loadInitialState(): AppState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.systemPrompts) parsed.systemPrompts = JSON.parse(JSON.stringify(DEFAULT_PROMPTS));
        return parsed;
      }
    } catch {}

    return {
      applications: JSON.parse(JSON.stringify(applicationsSeed)) as SMEApplication[],
      documents: JSON.parse(JSON.stringify(documentsSeed)) as Record<string, DocumentItem[]>,
      extractions: JSON.parse(JSON.stringify(extractionsSeed)) as Record<string, ExtractedFigure[]>,
      auditLog: JSON.parse(JSON.stringify(auditLogSeed)) as AuditLogEntry[],
      activeCaseId: 'APP-1001',
      currentRole: 'Relationship Manager',
      currentScreen: 'applications',
      activeDocPage: 'bank',
      systemPrompts: JSON.parse(JSON.stringify(DEFAULT_PROMPTS)) as ModelPromptConfig[]
    };
  }

  getState(): AppState {
    return this.state;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {}
    this.notify();
  }

  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.state = {
      applications: JSON.parse(JSON.stringify(applicationsSeed)) as SMEApplication[],
      documents: JSON.parse(JSON.stringify(documentsSeed)) as Record<string, DocumentItem[]>,
      extractions: JSON.parse(JSON.stringify(extractionsSeed)) as Record<string, ExtractedFigure[]>,
      auditLog: JSON.parse(JSON.stringify(auditLogSeed)) as AuditLogEntry[],
      activeCaseId: 'APP-1001',
      currentRole: 'Relationship Manager',
      currentScreen: 'applications',
      activeDocPage: 'bank',
      systemPrompts: JSON.parse(JSON.stringify(DEFAULT_PROMPTS)) as ModelPromptConfig[]
    };
    this.logger = new AuditLogger(this.state.auditLog);
    this.save();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  setRole(role: UserRole) {
    this.state.currentRole = role;
    this.save();
  }

  setScreen(screen: string) {
    this.state.currentScreen = screen;
    this.save();
  }

  setActiveCase(caseId: string) {
    this.state.activeCaseId = caseId;
    this.save();
  }

  confirmFigure(figId: string, userName: string) {
    const figures = this.state.extractions[this.state.activeCaseId] || [];
    const fig = figures.find(f => f.id === figId);
    if (!fig) return;

    fig.status = 'Confirmed';
    fig.confirmedValue = fig.extractedValue;
    fig.checkedBy = userName;
    fig.checkedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const entry = this.logger.record(
      'FIGURE_CONFIRMED',
      this.state.activeCaseId,
      userName,
      'Analyst',
      `Confirmed figure ${fig.label} = ₹${fig.extractedValue.toLocaleString('en-IN')} against source page ${fig.sourcePage}.`
    );
    this.state.auditLog.unshift(entry);
    this.save();
  }

  overrideFigure(figId: string, correctedVal: number, reason: string, userName: string) {
    const figures = this.state.extractions[this.state.activeCaseId] || [];
    const fig = figures.find(f => f.id === figId);
    if (!fig) return;

    fig.status = 'Overridden';
    fig.confirmedValue = correctedVal;
    fig.overrideReason = reason;
    fig.checkedBy = userName;
    fig.checkedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const entry = this.logger.record(
      'FIGURE_OVERRIDDEN',
      this.state.activeCaseId,
      userName,
      'Analyst',
      `Analyst override on ${fig.label}: Changed from ${fig.extractedValue} to ${correctedVal}. Justification: "${reason}"`
    );
    this.state.auditLog.unshift(entry);
    this.save();
  }

  syncSpreading(userName: string) {
    const app = this.state.applications.find(a => a.id === this.state.activeCaseId);
    if (app) app.status = 'Spreading Complete';

    const entry = this.logger.record(
      'SPREADING_SYNCED',
      this.state.activeCaseId,
      userName,
      'Analyst',
      'All extracted figures verified by analyst. Synced to financial spreading model.'
    );
    this.state.auditLog.unshift(entry);
    this.save();
  }

  recordSignOff(decision: 'Approved' | 'Rejected' | 'Referred to Committee', notes: string, userName: string) {
    const app = this.state.applications.find(a => a.id === this.state.activeCaseId);
    if (!app) return;

    app.status = decision === 'Approved' ? 'Approved' : decision === 'Rejected' ? 'Rejected' : 'Referred';
    app.creditDecision = {
      applicationId: app.id,
      decision,
      decisionNotes: notes,
      signedBy: `${userName} (CRO / Credit Approver)`,
      signedRole: 'Credit Officer',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const entry = this.logger.record(
      'CREDIT_SIGNOFF',
      app.id,
      userName,
      'Credit Officer',
      `Credit decision recorded: ${decision} for ₹${app.amount.toLocaleString('en-IN')}. Rationale: "${notes}". System did NOT approve automatically.`
    );
    this.state.auditLog.unshift(entry);
    this.save();
  }

  updatePrompt(promptId: string, newText: string, temperature: number, userRole: UserRole, userName: string): { success: boolean; error?: string } {
    if (userRole !== 'Owner') {
      return {
        success: false,
        error: 'Permission Denied: Only the Platform Owner (Devina Sen) holds delegated authority to update model system instructions.'
      };
    }

    if (!this.state.systemPrompts) {
      this.state.systemPrompts = JSON.parse(JSON.stringify(DEFAULT_PROMPTS));
    }

    const promptObj = this.state.systemPrompts.find(p => p.id === promptId);
    if (!promptObj) {
      return { success: false, error: 'Prompt configuration ID not found.' };
    }

    promptObj.prompt = newText;
    promptObj.temperature = temperature;
    promptObj.version = `v${(parseFloat(promptObj.version.replace('v', '')) + 0.1).toFixed(1)}-custom`;
    promptObj.lastUpdatedBy = `${userName} (Platform Owner)`;
    promptObj.lastUpdatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const entry = this.logger.record(
      'SYSTEM_PROMPT_UPDATED',
      promptId,
      userName,
      'Owner',
      `Updated ${promptObj.name} prompt instructions (${promptObj.version}). Temperature: ${temperature}.`
    );
    this.state.auditLog.unshift(entry);
    this.save();
    return { success: true };
  }

  resetPrompts(userRole: UserRole, userName: string): { success: boolean; error?: string } {
    if (userRole !== 'Owner') {
      return {
        success: false,
        error: 'Permission Denied: Only the Platform Owner can restore factory system instructions.'
      };
    }

    this.state.systemPrompts = JSON.parse(JSON.stringify(DEFAULT_PROMPTS));
    const entry = this.logger.record(
      'SYSTEM_PROMPT_RESET',
      'all_prompts',
      userName,
      'Owner',
      'Restored factory baseline model instructions for all models.'
    );
    this.state.auditLog.unshift(entry);
    this.save();
    return { success: true };
  }

  getSystemPrompts(): ModelPromptConfig[] {
    return this.state.systemPrompts || DEFAULT_PROMPTS;
  }

  getAuditLogs(): AuditLogEntry[] {
    return this.state.auditLog;
  }
}

export const store = new AppStore();
