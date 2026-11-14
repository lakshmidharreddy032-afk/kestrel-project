import React from 'react';
import type { SMEApplication, DocumentItem } from '../../domain/types';
import { runGapChecks } from '../../domain/rules/gapCheck';

interface GapCheckResultsProps {
  application: SMEApplication;
  documents: DocumentItem[];
}

export const GapCheckResults: React.FC<GapCheckResultsProps> = ({ application, documents }) => {
  const issues = runGapChecks(documents);

  return (
    <div className="screen-container">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Missing and Duplicate Document Checks (S3)</h2>
        <p style={{ fontSize: '13px', color: 'var(--mute)' }}>
          Deterministic, non-AI rule evaluation for {application.applicant}. Flags missing items, duplicate file hashes, and statement period coverage gaps.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {issues.length === 0 ? (
          <div style={{ background: 'var(--ok-bg)', border: '1px solid var(--ok-border)', borderRadius: '12px', padding: '24px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✔</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ok-ink)' }}>All Primary Documents In Order</h3>
            <p style={{ fontSize: '13px', color: 'var(--ok-ink)', marginTop: '4px' }}>
              No missing documents, duplicate hashes, or coverage gaps detected for this case.
            </p>
          </div>
        ) : (
          issues.map(iss => {
            const isError = iss.severity === 'error';
            return (
              <div
                key={iss.ruleId}
                style={{
                  background: 'var(--card)', borderRadius: '12px', border: `1px solid ${isError ? 'var(--error-border)' : 'var(--warn-border)'}`,
                  padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 700, color: 'var(--mute)' }}>
                    {iss.ruleId}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                    background: isError ? 'var(--error-bg)' : 'var(--warn-bg)',
                    color: isError ? 'var(--error-ink)' : 'var(--warn-ink)'
                  }}>
                    {iss.severity.toUpperCase()}
                  </span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 700, color: isError ? 'var(--error-ink)' : 'var(--warn-ink)' }}>
                  {iss.ruleName}
                </h4>

                <p style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                  {iss.reason}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--line)', fontSize: '12px', color: 'var(--mute)' }}>
                  <strong>Action Needed:</strong> {iss.fixAction}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
