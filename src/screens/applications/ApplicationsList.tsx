import React, { useState } from 'react';
import type { SMEApplication } from '../../domain/types';

interface ApplicationsListProps {
  applications: SMEApplication[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
}

export const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  activeCaseId,
  onSelectCase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'eligible' | 'outofscope'>('all');

  const filtered = applications.filter(app => {
    const matchSearch = app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.sector.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'eligible') return !app.isOutOfScope;
    if (filter === 'outofscope') return app.isOutOfScope;
    return true;
  });

  return (
    <div className="screen-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Applications Queue</h2>
          <p style={{ fontSize: '13px', color: 'var(--mute)' }}>
            Simple SME loan applications (Under ₹25 lakh). Applications $\ge$ ₹25L are blocked as out of scope.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="search"
            placeholder="Search by ID, name, sector..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '13px'
            }}
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '13px', fontWeight: 600
            }}
          >
            <option value="all">All Applications (12)</option>
            <option value="eligible">Eligible Only (&lt; ₹25L)</option>
            <option value="outofscope">Out of Scope (≥ ₹25L)</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
              <th style={{ padding: '12px 16px' }}>App ID</th>
              <th style={{ padding: '12px 16px' }}>Applicant</th>
              <th style={{ padding: '12px 16px' }}>Sector</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Facility (₹)</th>
              <th style={{ padding: '12px 16px' }}>Age</th>
              <th style={{ padding: '12px 16px' }}>Assigned RM</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Eligibility Scope</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(app => {
              const isSelected = app.id === activeCaseId;
              const isEligible = !app.isOutOfScope;

              return (
                <tr
                  key={app.id}
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: isSelected ? 'var(--blue-light)' : 'transparent',
                    opacity: app.isOutOfScope ? 0.85 : 1
                  }}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>
                    {app.id}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{app.applicant}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--mute)' }}>{app.sector}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700 }}>
                    ₹ {app.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{app.ageDays}d</span>
                    <span style={{ fontSize: '11px', color: 'var(--mute)', marginLeft: '4px' }}>
                      ({18 - app.ageDays > 0 ? (18 - app.ageDays) + 'd to SLA' : 'Exceeded'})
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--mute)' }}>{app.assignedRM}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700,
                      background: app.isOutOfScope ? 'var(--error-bg)' : app.status === 'Approved' ? 'var(--ok-bg)' : 'var(--blue-bg)',
                      color: app.isOutOfScope ? 'var(--error-ink)' : app.status === 'Approved' ? 'var(--ok-ink)' : 'var(--blue)'
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {isEligible ? (
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: 'var(--ok-bg)', color: 'var(--ok-ink)' }}>
                        ✔ Eligible (&lt;₹25L)
                      </span>
                    ) : (
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: 'var(--error-bg)', color: 'var(--error-ink)' }} title={app.outOfScopeReason}>
                        ✕ Out of Scope (≥₹25L)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => onSelectCase(app.id)}
                      style={{
                        padding: '4px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '6px',
                        border: '1px solid var(--blue)', background: isSelected ? 'var(--blue)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--blue)', cursor: 'pointer'
                      }}
                    >
                      {isSelected ? 'Active' : 'Select'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
