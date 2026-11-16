import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../../src/services/store';
import { ROLES } from '../../src/roles/roles';
import { DEMO_USERS } from '../../src/services/auth';

describe('LLM System Prompt Governance & Role Enforcement', () => {
  beforeEach(() => {
    store.resetPrompts('Owner', 'Devina Sen');
  });

  it('verifies that only Owner role has canChangePrompts set to true in ROLES config', () => {
    expect(ROLES['Owner'].permissions.canChangePrompts).toBe(true);
    expect(ROLES['Credit Officer'].permissions.canChangePrompts).toBe(false);
    expect(ROLES['Analyst'].permissions.canChangePrompts).toBe(false);
    expect(ROLES['Relationship Manager'].permissions.canChangePrompts).toBe(false);
    expect(ROLES['Auditor'].permissions.canChangePrompts).toBe(false);
  });

  it('verifies DEMO_USERS permissions matrix assigns prompt management strictly to Owner', () => {
    const owner = DEMO_USERS['owner'];
    const analyst = DEMO_USERS['analyst'];
    const officer = DEMO_USERS['officer'];
    const rm = DEMO_USERS['rm'];
    const auditor = DEMO_USERS['auditor'];

    expect(owner.allowedActions.some(a => a.toLowerCase().includes('prompt'))).toBe(true);
    expect(analyst.restrictedActions.some(r => r.toLowerCase().includes('prompt'))).toBe(true);
    expect(officer.restrictedActions.some(r => r.toLowerCase().includes('prompt'))).toBe(true);
    expect(rm.restrictedActions.some(r => r.toLowerCase().includes('prompt'))).toBe(true);
    expect(auditor.restrictedActions.some(r => r.toLowerCase().includes('prompt'))).toBe(true);
  });

  it('allows Owner to update system instructions and records an immutable audit log entry', () => {
    const result = store.updatePrompt(
      'ocr_extraction',
      'Updated extraction instruction strictly for banking statements.',
      0.15,
      'Owner',
      'Devina Sen'
    );

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();

    const currentPrompts = store.getSystemPrompts();
    const updated = currentPrompts.find(p => p.id === 'ocr_extraction');
    expect(updated).toBeDefined();
    expect(updated?.prompt).toBe('Updated extraction instruction strictly for banking statements.');
    expect(updated?.temperature).toBe(0.15);
    expect(updated?.lastUpdatedBy).toContain('Devina Sen');

    // Verify audit log entry
    const logs = store.getAuditLogs();
    const promptLog = logs.find(l => l.action === 'SYSTEM_PROMPT_UPDATED');
    expect(promptLog).toBeDefined();
    expect(promptLog?.user).toContain('Devina Sen');
    expect(promptLog?.role).toBe('Owner');
    expect(promptLog?.applicationId).toBe('ocr_extraction');
  });

  it('blocks Analyst, Credit Officer, RM, and Auditor from updating system prompts', () => {
    const nonOwnerRoles = [
      { role: 'Analyst' as const, name: 'Meena Pillai' },
      { role: 'Credit Officer' as const, name: 'Arjun Iyer' },
      { role: 'Relationship Manager' as const, name: 'Vikram Rao' },
      { role: 'Auditor' as const, name: 'Pooja Varma' },
    ];

    for (const user of nonOwnerRoles) {
      const res = store.updatePrompt(
        'ocr_extraction',
        'Malicious or unauthorized prompt tweak attempt',
        0.5,
        user.role,
        user.name
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain('Only the Platform Owner');
    }
  });

  it('blocks non-owners from resetting prompts to factory defaults', () => {
    const res = store.resetPrompts('Credit Officer', 'Arjun Iyer');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Only the Platform Owner');
  });
});
