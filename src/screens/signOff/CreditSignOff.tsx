import React, { useState } from 'react';
import type { SMEApplication, UserRole } from '../../domain/types';
import { validateSignOff } from '../../domain/rules/signOff';
import { useToast } from '../../components/ui/Toast';

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
  const [showSanctionLetter, setShowSanctionLetter] = useState(false);
  const [sanctionLetterRef, setSanctionLetterRef] = useState('');
  const { showToast } = useToast();

  const isOfficer = currentRole === 'Credit Officer';
  const isOutOfScope = application.isOutOfScope;
  const validation = validateSignOff(currentRole, decisionNotes);
  const noteLength = decisionNotes.trim().length;

  const quickTemplates = [
    "Facility approved. DSCR 1.82x exceeds 1.35x benchmark with clean HDFC bank conduct.",
    "Approved. Strong annual GST turnover (₹1.62 Cr) and stable monthly AMB > ₹4.8 Lakh.",
    "Recommend committee referral due to industry sector cyclicality.",
    "Facility rejected. Cheque returns and debt coverage below minimum policy threshold."
  ];

  const handleSubmit = (decision: 'Approved' | 'Rejected' | 'Referred to Committee') => {
    if (isOutOfScope) {
      showToast('error', 'Hard Block Enforced', 'Cannot approve: application exceeds ₹25 Lakh ceiling.');
      return;
    }
    if (!validation.allowed) {
      showToast('error', 'Validation Error', validation.error || 'Minimum 10 characters rationale required.');
      return;
    }

    const refNum = `KF/SME/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    setSanctionLetterRef(refNum);
    onRecordSignOff(decision, decisionNotes.trim());

    if (decision === 'Approved') {
      setShowSanctionLetter(true);
    }
    setDecisionNotes('');
  };

  return (
    <div className="screen-container">
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Credit Officer Sign-off Gate & Sanction Memo</h2>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--blue-bg)', color: 'var(--blue)' }}>
            Delegated Lending Authority
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--mute)', marginTop: '2px' }}>
          Final credit decision step. Only a designated Credit Officer (Arjun Iyer) can execute sanction. The system never auto-approves or automates credit decisions; every credit approval is strictly performed by a human officer with mandatory written rationale.
        </p>
      </div>

      {/* Out of Scope Hard Block Warning */}
      {isOutOfScope && (
        <div style={{
          background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: '12px', padding: '16px',
          color: 'var(--error-ink)', marginBottom: '16px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>⛔</span>
          <span>Out of scope: Ticket size exceeds ₹25 Lakh ceiling. Credit approval is permanently disabled for this file under NBFC policy guardrails.</span>
        </div>
      )}

      {/* Role Restriction Banner */}
      {!isOfficer && (
        <div style={{
          background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: '12px', padding: '16px',
          color: 'var(--warn-ink)', marginBottom: '16px', fontSize: '13px', fontWeight: 600
        }}>
          ⚠️ Role Restriction: You are logged in as <strong>{currentRole}</strong>. Only the <strong>Credit Officer (Arjun Iyer)</strong> holds delegated lending authority. Non-credit officers see actions as read-only.
        </div>
      )}

      {/* Prior Decision on Record */}
      {application.creditDecision && (
        <div style={{
          background: 'var(--ok-bg)', border: '1px solid var(--ok-border)', borderRadius: '12px', padding: '16px',
          color: 'var(--ok-ink)', marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <strong>Prior Decision on Record:</strong> {application.creditDecision.decision} by {application.creditDecision.signedBy} on {application.creditDecision.timestamp}<br />
            <em>Rationale: &ldquo;{application.creditDecision.decisionNotes}&rdquo;</em>
          </div>
          <button
            type="button"
            onClick={() => {
              setSanctionLetterRef(application.id.replace('APP', 'KF/SME'));
              setShowSanctionLetter(true);
            }}
            style={{
              padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--ok-border)', background: '#fff',
              color: 'var(--ok-ink)', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
            }}
          >
            📄 View Sanction Letter
          </button>
        </div>
      )}

      {/* Executive Credit Assessment Memo (CAM) Card */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '20px', marginBottom: '20px', boxShadow: 'var(--shadow-xs)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', color: 'var(--ink)' }}>
          Executive Credit Assessment Summary (CAM) — Human Sign-off Required
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--mute)' }}>Borrower Entity</div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{application.applicant}</div>
            <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Sector: {application.sector}</div>
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--mute)' }}>Facility & Limit</div>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>
              ₹ {application.amount.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ok-ink)', fontWeight: 600 }}>Working Capital Term Loan</div>
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--mute)' }}>Proposed Interest Rate</div>
            <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--mono)' }}>14.25% p.a.</div>
            <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Linked to NBFC PLR</div>
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--mute)' }}>Tenor & Repayment</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>24 Months</div>
            <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Monthly Equated Installments</div>
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--mute)' }}>Collateral Coverage</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ok-ink)' }}>1.32x Coverage</div>
            <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Book Debts & Stock</div>
          </div>
        </div>
      </div>

      {/* Decision Rationale Input & Actions */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-xs)' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700 }}>
              Underwriting Rationale (Mandatory, minimum 10 characters):
            </label>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: noteLength >= 10 ? 'var(--ok-ink)' : 'var(--error-ink)' }}>
              {noteLength} / 10 minimum characters
            </span>
          </div>
          <textarea
            rows={4}
            disabled={!isOfficer || isOutOfScope}
            value={decisionNotes}
            onChange={e => setDecisionNotes(e.target.value)}
            placeholder={isOfficer ? "Enter comprehensive credit officer underwriting rationale..." : "Read-only for current role."}
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)',
              background: isOfficer && !isOutOfScope ? 'var(--card)' : 'var(--card-subtle)', fontSize: '13px', resize: 'vertical'
            }}
          />
        </div>

        {/* Quick Rationale Templates */}
        {isOfficer && !isOutOfScope && (
          <div>
            <span style={{ fontSize: '11.5px', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>Quick Rationale Templates:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {quickTemplates.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDecisionNotes(t)}
                  style={{
                    padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card-subtle)',
                    fontSize: '11.5px', cursor: 'pointer', textAlign: 'left', color: 'var(--ink)'
                  }}
                >
                  {t.slice(0, 52)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Decision Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--line)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={!isOfficer || isOutOfScope || noteLength < 10}
            onClick={() => handleSubmit('Approved')}
            style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              background: isOfficer && !isOutOfScope && noteLength >= 10 ? 'var(--ok-ink)' : 'var(--line)',
              color: '#fff', fontSize: '13px', fontWeight: 700,
              cursor: isOfficer && !isOutOfScope && noteLength >= 10 ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: isOfficer && !isOutOfScope && noteLength >= 10 ? 'var(--shadow-emerald)' : 'none'
            }}
          >
            <span>✔</span>
            <span>Sanction Facility (Officer Human Approval)</span>
          </button>

          <button
            type="button"
            disabled={!isOfficer || isOutOfScope || noteLength < 10}
            onClick={() => handleSubmit('Referred to Committee')}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--warn-border)',
              background: isOfficer && !isOutOfScope && noteLength >= 10 ? 'var(--warn-bg)' : 'transparent',
              color: 'var(--warn-ink)', fontSize: '13px', fontWeight: 600,
              cursor: isOfficer && !isOutOfScope && noteLength >= 10 ? 'pointer' : 'not-allowed'
            }}
          >
            ⚖️ Refer to Credit Committee
          </button>

          <button
            type="button"
            disabled={!isOfficer || noteLength < 10}
            onClick={() => handleSubmit('Rejected')}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--error-border)',
              background: isOfficer && noteLength >= 10 ? 'var(--error-bg)' : 'transparent',
              color: 'var(--error-ink)', fontSize: '13px', fontWeight: 600,
              cursor: isOfficer && noteLength >= 10 ? 'pointer' : 'not-allowed'
            }}
          >
            ✕ Reject Application
          </button>
        </div>
      </div>

      {/* Formal Sanction Letter Modal */}
      {showSanctionLetter && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)',
          display: 'grid', placeItems: 'center', zIndex: 500, padding: '20px', backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: '16px', maxWidth: '640px', width: '100%', padding: '28px',
            boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--line)', maxHeight: '85vh', overflowY: 'auto'
          }}>
            {/* NBFC Letterhead */}
            <div style={{ borderBottom: '2px solid #1e56a0', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e56a0' }}>KESTREL FINANCE LIMITED</h3>
                <span style={{ fontSize: '11px', color: 'var(--mute)' }}>RBI Reg. No: B-14.02941 • NBFC-Middle Layer • Bandra Kurla Complex, Mumbai</span>
              </div>
              <button type="button" onClick={() => setShowSanctionLetter(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--mute)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--mute)' }}>
              <div>Ref: <strong>{sanctionLetterRef || 'KF/SME/2026/0842'}</strong></div>
              <div>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>

            <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--ink)' }}>
              <strong>To:</strong><br />
              The Board of Directors / Authorized Signatory<br />
              <strong>{application.applicant}</strong><br />
              Sector: {application.sector}<br /><br />
              <strong>Sub: In-principle Sanction of SME Working Capital Loan Facility</strong><br /><br />
              We are pleased to inform you that Kestrel Finance Limited has sanctioned your credit facility under the following approved terms:
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', border: '1px solid var(--line)' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, background: 'var(--card-subtle)', width: '40%' }}>Sanctioned Limit:</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>₹ {application.amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, background: 'var(--card-subtle)' }}>Facility Type:</td>
                  <td style={{ padding: '8px 12px' }}>SME Secured Working Capital Term Loan</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, background: 'var(--card-subtle)' }}>Rate of Interest:</td>
                  <td style={{ padding: '8px 12px' }}>14.25% p.a. floating</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, background: 'var(--card-subtle)' }}>Tenor:</td>
                  <td style={{ padding: '8px 12px' }}>24 Months</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, background: 'var(--card-subtle)' }}>Sanctioning Officer:</td>
                  <td style={{ padding: '8px 12px' }}>Arjun Iyer (Senior Credit Officer)</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  window.print?.();
                }}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)',
                  cursor: 'pointer', fontSize: '12.5px', fontWeight: 600
                }}
              >
                🖨 Print Sanction Memo
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('success', 'Sanction Letter Exported', 'Downloaded signed sanction memo PDF.');
                  setShowSanctionLetter(false);
                }}
                style={{
                  padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--blue)',
                  color: '#fff', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700
                }}
              >
                📥 Download Formal Sanction Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
