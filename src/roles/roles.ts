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
      canSignOffCredit: false
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
      canSignOffCredit: false
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
      canSignOffCredit: true
    }
  }
};
