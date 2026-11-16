import React, { useState } from 'react';
import type { AuthUser } from '../../domain/types';
import { DEMO_USERS, AuthService } from '../../services/auth';
import { useToast } from '../../components/ui/Toast';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('vikram.rao@kestrelfinance.in');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'rm' | 'analyst' | 'officer' | 'owner' | 'auditor'>('rm');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = AuthService.login(email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        showToast('success', 'Authentication Successful', `Signed in as ${res.user.name} (${res.user.role})`);
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please select an authorized demo user.');
        showToast('error', 'Authentication Failed', 'Please verify email address.');
      }
    }, 400);
  };

  const handleQuickLogin = (roleKey: 'rm' | 'analyst' | 'officer' | 'owner' | 'auditor') => {
    setSelectedRoleTab(roleKey);
    const user = DEMO_USERS[roleKey];
    setEmail(user.email);
    setPassword('Password@123');

    setIsLoading(true);
    setTimeout(() => {
      const loggedUser = AuthService.loginAsRole(roleKey);
      setIsLoading(false);
      showToast('success', 'Logged In as ' + loggedUser.role, `Welcome back, ${loggedUser.name}!`);
      onLoginSuccess(loggedUser);
    }, 300);
  };

  const activePersonaDetail = DEMO_USERS[selectedRoleTab];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b1727 0%, #0f2744 50%, #162a45 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px 16px',
      color: '#e2e8f0',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Top Brand Logo & Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px', maxWidth: '640px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #173d74 0%, #2563eb 100%)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: '22px',
            boxShadow: '0 8px 20px rgba(37,99,235,0.4)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            K
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              Kestrel Finance
            </h1>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
              SME Credit Document Workflow &amp; Governance Portal
            </span>
          </div>
        </div>

        {/* Security & Regulatory Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(30,58,138,0.5)', color: '#93c5fd', border: '1px solid rgba(147,197,253,0.3)' }}>
            🏛️ RBI Regulated NBFC (Middle Layer)
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(6,78,59,0.5)', color: '#6ee7b7', border: '1px solid rgba(110,231,183,0.3)' }}>
            📍 GCP asia-south1 (Mumbai Sovereignty)
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(120,53,15,0.5)', color: '#fcd34d', border: '1px solid rgba(252,211,77,0.3)' }}>
            🔒 Zero Data Retention (ZDR)
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(76,29,149,0.5)', color: '#c4b5fd', border: '1px solid rgba(196,181,253,0.3)' }}>
            🧪 100% Synthetic Data (Zero PII)
          </span>
        </div>
      </div>

      {/* Main Dual-Column Auth & Permissions Grid */}
      <div style={{
        maxWidth: '1120px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* Left Column: Sign-in Form & 1-Click Fast Logins */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Portal Authentication</h2>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Secure Sign-In for Lending Officers &amp; Staff</span>
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#22c55e20', color: '#4ade80', border: '1px solid #22c55e40' }}>
                LIVE SECURE
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px',
                color: '#fca5a5', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Fast 1-Click Quick Sign-In Buttons */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ 1-Click Reviewer Demo Login (Select Persona)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('rm')}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e40af', background: 'rgba(30, 64, 175, 0.25)',
                    color: '#93c5fd', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💼</span>
                    <span><strong>Vikram Rao</strong> (Relationship Manager)</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#60a5fa' }}>Intake &amp; S1 →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('analyst')}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: '1px solid #6b21a8', background: 'rgba(107, 33, 168, 0.25)',
                    color: '#d8b4fe', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔍</span>
                    <span><strong>Meena Pillai</strong> (Credit Analyst)</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#c084fc' }}>OCR &amp; Spreading →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('officer')}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: '1px solid #065f46', background: 'rgba(6, 95, 70, 0.25)',
                    color: '#6ee7b7', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚖️</span>
                    <span><strong>Arjun Iyer</strong> (Chief Risk Officer)</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#34d399' }}>Sanction Decision →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('owner')}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: '1px solid #9a3412', background: 'rgba(154, 52, 18, 0.25)',
                    color: '#fdba74', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚡</span>
                    <span><strong>Devina Sen</strong> (Platform &amp; AI Owner)</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#fb923c' }}>LLM Cost Telemetry →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('auditor')}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: '1px solid #475569', background: 'rgba(71, 85, 105, 0.25)',
                    color: '#cbd5e1', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📜</span>
                    <span><strong>Pooja Deshmukh</strong> (Regulatory Auditor)</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Audit Trail →</span>
                </button>
              </div>
            </div>

            {/* Custom Credentials Form */}
            <form onSubmit={handleCustomLogin}>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginBottom: '14px' }}>
                <label htmlFor="login-email" style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Work Email Address
                </label>
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. vikram.rao@kestrelfinance.in"
                  required
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(15, 23, 42, 0.6)', color: '#fff', fontSize: '13px', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label htmlFor="login-password" style={{ fontSize: '11.5px', fontWeight: 600, color: '#94a3b8' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(15, 23, 42, 0.6)', color: '#fff', fontSize: '13px', boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', padding: '11px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  color: '#fff', fontSize: '13.5px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'all 0.15s ease'
                }}
              >
                {isLoading ? 'Verifying Credentials...' : 'Sign In with Email'}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
            Protected by Kestrel Enterprise IAM • Session Token: <code>sess-jwt-sec-2026</code>
          </div>
        </div>

        {/* Right Column: Complete "What Users & Everyone Can Do" Matrix */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Role Powers &amp; Permissions Matrix
              </h2>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#cbd5e1' }}>
                RBAC GUIDE
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px', marginBottom: '16px' }}>
              Kestrel enforces strict separation of duties under RBI NBFC guidelines. Select a role tab to view exact capabilities and regulatory guardrails:
            </p>

            {/* Persona Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(30, 41, 59, 0.7)', padding: '4px', borderRadius: '10px', marginBottom: '18px', overflowX: 'auto' }}>
              {(['rm', 'analyst', 'officer', 'owner', 'auditor'] as const).map(key => {
                const u = DEMO_USERS[key];
                const isActive = selectedRoleTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedRoleTab(key)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: isActive ? '#60a5fa' : '#94a3b8',
                      fontSize: '11.5px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent'
                    }}
                  >
                    {u.role.replace('Relationship Manager', 'RM').replace('Credit Officer', 'Officer')}
                  </button>
                );
              })}
            </div>

            {/* Persona Profile Header */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: activePersonaDetail.role === 'Relationship Manager' ? '#1e40af' : activePersonaDetail.role === 'Analyst' ? '#7e22ce' : activePersonaDetail.role === 'Credit Officer' ? '#047857' : activePersonaDetail.role === 'Owner' ? '#c2410c' : '#475569',
                  color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '14px'
                }}>
                  {activePersonaDetail.initials}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                    {activePersonaDetail.name} ({activePersonaDetail.role})
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    {activePersonaDetail.department} • Emp ID: <code>{activePersonaDetail.employeeId}</code>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickLogin(selectedRoleTab)}
                style={{
                  padding: '5px 12px', borderRadius: '6px', border: '1px solid #3b82f6',
                  background: '#2563eb', color: '#fff', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Sign In as This User
              </button>
            </div>

            {/* What this user CAN DO (Allowed Powers) */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span>✔</span>
                <span>WHAT THIS USER CAN DO (Authorized Permissions):</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activePersonaDetail.allowedActions.map((act, i) => (
                  <div key={i} style={{
                    fontSize: '12px', color: '#e2e8f0', background: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.2)', padding: '7px 10px', borderRadius: '6px',
                    display: 'flex', alignItems: 'flex-start', gap: '8px'
                  }}>
                    <span style={{ color: '#4ade80', fontWeight: 700 }}>•</span>
                    <span style={{ lineHeight: 1.4 }}>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What this user CANNOT DO (Strict Guardrails) */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span>⛔</span>
                <span>WHAT THIS USER CANNOT DO (Enforced Guardrails):</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activePersonaDetail.restrictedActions.map((res, i) => (
                  <div key={i} style={{
                    fontSize: '12px', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)', padding: '7px 10px', borderRadius: '6px',
                    display: 'flex', alignItems: 'flex-start', gap: '8px'
                  }}>
                    <span style={{ color: '#f87171', fontWeight: 700 }}>✕</span>
                    <span style={{ lineHeight: 1.4 }}>{res}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#94a3b8' }}>
            ⚖️ <strong>Regulatory Note:</strong> Credit approvals are never delegated to probabilistic AI models. Only designated human Credit Officers sign sanction memos.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '11.5px', color: '#64748b' }}>
        Kestrel Finance Prototype • Enterprise IAM Authentication • Hosted in GCP asia-south1 (Mumbai) • Zero Data Retention Verified
      </div>
    </div>
  );
};
