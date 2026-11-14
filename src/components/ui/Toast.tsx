import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { bg: 'var(--ok-bg)', ink: 'var(--ok-ink)', border: 'var(--ok-border)', icon: '✔' };
      case 'error':
        return { bg: 'var(--error-bg)', ink: 'var(--error-ink)', border: 'var(--error-border)', icon: '✕' };
      case 'warning':
        return { bg: 'var(--warn-bg)', ink: 'var(--warn-ink)', border: 'var(--warn-border)', icon: '⚠️' };
      case 'info':
      default:
        return { bg: 'var(--blue-bg)', ink: 'var(--blue)', border: 'var(--blue-border)', icon: 'ℹ' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px'
      }}>
        {toasts.map(toast => {
          const colors = getColors(toast.type);
          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              style={{
                background: colors.bg,
                color: colors.ink,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{colors.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{toast.title}</div>
                {toast.message && (
                  <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>{toast.message}</div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
                style={{ background: 'none', border: 'none', color: 'inherit', opacity: 0.6, cursor: 'pointer', fontSize: '14px', padding: 0 }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
