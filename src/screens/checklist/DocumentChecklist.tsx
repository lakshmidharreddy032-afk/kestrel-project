import React, { useState } from 'react';
import type { SMEApplication, DocumentItem, UserRole } from '../../domain/types';
import { runGapChecks } from '../../domain/rules/gapCheck';
import { generateConsolidatedRequest } from '../../domain/rules/checklist';
import { RequestPreview } from './RequestPreview';

interface DocumentChecklistProps {
  application: SMEApplication;
  documents: DocumentItem[];
  currentRole: UserRole;
  onSimulateUpload: () => void;
  onSendConsolidatedRequest: () => void;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  application,
  documents,
  currentRole,
  onSimulateUpload,
  onSendConsolidatedRequest
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const issues = runGapChecks(documents);
  const isRM = currentRole === 'Relationship Manager';
  const previewMessage = generateConsolidatedRequest(application.applicant, issues);

  return (
    <div className="screen-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Day-One Document Checklist (S1)</h2>
          <p style={{ fontSize: '13px', color: 'var(--mute)' }}>
            Consolidated intake checklist for {application.applicant}. Single-chase request generation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onSimulateUpload}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)',
              color: 'var(--ink)', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            📤 Simulate Upload / Resolve Gap
          </button>

          <button
            type="button"
            onClick={() => setShowPreview(true)}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--blue)',
              color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            ✉️ Send One Request ({application.requestSentCount || 0} Sent)
          </button>
        </div>
      </div>

      {/* Checklist Table */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
              <th style={{ padding: '12px 16px' }}>Document Item</th>
              <th style={{ padding: '12px 16px' }}>Required Scope</th>
              <th style={{ padding: '12px 16px' }}>Uploaded File</th>
              <th style={{ padding: '12px 16px' }}>Period Covered</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Diagnostics</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => {
              const statusBg = doc.status === 'Received' ? 'var(--ok-bg)' : doc.status === 'Missing' ? 'var(--error-bg)' : 'var(--warn-bg)';
              const statusInk = doc.status === 'Received' ? 'var(--ok-ink)' : doc.status === 'Missing' ? 'var(--error-ink)' : 'var(--warn-ink)';

              return (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{doc.title}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--mute)' }}>
                    {doc.type === 'bank_statement' ? '6 Consecutive Months' : doc.type === 'gst_return' ? '12 Months (GSTR-3B)' : 'Valid Certified Copy'}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                    {doc.fileName || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--mute)' }}>
                    {doc.periodStart && doc.periodEnd ? `${doc.periodStart} to ${doc.periodEnd} (${doc.monthsCovered}m)` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: statusBg, color: statusInk }}>
                      {doc.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--mute)' }}>
                    {doc.note || 'Document verified in order.'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showPreview && (
        <RequestPreview
          messageText={previewMessage}
          onClose={() => setShowPreview(false)}
          onSendSimulation={() => {
            onSendConsolidatedRequest();
            setShowPreview(false);
          }}
          canSend={isRM}
        />
      )}
    </div>
  );
};
