import React, { useState } from 'react';
import type { AuditLogEntry } from '../../domain/types';

interface AuditLogTableProps {
  entries: AuditLogEntry[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ entries }) => {
  const [filter, setFilter] = useState('all');

  const filtered = entries.filter(e => {
    if (filter === 'all') return true;
    return e.action.includes(filter.toUpperCase());
  });

  return (
    <div className="screen-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Immutable Compliance Audit Log</h2>
          <p style={{ fontSize: '13px', color: 'var(--mute)' }}>
            Every extraction, figure verification, override, spreading sync, and credit sign-off is logged with timestamp, user, role, and model version.
          </p>
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '13px', fontWeight: 600 }}
        >
          <option value="all">All Events ({entries.length})</option>
          <option value="confirmed">Figure Confirmations</option>
          <option value="overridden">Analyst Overrides</option>
          <option value="signoff">Credit Sign-offs</option>
          <option value="consolidated">Consolidated Requests</option>
        </select>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
              <th style={{ padding: '12px 16px' }}>Event ID</th>
              <th style={{ padding: '12px 16px' }}>Timestamp</th>
              <th style={{ padding: '12px 16px' }}>User & Role</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
              <th style={{ padding: '12px 16px' }}>Application</th>
              <th style={{ padding: '12px 16px' }}>Details / Rationale</th>
              <th style={{ padding: '12px 16px' }}>Model Version</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(entry => (
              <tr key={entry.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>
                  {entry.id}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--mute)', whiteSpace: 'nowrap' }}>
                  {entry.timestamp}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600 }}>{entry.user}</div>
                  <div style={{ fontSize: '11px', color: 'var(--mute)' }}>{entry.role}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700, fontFamily: 'var(--mono)',
                    background: entry.action.includes('SIGNOFF') ? 'var(--ok-bg)' : entry.action.includes('OVERRIDDEN') ? 'var(--purple-bg)' : 'var(--blue-bg)',
                    color: entry.action.includes('SIGNOFF') ? 'var(--ok-ink)' : entry.action.includes('OVERRIDDEN') ? 'var(--purple-ink)' : 'var(--blue)'
                  }}>
                    {entry.action}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontWeight: 600 }}>
                  {entry.applicationId}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                  {entry.details}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--mute)' }}>
                  {entry.modelVersion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
