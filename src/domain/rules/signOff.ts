import type { ExtractedFigure, UserRole } from '../types.ts';

/**
 * Hard Governance Gate:
 * 1. Blocks spreading sync until 100% of extracted figures are verified by an analyst.
 * 2. Only a designated Credit Officer can sign off loan decisions.
 * 3. The system NEVER approves automatically.
 * 4. Written decision rationale ($\ge 10$ characters) is mandatory.
 */
export function canSyncToSpreading(figures: ExtractedFigure[]): { allowed: boolean; uncheckedCount: number; message?: string } {
  const unchecked = figures.filter(f => f.status === 'Unchecked');
  if (unchecked.length > 0) {
    return {
      allowed: false,
      uncheckedCount: unchecked.length,
      message: `Cannot sync to spreading sheet: ${unchecked.length} figure(s) remain unverified.`
    };
  }
  return { allowed: true, uncheckedCount: 0 };
}

export function validateSignOff(role: UserRole, notes: string): { allowed: boolean; error?: string } {
  if (role !== 'Credit Officer') {
    return {
      allowed: false,
      error: 'Hard Rule: Only a designated Credit Officer (e.g. Arjun Iyer) can approve credit decisions.'
    };
  }

  if (!notes || notes.trim().length < 10) {
    return {
      allowed: false,
      error: 'Hard Rule: Written credit decision rationale (minimum 10 characters) is mandatory for regulatory compliance.'
    };
  }

  return { allowed: true };
}
