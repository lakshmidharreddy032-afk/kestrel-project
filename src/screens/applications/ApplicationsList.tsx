import React, { useState } from 'react';
import type { SMEApplication } from '../../domain/types';
import { checkLoanEligibility } from '../../domain/rules/eligibility';
import { store } from '../../services/store';
import { useToast } from '../../components/ui/Toast';

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
  const [showNewModal, setShowNewModal] = useState(false);
  const [newApplicant, setNewApplicant] = useState('');
  const [newSector, setNewSector] = useState('Manufacturing');
  const [newAmountLakh, setNewAmountLakh] = useState('18.5');
  const { showToast } = useToast();

  const totalCount = applications.length;
  const eligibleCount = applications.filter(a => !a.isOutOfScope).length;
  const outOfScopeCount = applications.filter(a => a.isOutOfScope).length;

  const filtered = applications.filter(app => {
    const matchSearch = app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.sector.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'eligible') return !app.isOutOfScope;
    if (filter === 'outofscope') return app.isOutOfScope;
    return true;
  });

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newAmountLakh) * 100000;
    if (!newApplicant.trim()) {
      showToast('error', 'Validation Error', 'Please enter a borrower entity name.');
      return;
    }
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast('error', 'Validation Error', 'Please enter a valid loan amount.');
      return;
    }

    const eligibility = checkLoanEligibility(amountVal);
    const newId = `APP-10${applications.length + 1}`;

    const newApp: SMEApplication = {
      id: newId,
      applicant: newApplicant.trim(),
      sector: newSector,
      amount: amountVal,
      ageDays: 1,
      assignedRM: 'Vikram Malhotra',
      status: 'Documents Needed',
      requestSentCount: 0,
      isOutOfScope: !eligibility.isEligible,
      outOfScopeReason: eligibility.reason
    };

    store.getState().applications.unshift(newApp);
    store.save();
    setShowNewModal(false);
    setNewApplicant('');

    if (eligibility.isEligible) {
      showToast('success', 'Application Created', `${newId} for ₹${newAmountLakh}L is within scope (< ₹25L).`);
    } else {
      showToast('warning', 'Hard Block Enforced', `${newId} (₹${newAmountLakh}L) triggers Out-of-Scope guardrail (≥ ₹25L ceiling).`);
    }
    onSelectCase(newId);
  };

  return (
    <div className="screen-container">
      {/* KPI Overview Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '16px' }} className="interactive-card">
          <div style={{ fontSize: '12px', color: 'var(--mute)', fontWeight: 600 }}>Active Queue Volume</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--mono)', marginTop: '4px' }}>
            {totalCount} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--mute)' }}>files</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--mute)', marginTop: '4px' }}>SME Working Capital Pipeline</div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '16px' }} className="interactive-card">
          <div style={{ fontSize: '12px', color: 'var(--ok-ink)', fontWeight: 600 }}>Eligible (&lt; ₹25L Ceiling)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ok-ink)', fontFamily: 'var(--mono)', marginTop: '4px' }}>
            {eligibleCount} <span style={{ fontSize: '13px', fontWeight: 500 }}>in policy</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ok-ink)', marginTop: '4px' }}>Assisted Extraction • Human Credit Sign-off</div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '16px' }} className="interactive-card">
          <div style={{ fontSize: '12px', color: 'var(--error-ink)', fontWeight: 600 }}>Out of Scope (≥ ₹25L)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--error-ink)', fontFamily: 'var(--mono)', marginTop: '4px' }}>
            {outOfScopeCount} <span style={{ fontSize: '13px', fontWeight: 500 }}>blocked</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--error-ink)', marginTop: '4px' }}>Strict governance guardrail #1</div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '16px' }} className="interactive-card">
          <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600 }}>Target Turnaround Time</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--mono)', marginTop: '4px' }}>
            11.8d <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--mute)' }}>vs 18d</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ok-ink)', marginTop: '4px' }}>↓ 34.4% TAT reduction vs 18d manual baseline (Kestrel FY25 Audit)</div>
        </div>
      </div>

      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Applications Queue & Pipeline</h2>
          <p style={{ fontSize: '13px', color: 'var(--mute)' }}>
            Simple SME loan applications (&lt; ₹25 Lakh). Select any file to launch the S1/S3/S4 extraction and human verification workflow.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search by ID, name, sector..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '13px', minWidth: '220px'
            }}
          />
          <div style={{ display: 'flex', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--line)', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setFilter('all')}
              style={{
                padding: '5px 12px', borderRadius: '6px', border: 'none',
                background: filter === 'all' ? 'var(--blue)' : 'transparent',
                color: filter === 'all' ? '#fff' : 'var(--ink)',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('eligible')}
              style={{
                padding: '5px 12px', borderRadius: '6px', border: 'none',
                background: filter === 'eligible' ? 'var(--ok-ink)' : 'transparent',
                color: filter === 'eligible' ? '#fff' : 'var(--ink)',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Eligible ({eligibleCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('outofscope')}
              style={{
                padding: '5px 12px', borderRadius: '6px', border: 'none',
                background: filter === 'outofscope' ? 'var(--error-ink)' : 'transparent',
                color: filter === 'outofscope' ? '#fff' : 'var(--ink)',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Out of Scope ({outOfScopeCount})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            style={{
              padding: '7px 16px', borderRadius: '8px', border: 'none', background: 'var(--blue)',
              color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <span>+</span>
            <span>Simulate New Case</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
              <th style={{ padding: '12px 16px' }}>App ID</th>
              <th style={{ padding: '12px 16px' }}>Applicant</th>
              <th style={{ padding: '12px 16px' }}>Sector</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Facility (₹)</th>
              <th style={{ padding: '12px 16px' }}>Age & SLA</th>
              <th style={{ padding: '12px 16px' }}>Assigned RM</th>
              <th style={{ padding: '12px 16px' }}>Stage Status</th>
              <th style={{ padding: '12px 16px' }}>Ceiling Scope</th>
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
                  onClick={() => onSelectCase(app.id)}
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: isSelected ? 'var(--blue-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>
                    {app.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{app.applicant}</div>
                    <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Working Capital Term Facility</div>
                  </td>
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
                    <span
                      style={{
                        padding: '3px 8px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700,
                        background: app.isOutOfScope ? 'var(--error-bg)' : app.status === 'Approved' ? 'var(--ok-bg)' : 'var(--blue-bg)',
                        color: app.isOutOfScope ? 'var(--error-ink)' : app.status === 'Approved' ? 'var(--ok-ink)' : 'var(--blue)'
                      }}
                      title={app.status === 'Approved' ? 'Approved by Credit Officer (Arjun Iyer). The system never auto-approves.' : undefined}
                    >
                      {app.status === 'Approved' ? 'Officer Approved (Manual Sign-off)' : app.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {isEligible ? (
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: 'var(--ok-bg)', color: 'var(--ok-ink)' }}>
                        ✔ Eligible (&lt; ₹25L)
                      </span>
                    ) : (
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: 'var(--error-bg)', color: 'var(--error-ink)' }} title={app.outOfScopeReason}>
                        ⛔ Blocked (≥ ₹25L)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(app.id);
                      }}
                      style={{
                        padding: '4px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '6px',
                        border: '1px solid var(--blue)', background: isSelected ? 'var(--blue)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--blue)', cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    >
                      {isSelected ? 'Active' : 'Open Case'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Simulate New Case Modal */}
      {showNewModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)',
          display: 'grid', placeItems: 'center', zIndex: 400, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px',
            boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Simulate New SME Application</h3>
              <button type="button" onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--mute)' }}>
              Test the ₹25 Lakh ticket ceiling guardrail in real time. Entering ₹25 Lakh or more will trigger a hard block.
            </p>

            <form onSubmit={handleCreateApplication} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Borrower Entity Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navrang Exports & Engineering"
                  value={newApplicant}
                  onChange={e => setNewApplicant(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Industry Sector:</label>
                <select
                  value={newSector}
                  onChange={e => setNewSector(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card)' }}
                >
                  <option value="Manufacturing">Precision Manufacturing</option>
                  <option value="Textiles">Textiles & Apparel</option>
                  <option value="Agro-Processing">Agro-Processing & Food</option>
                  <option value="Wholesale">Wholesale & B2B Trading</option>
                  <option value="Logistics">Logistics & Warehousing</option>
                  <option value="Pharma">Pharmaceuticals & Chemicals</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Requested Facility Amount (in ₹ Lakhs):</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    value={newAmountLakh}
                    onChange={e => setNewAmountLakh(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card)', fontFamily: 'var(--mono)' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mute)' }}>Lakhs (₹)</span>
                </div>
                <div style={{ fontSize: '11px', marginTop: '4px', color: parseFloat(newAmountLakh) >= 25 ? 'var(--error-ink)' : 'var(--ok-ink)', fontWeight: 600 }}>
                  {parseFloat(newAmountLakh) >= 25 ? '⚠️ Warning: ≥ ₹25L triggers policy hard block!' : '✔ Within scope (< ₹25 Lakh ticket size).'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: 'var(--blue)', color: '#fff', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700 }}
                >
                  Create & Launch Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
