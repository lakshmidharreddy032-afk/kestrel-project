import React, { useState } from 'react';

interface RequestPreviewProps {
  messageText: string;
  onClose: () => void;
  onSendSimulation: () => void;
  canSend: boolean;
  applicantName?: string;
  applicationId?: string;
}

export const RequestPreview: React.FC<RequestPreviewProps> = ({
  messageText,
  onClose,
  onSendSimulation,
  canSend,
  applicantName = 'Borrower Entity',
  applicationId = 'APP-1001'
}) => {
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onSendSimulation();
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)',
      display: 'grid', placeItems: 'center', zIndex: 300, padding: '20px', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: '16px', maxWidth: '680px', width: '100%', padding: '24px',
        boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--line)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Consolidated Document Request (S1)</h3>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                background: 'var(--blue-bg)', color: 'var(--blue)'
              }}>
                Single-Chase Protocol
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--mute)', marginTop: '2px' }}>
              48-hour deficiency request dispatched to borrower contact point.
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--mute)' }}>✕</button>
        </div>

        {/* Channel Switcher */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
          <button
            type="button"
            onClick={() => setChannel('whatsapp')}
            style={{
              padding: '6px 14px', borderRadius: '8px', border: 'none',
              background: channel === 'whatsapp' ? '#25d366' : 'var(--card-subtle)',
              color: channel === 'whatsapp' ? '#fff' : 'var(--ink)',
              fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <span>💬</span>
            <span>WhatsApp Business API</span>
          </button>
          <button
            type="button"
            onClick={() => setChannel('email')}
            style={{
              padding: '6px 14px', borderRadius: '8px', border: 'none',
              background: channel === 'email' ? 'var(--blue)' : 'var(--card-subtle)',
              color: channel === 'email' ? '#fff' : 'var(--ink)',
              fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <span>✉️</span>
            <span>Corporate Email (NBFC Mailer)</span>
          </button>
        </div>

        {/* Interactive Channel Preview Surface */}
        {channel === 'whatsapp' ? (
          <div style={{
            background: '#e5ddd5', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px',
            maxHeight: '320px', overflowY: 'auto'
          }}>
            <div style={{ alignSelf: 'center', background: '#d1e7dd', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', color: '#0f5132', fontWeight: 600 }}>
              🔒 Messages are end-to-end encrypted • Kestrel Finance Verified Business
            </div>
            <div style={{
              background: '#ffffff', borderRadius: '8px 8px 8px 0', padding: '12px 14px', maxWidth: '85%', alignSelf: 'flex-start',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)', fontSize: '12.5px', color: '#111827', lineHeight: 1.5, whiteSpace: 'pre-line'
            }}>
              <strong>Kestrel Finance SME Operations</strong><br />
              Dear {applicantName},<br /><br />
              {messageText}
              <div style={{ textAlign: 'right', fontSize: '10px', color: '#6b7280', marginTop: '6px' }}>
                11:42 AM • Delivered ✓✓
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--card-subtle)', borderRadius: '12px', padding: '16px', border: '1px solid var(--line)',
            maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px'
          }}>
            <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
              <div><strong>From:</strong> underwriting-ops@kestrelsme.in (Kestrel Finance SME Credit Desk)</div>
              <div><strong>To:</strong> contact@{applicantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</div>
              <div><strong>Subject:</strong> Action Required: Deficiency Checklist for Facility Ref {applicationId}</div>
            </div>
            <div style={{ whiteSpace: 'pre-line', lineHeight: 1.5, padding: '8px 0' }}>
              {messageText}
            </div>
            <div style={{ background: '#fef3c7', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fde68a', color: '#92400e', fontSize: '11.5px', fontWeight: 600 }}>
              ⏱ SLA Notice: Please upload the missing items within 48 hours to prevent pipeline de-prioritization.
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--ink)'
            }}
          >
            {copied ? '✔ Copied to Clipboard!' : '📋 Copy Text'}
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSend || isSending}
              onClick={handleSend}
              style={{
                padding: '8px 22px', borderRadius: '8px', border: 'none',
                background: canSend ? (channel === 'whatsapp' ? '#25d366' : 'var(--blue)') : 'var(--line)',
                color: '#ffffff', cursor: canSend ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s ease'
              }}
            >
              <span>{isSending ? '⏳ Dispatching...' : channel === 'whatsapp' ? '💬 Dispatch via WhatsApp' : '✉️ Dispatch via Email'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
