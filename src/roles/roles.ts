import type { UserRole } from '../domain/types';

export interface RoleConfig {
  id: UserRole;
  name: string;
  initials: string;
  avatarClass: string;
  title: string;
  description: string;
  permissions: {
    canSendRequests: boolean;
    canConfirmFigures: boolean;
    canOverrideFigures: boolean;
    canSyncSpreading: boolean;
    canSignOffCredit: boolean;
    canViewObservability: boolean;
    canChangePrompts: boolean;
  };
}

export const ROLES: Record<UserRole, RoleConfig> = {
  'Relationship Manager': {
    id: 'Relationship Manager',
    name: 'Vikram Rao',
    initials: 'VR',
    avatarClass: 'avatar-rm',
    title: 'Relationship Manager (Fictional)',
    description: 'Document Intake & Consolidated Requests (S1)',
    permissions: {
      canSendRequests: true,
      canConfirmFigures: false,
      canOverrideFigures: false,
      canSyncSpreading: false,
      canSignOffCredit: false,
      canViewObservability: false,
      canChangePrompts: false
    }
  },
  'Analyst': {
    id: 'Analyst',
    name: 'Meena Pillai',
    initials: 'MP',
    avatarClass: 'avatar-analyst',
    title: 'Credit Analyst (Fictional)',
    description: 'Document Diagnostics (S3), Extraction Review (S4) & Spreading Sync',
    permissions: {
      canSendRequests: false,
      canConfirmFigures: true,
      canOverrideFigures: true,
      canSyncSpreading: true,
      canSignOffCredit: false,
      canViewObservability: false,
      canChangePrompts: false
    }
  },
  'Credit Officer': {
    id: 'Credit Officer',
    name: 'Arjun Iyer',
    initials: 'AI',
    avatarClass: 'avatar-officer',
    title: 'Chief Risk Officer / Credit Approver (Fictional)',
    description: 'Final Credit Governance & Loan Decision Sign-off',
    permissions: {
      canSendRequests: false,
      canConfirmFigures: false,
      canOverrideFigures: false,
      canSyncSpreading: false,
      canSignOffCredit: true,
      canViewObservability: false,
      canChangePrompts: false
    }
  },
  'Owner': {
    id: 'Owner',
    name: 'Devina Sen',
    initials: 'DS',
    avatarClass: 'avatar-owner',
    title: 'Platform & AI Operations Owner (Fictional)',
    description: 'LLM Observability, Model Cost Accounting, Token Telemetry & Architecture Governance',
    permissions: {
      canSendRequests: true,
      canConfirmFigures: true,
      canOverrideFigures: true,
      canSyncSpreading: true,
      canSignOffCredit: false,
      canViewObservability: true,
      canChangePrompts: true
    }
  },
  'Auditor': {
    id: 'Auditor',
    name: 'Pooja Deshmukh',
    initials: 'PD',
    avatarClass: 'avatar-auditor',
    title: 'RBI Regulatory Auditor (Fictional)',
    description: 'Independent Audit, Tamper-Evident Logs & Board Metric Inspection',
    permissions: {
      canSendRequests: false,
      canConfirmFigures: false,
      canOverrideFigures: false,
      canSyncSpreading: false,
      canSignOffCredit: false,
      canViewObservability: false,
      canChangePrompts: false
    }
  }
};
