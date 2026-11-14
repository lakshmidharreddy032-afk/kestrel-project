import type { AuditLogEntry, UserRole } from '../domain/types';
import { MODEL_VERSION_LABEL } from '../domain/constants';

export class AuditLogger {
  private log: AuditLogEntry[];

  constructor(initialEntries: AuditLogEntry[] = []) {
    this.log = [...initialEntries];
  }

  getEntries(filter: string = 'all'): AuditLogEntry[] {
    if (filter === 'all') return [...this.log];
    return this.log.filter(e => e.action.includes(filter.toUpperCase()));
  }

  record(
    action: AuditLogEntry['action'],
    applicationId: string,
    user: string,
    role: UserRole,
    details: string
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: `${user} (Fictional)`,
      role,
      action,
      applicationId,
      details,
      modelVersion: MODEL_VERSION_LABEL
    };

    this.log.unshift(entry);
    return entry;
  }
}
