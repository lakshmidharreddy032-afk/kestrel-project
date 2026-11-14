import React from 'react';

interface MockBannerProps {
  message?: string;
  type?: 'warning' | 'info';
}

export const MockBanner: React.FC<MockBannerProps> = ({
  message = "Mock extraction. Not a live model. No external AI APIs called. All figures must be confirmed by an analyst.",
  type = 'warning'
}) => {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '13px',
        fontWeight: 600,
        background: type === 'warning' ? 'var(--warn-bg)' : 'var(--blue-bg)',
        color: type === 'warning' ? 'var(--warn-ink)' : 'var(--blue)',
        border: `1px solid ${type === 'warning' ? 'var(--warn-border)' : 'var(--blue-border)'}`
      }}
    >
      <span style={{ fontSize: '16px' }}>⚠️</span>
      <span>{message}</span>
    </div>
  );
};
