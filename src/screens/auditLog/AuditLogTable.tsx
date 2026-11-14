import React, { useState } from 'react';
import type { AuditLogEntry } from '../../domain/types';
import { useToast } from '../../components/ui/Toast';

interface AuditLogTableProps {
  entries: AuditLogEntry[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ entries }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const filtered = entries.filter(e => {
    const matchCategory = filter === 'all' || e.action.toLowerCase().includes(filter.toLowerCase());
    const matchSearch = e.id.toLowerCase().includes(search.toLowerCase()) ||
                        e.user.toLowerCase().includes(search.toLowerCase()) ||
                        e.applicationId.toLowerCase().includes(search.toLowerCase()) ||
                        e.details.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const exportCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'User', 'Role', 'Action', 'Application ID', 'Details', 'Model Version'];
    const rows = filtered.map(e => [
      e.id,
      e.timestamp,
      `"${e.user.replace(/"/g, '""')}"`,
      `"${e.role}"`,
      e.action,
      e.applicationId,
      `"${e.details.replace(/"/g, '""')}"`,
      e.modelVersion
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kestrel_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Audit Log Exported', 'CSV file downloaded successfully.');
  };

  const exportJSON = () => {
    const jsonStr = JSON.stringify(filtered, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kestrel_audit_log_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Audit Log Exported', 'JSON file downloaded successfully.');
  };

  return (
    <div className="screen-container">
      {/* Header & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Immutable Compliance Audit Log</h2>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--blue-bg)', color: 'var(--blue)' }}>
              SOC 2 / RBI Audit-Ready
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--mute)', marginTop: '2px' }}>
            Tamper-evident record of all extractions, figure checks, analyst overrides, and credit sanctions with actor identity and model version.
          </p>
        </div>

        {/* Search & Export Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search audit trail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '13px' }}
          />

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '13px', fontWeight: 600 }}
          >
            <option value="all">All Events ({entries.length})</option>
            <option value="confirmed">Figure Confirmations</option>
            <option value="overridden">Analyst Overrides</option>
            <option value="signoff">Credit Sanctions</option>
            <option value="consolidated">Consolidated Requests</option>
          </select>

          <button
            type="button"
            onClick={exportCSV}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)',
              color: 'var(--ink)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            📥 Export CSV
          </button>

          <button
            type="button"
            onClick={exportJSON}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)',
              color: 'var(--ink)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            📋 Export JSON
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
              <th style={{ padding: '12px 16px' }}>Event ID</th>
              <th style={{ padding: '12px 16px' }}>Timestamp (IST)</th>
              <th style={{ padding: '12px 16px' }}>Actor & Role</th>
              <th style={{ padding: '12px 16px' }}>Action Category</th>
              <th style={{ padding: '12px 16px' }}>Target Application</th>
              <th style={{ padding: '12px 16px' }}>Details / Diff Record</th>
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
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700, fontFamily: 'var(--mono)',
                    background: entry.action.includes('SIGNOFF') ? 'var(--ok-bg)' : entry.action.includes('OVERRIDDEN') ? 'var(--purple-bg)' : 'var(--blue-bg)',
                    color: entry.action.includes('SIGNOFF') ? 'var(--ok-ink)' : entry.action.includes('OVERRIDDEN') ? 'var(--purple-ink)' : 'var(--blue)'
                  }}>
                    {entry.action}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontWeight: 600 }}>
                  {entry.applicationId}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12.5px', lineHeight: 1.45 }}>
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
