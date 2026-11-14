import React from 'react';

interface RequestPreviewProps {
  messageText: string;
  onClose: () => void;
  onSendSimulation: () => void;
  canSend: boolean;
}

export const RequestPreview: React.FC<RequestPreviewProps> = ({
  messageText,
  onClose,
  onSendSimulation,
  canSend
}) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)',
      display: 'grid', placeItems: 'center', zIndex: 300, padding: '20px'
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: '16px', maxWidth: '640px', width: '100%', padding: '24px',
        boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Consolidated Document Request (S1)</h3>
            <p style={{ fontSize: '12px', color: 'var(--mute)' }}>Preview only. No live external email or SMS will be sent.</p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        <textarea
          readOnly
          value={messageText}
          rows={12}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)',
            background: 'var(--card-subtle)', fontFamily: 'var(--sans)', fontSize: '13px', lineHeight: 1.5, resize: 'none'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSend}
            onClick={onSendSimulation}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none', background: canSend ? 'var(--blue)' : 'var(--line)',
              color: '#ffffff', cursor: canSend ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 700
            }}
          >
            Simulate Generate Request (S1)
          </button>
        </div>
      </div>
    </div>
  );
};
