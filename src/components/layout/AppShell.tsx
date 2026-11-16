import React, { useState } from 'react';
import type { UserRole, SMEApplication, AuthUser } from '../../domain/types';
import { RoleSwitcher } from '../../roles/RoleSwitcher';
import { Sidebar } from './Sidebar';
import { WorkflowStepper } from './WorkflowStepper';
import { DEMO_USERS } from '../../services/auth';

interface AppShellProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentScreen: string;
  onScreenChange: (screen: string) => void;
  applications: SMEApplication[];
  activeCaseId: string;
  onCaseChange: (caseId: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentRole,
  onRoleChange,
  currentScreen,
  onScreenChange,
  applications,
  activeCaseId,
  onCaseChange,
  theme,
  onToggleTheme,
  currentUser,
  onLogout,
  children
}) => {
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const activeApp = applications.find(a => a.id === activeCaseId);
  const user = currentUser || DEMO_USERS['rm'];

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Compliance & Tenancy Banner */}
      <div style={{
        background: 'var(--card-subtle)',
        borderBottom: '1px solid var(--line)',
        padding: '6px 24px',
        fontSize: '11.5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: 'var(--ok-bg)',
            color: 'var(--ok-ink)',
            border: '1px solid var(--ok-border)',
            padding: '1px 7px',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '10.5px'
          }}>
            100% SYNTHETIC DATA
          </span>
          <span style={{ color: 'var(--ink)' }}>
            Strictly synthetic mock data (zero real customer PII; simulated PANs, GSTINs, and bank ledgers per RBI directions).
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--mute)', fontSize: '11px' }}>
          <span>📍 Model Host: <strong>GCP asia-south1 (Mumbai)</strong></span>
          <span>🔒 Tenancy: <strong>Single-Tenant Boundary • Zero Data Retention</strong></span>
          {currentRole === 'Owner' ? (
            <span style={{ color: '#ea580c', fontWeight: 700 }}>⚡ Owner Console Active (LLM Observability &amp; Costs)</span>
          ) : (
            <span>👤 Governance: <strong>Human Officer Sign-Off Required</strong></span>
          )}
        </div>
      </div>

      {/* Top Header */}
      <header style={{
        background: 'var(--card)', borderBottom: '1px solid var(--line)', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Brand Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #173d74 0%, #1e56a0 100%)',
              color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '18px', boxShadow: '0 4px 10px rgba(30,86,160,0.3)'
            }}>
              K
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink)' }}>Kestrel Finance</span>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-border)'
                }}>
                  Prototype: mock data
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--mute)' }}>
                SME Credit Document Workflow • Slice 1 (S1, S3, S4)
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />

          {/* Controls: Active Case, Theme */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="select-case-top" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mute)' }}>Case:</label>
              <select
                id="select-case-top"
                value={activeCaseId}
                onChange={e => onCaseChange(e.target.value)}
                style={{
                  padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '12.5px', fontWeight: 600
                }}
              >
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.id}: {app.applicant} (₹{(app.amount / 100000).toFixed(1)}L) {app.isOutOfScope ? '[OUT OF SCOPE]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              title="Toggle Light / Dark mode"
              style={{
                background: 'var(--card-subtle)', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
              }}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>

            {/* User Permissions & Role Scope Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowPermissionsModal(true)}
              title="View what your active role can & cannot do"
              style={{
                background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', color: 'var(--blue)', padding: '6px 12px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <span>🛡️</span>
              <span>Role Powers</span>
            </button>

            {/* Sign Out Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out of active session"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: 'var(--error-ink)',
                  padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Navigation Bar */}
      <Sidebar currentScreen={currentScreen} onSelectScreen={onScreenChange} />

      {/* Interactive Workflow Progression Stepper */}
      <WorkflowStepper currentScreen={currentScreen} onSelectScreen={onScreenChange} activeApp={activeApp} />

      {/* Out of Scope Hard Block Banner (Rule 1) */}
      {activeApp?.isOutOfScope && (
        <div style={{
          background: 'linear-gradient(90deg, #fef2f2 0%, #fee2e2 100%)',
          borderBottom: '2px solid #ef4444',
          padding: '12px 24px',
          color: '#991b1b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '13.5px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⛔</span>
            <span>Out of scope: Ticket size exceeds ₹25 Lakh ceiling (Requested: ₹{(activeApp.amount / 100000).toFixed(1)} Lakh)</span>
          </div>
          <span style={{
            background: '#ef4444',
            color: '#fff',
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Approval Blocked
          </span>
        </div>
      )}

      {/* Active Case Context Banner */}
      {activeApp && (
        <div style={{ background: 'var(--blue-light)', borderBottom: '1px solid var(--blue-border)', padding: '8px 24px' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <div>
              <strong>Active File:</strong> {activeApp.id} — {activeApp.applicant} ({activeApp.sector}) • Amount: <strong>₹{activeApp.amount.toLocaleString('en-IN')}</strong> • RM: {activeApp.assignedRM}
            </div>
            <div>
              <span style={{
                padding: '2px 8px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700,
                background: activeApp.isOutOfScope ? 'var(--error-bg)' : activeApp.status === 'Approved' ? 'var(--ok-bg)' : 'var(--blue-bg)',
                color: activeApp.isOutOfScope ? 'var(--error-ink)' : activeApp.status === 'Approved' ? 'var(--ok-ink)' : 'var(--blue)'
              }}>
                {activeApp.isOutOfScope ? '✕ Out of Scope (≥₹25L)' : activeApp.status === 'Approved' ? 'Officer Approved (Manual Sign-off)' : activeApp.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '24px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--card)', borderTop: '1px solid var(--line)', padding: '16px 24px', fontSize: '12px', color: 'var(--mute)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div><strong>Kestrel Finance</strong> • GCP asia-south1 (Mumbai) Single-Tenant Boundary • Zero Data Retention • 100% Synthetic Data (Zero PII)</div>
          <div>Hard Governance: Model assists extraction only; a human analyst checks every figure & a human Credit Officer signs every credit sanction.</div>
        </div>
      </footer>

      {/* Role Powers & Permissions Clarity Modal */}
      {showPermissionsModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)',
          display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden',
            border: '1px solid var(--line)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Role Powers &amp; Access Scope</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                    ACTIVE SESSION
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--mute)' }}>
                  Detailed breakdown of what <strong>{user.name}</strong> can and cannot do in this session
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--mute)' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* User Profile Card */}
              <div style={{
                background: 'var(--card-subtle)', border: '1px solid var(--line)', borderRadius: '12px', padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: user.role === 'Relationship Manager' ? '#1e40af' : user.role === 'Analyst' ? '#7e22ce' : user.role === 'Credit Officer' ? '#047857' : user.role === 'Owner' ? '#c2410c' : '#475569',
                    color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '16px'
                  }}>
                    {user.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800 }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--mute)' }}>{user.title} • {user.department}</div>
                    <div style={{ fontSize: '11px', color: 'var(--mute)', fontFamily: 'var(--mono)', marginTop: '2px' }}>
                      Email: {user.email} • Emp ID: {user.employeeId}
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700,
                  background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-border)'
                }}>
                  {user.role}
                </span>
              </div>

              {/* What this user CAN DO */}
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ok-ink)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span>✔</span>
                  <span>WHAT YOU CAN DO IN THIS ROLE (Authorized Powers):</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {user.allowedActions.map((act, i) => (
                    <div key={i} style={{
                      fontSize: '12px', color: 'var(--ink)', background: 'var(--ok-bg)',
                      border: '1px solid var(--ok-border)', padding: '8px 12px', borderRadius: '6px',
                      display: 'flex', alignItems: 'flex-start', gap: '8px'
                    }}>
                      <span style={{ color: 'var(--ok-ink)', fontWeight: 700 }}>•</span>
                      <span style={{ lineHeight: 1.4 }}>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What this user CANNOT DO */}
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--error-ink)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span>⛔</span>
                  <span>WHAT YOU CANNOT DO IN THIS ROLE (Policy Guardrails):</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {user.restrictedActions.map((res, i) => (
                    <div key={i} style={{
                      fontSize: '12px', color: 'var(--error-ink)', background: 'var(--error-bg)',
                      border: '1px solid var(--error-border)', padding: '8px 12px', borderRadius: '6px',
                      display: 'flex', alignItems: 'flex-start', gap: '8px'
                    }}>
                      <span style={{ color: 'var(--error-ink)', fontWeight: 700 }}>✕</span>
                      <span style={{ lineHeight: 1.4 }}>{res}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Token Info */}
              <div style={{ fontSize: '11px', color: 'var(--mute)', background: 'var(--card-subtle)', padding: '8px 12px', borderRadius: '6px', fontFamily: 'var(--mono)' }}>
                🔒 Active Session Token: <code>{user.sessionToken}</code> • Last Authenticated: {user.lastLogin}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', background: 'var(--card-subtle)' }}>
              <button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                style={{ padding: '7px 20px', borderRadius: '8px', border: 'none', background: 'var(--blue)', color: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
