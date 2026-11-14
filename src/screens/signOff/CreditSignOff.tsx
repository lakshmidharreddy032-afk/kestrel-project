import React, { useState } from 'react';
import type { SMEApplication, UserRole } from '../../domain/types';
import { validateSignOff } from '../../domain/rules/signOff';

interface CreditSignOffProps {
  application: SMEApplication;
  currentRole: UserRole;
  onRecordSignOff: (decision: 'Approved' | 'Rejected' | 'Referred to Committee', notes: string) => void;
}

export const CreditSignOff: React.FC<CreditSignOffProps> = ({
  application,
  currentRole,
  onRecordSignOff
}) => {
  const [decisionNotes, setDecisionNotes] = useState('');
  const isOfficer = currentRole === 'Credit Officer';
  const validation = validateSignOff(currentRole, decisionNotes);

  const quickTemplates = [
    "Facility approved. DSCR 1.82x exceeds 1.35x benchmark with clean HDFC bank conduct.",
    "Approved. Strong annual GST turnover (₹1.62 Cr) and stable monthly AMB > ₹4.8 Lakh.",
    "Recommend committee referral due to industry sector cyclicality.",
    "Facility rejected. Cheque returns and debt coverage below minimum threshold."
  ];

  const handleSubmit = (decision: 'Approved' | 'Rejected' | 'Referred to Committee') => {
    if (!validation.allowed) {
      alert(validation.error);
      return;
    }
    onRecordSignOff(decision, decisionNotes.trim());
    setDecisionNotes('');
  };

  return (
    <div className="screen-container">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Credit Officer Sign-off Gate</h2>
        <p style={{ fontSize: '13px', color: 'var(--mute)' }}>
          Final credit approval step. Only a designated Credit Officer (Arjun Iyer) can sign off. System never auto-approves.
        </p>
      </div>

      {!isOfficer && (
        <div style={{
          background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: '12px', padding: '16px',
          color: 'var(--warn-ink)', marginBottom: '16px', fontSize: '13px', fontWeight: 600
        }}>
          ⚠️ Role Restriction: You are logged in as <strong>{currentRole}</strong>. Only the <strong>Credit Officer (Arjun Iyer)</strong> holds delegated lending authority.
        </div>
      )}

      {application.creditDecision && (
        <div style={{
          background: 'var(--ok-bg)', border: '1px solid var(--ok-border)', borderRadius: '12px', padding: '16px',
          color: 'var(--ok-ink)', marginBottom: '16px', fontSize: '13px'
        }}>
          <strong>Prior Decision on Record:</strong> {application.creditDecision.decision} by {application.creditDecision.signedBy} on {application.creditDecision.timestamp}<br />
          <em>Rationale: &ldquo;{application.creditDecision.decisionNotes}&rdquo;</em>
        </div>
      )}

      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Application Summary:
          </label>
          <input
            type="text"
            readOnly
            value={`${application.id}: ${application.applicant} • Facility: ₹${application.amount.toLocaleString('en-IN')} • Status: ${application.status}`}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card-subtle)', fontWeight: 600 }}
          />
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Decision Rationale (Mandatory, minimum 10 characters):
          </label>
          <textarea
            rows={4}
            value={decisionNotes}
            onChange={e => setDecisionNotes(e.target.value)}
            placeholder="Type comprehensive underwriting rationale here..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '13px', resize: 'vertical' }}
          />
        </div>

        {/* Quick Rationale Templates */}
        <div>
          <span style={{ fontSize: '11.5px', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>Quick Rationale Templates:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickTemplates.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDecisionNotes(t)}
                style={{
                  padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card-subtle)',
                  fontSize: '11.5px', cursor: 'pointer', textAlign: 'left'
                }}
              >
                {t.slice(0, 48)}...
              </button>
            ))}
          </div>
        </div>

        {/* Decision Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
          <button
            type="button"
            disabled={!isOfficer}
            onClick={() => handleSubmit('Approved')}
            style={{
              padding: '10px 22px', borderRadius: '8px', border: 'none', background: isOfficer ? 'var(--ok-ink)' : 'var(--line)',
              color: '#fff', fontSize: '13px', fontWeight: 700, cursor: isOfficer ? 'pointer' : 'not-allowed'
            }}
          >
            ✔ Approve Loan Facility
          </button>

          <button
            type="button"
            disabled={!isOfficer}
            onClick={() => handleSubmit('Referred to Committee')}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--warn-border)', background: isOfficer ? 'var(--warn-bg)' : 'transparent',
              color: 'var(--warn-ink)', fontSize: '13px', fontWeight: 600, cursor: isOfficer ? 'pointer' : 'not-allowed'
            }}
          >
            ⚖️ Refer to Committee
          </button>

          <button
            type="button"
            disabled={!isOfficer}
            onClick={() => handleSubmit('Rejected')}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--error-border)', background: isOfficer ? 'var(--error-bg)' : 'transparent',
              color: 'var(--error-ink)', fontSize: '13px', fontWeight: 600, cursor: isOfficer ? 'pointer' : 'not-allowed'
            }}
          >
            ✕ Reject Application
          </button>
        </div>
      </div>
    </div>
  );
};
