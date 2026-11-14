import React from 'react';
import type { SMEApplication } from '../../domain/types';

interface WorkflowStepperProps {
  currentScreen: string;
  onSelectScreen: (screenId: string) => void;
  activeApp?: SMEApplication;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentScreen,
  onSelectScreen,
  activeApp
}) => {
  const steps = [
    { id: 'applications', label: '1. Intake Queue', tag: 'Intake' },
    { id: 'checklist', label: '2. Day-1 Checklist', tag: 'S1' },
    { id: 'gapCheck', label: '3. Gap Diagnostics', tag: 'S3' },
    { id: 'extraction', label: '4. OCR Split-View', tag: 'S4' },
    { id: 'sheet', label: '5. Spreading & Ratios', tag: 'S5' },
    { id: 'signOff', label: '6. Credit Sanction', tag: 'S6' }
  ];

  const currentIdx = steps.findIndex(s => s.id === currentScreen);

  return (
    <div style={{
      background: 'var(--card)', borderBottom: '1px solid var(--line)', padding: '10px 24px'
    }}>
      <div style={{
        maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
      }}>
        {/* Step Progression Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
          {activeApp && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mute)', marginRight: '6px' }}>
              [{activeApp.id}]
            </span>
          )}
          {steps.map((step, idx) => {
            const isActive = currentScreen === step.id;
            const isCompleted = currentIdx > idx;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => onSelectScreen(step.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: isActive ? '1px solid var(--blue)' : '1px solid transparent',
                    background: isActive ? 'var(--blue-bg)' : isCompleted ? 'var(--card-subtle)' : 'transparent',
                    color: isActive ? 'var(--blue)' : isCompleted ? 'var(--ink)' : 'var(--mute)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isActive ? 'var(--blue)' : isCompleted ? 'var(--ok-ink)' : 'var(--line)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '10px',
                    fontWeight: 700
                  }}>
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  <span>{step.label}</span>
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: isActive ? 'rgba(30, 86, 160, 0.15)' : 'var(--line)',
                    color: isActive ? 'var(--blue)' : 'var(--mute)'
                  }}>
                    {step.tag}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <span style={{ color: 'var(--line2)', fontSize: '12px', margin: '0 2px' }}>➔</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Quick Nav Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onSelectScreen('auditLog')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: currentScreen === 'auditLog' ? '1px solid var(--blue)' : '1px solid var(--line)',
              background: currentScreen === 'auditLog' ? 'var(--blue-bg)' : 'transparent',
              color: currentScreen === 'auditLog' ? 'var(--blue)' : 'var(--mute)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📜 Audit Trail
          </button>
          <button
            type="button"
            onClick={() => onSelectScreen('dashboard')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: currentScreen === 'dashboard' ? '1px solid var(--blue)' : '1px solid var(--line)',
              background: currentScreen === 'dashboard' ? 'var(--blue-bg)' : 'transparent',
              color: currentScreen === 'dashboard' ? 'var(--blue)' : 'var(--mute)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📊 Executive KPIs
          </button>
        </div>
      </div>
    </div>
  );
};
