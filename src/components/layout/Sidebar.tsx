import React from 'react';

export interface NavScreenItem {
  id: string;
  name: string;
  shortcut: string;
  icon: string;
}

export const SCREENS: NavScreenItem[] = [
  { id: 'applications', name: 'Applications Queue', shortcut: '1', icon: '📋' },
  { id: 'checklist', name: 'Day-One Checklist (S1)', shortcut: '2', icon: '📑' },
  { id: 'gapCheck', name: 'Diagnostic Checks (S3)', shortcut: '3', icon: '🔍' },
  { id: 'extraction', name: 'Extraction Split View (S4)', shortcut: '4', icon: '📄' },
  { id: 'analyst', name: 'Analyst Check Gate', shortcut: '5', icon: '✍️' },
  { id: 'sheet', name: 'Spreading Sheet & Scorecard', shortcut: '6', icon: '📊' },
  { id: 'signOff', name: 'Credit Officer Sign-off', shortcut: '7', icon: '⚖️' },
  { id: 'auditLog', name: 'Immutable Audit Log', shortcut: '8', icon: '📜' },
  { id: 'dashboard', name: 'Metrics & NPA Guardrail', shortcut: '9', icon: '📈' }
];

interface SidebarProps {
  currentScreen: string;
  onSelectScreen: (screenId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onSelectScreen }) => {
  return (
    <nav aria-label="Main Navigation" style={{
      display: 'flex', gap: '6px', overflowX: 'auto', padding: '10px 24px', background: 'var(--card)', borderBottom: '1px solid var(--line)'
    }}>
      {SCREENS.map(item => {
        const isActive = currentScreen === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectScreen(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: isActive ? '1px solid var(--blue)' : '1px solid transparent',
              background: isActive ? 'var(--blue-bg)' : 'transparent',
              color: isActive ? 'var(--blue)' : 'var(--ink-secondary)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
            <span style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '4px',
              background: isActive ? 'var(--blue)' : 'var(--line)',
              color: isActive ? '#fff' : 'var(--mute)',
              fontFamily: 'var(--mono)',
              marginLeft: '4px'
            }}>
              [{item.shortcut}]
            </span>
          </button>
        );
      })}
    </nav>
  );
};
