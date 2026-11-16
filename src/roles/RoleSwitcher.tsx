import React from 'react';
import type { UserRole } from '../domain/types';
import { ROLES } from './roles';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  const activeConfig = ROLES[currentRole];

  return (
    <div className="role-switcher-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className={`persona-avatar ${activeConfig.avatarClass}`} style={{
          width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center',
          fontWeight: 700, fontSize: '12px', color: '#fff',
          background: currentRole === 'Relationship Manager' ? '#1e56a0' : currentRole === 'Analyst' ? '#5534b8' : currentRole === 'Credit Officer' ? '#0e6245' : '#ea580c',
          boxShadow: currentRole === 'Owner' ? '0 0 10px rgba(234, 88, 12, 0.4)' : 'none'
        }}>
          {activeConfig.initials}
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{activeConfig.name}</span>
            {currentRole === 'Owner' && (
              <span style={{ fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: '#ffedd5', color: '#ea580c', border: '1px solid #fdba74' }}>
                AI OPS
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--mute)' }}>{activeConfig.title}</div>
        </div>
      </div>

      <div className="role-btn-group" role="group" aria-label="Select User Role" style={{
        display: 'inline-flex', background: 'var(--card-subtle)', padding: '3px', borderRadius: '8px', border: '1px solid var(--line)'
      }}>
        {(Object.keys(ROLES) as UserRole[]).map(role => (
          <button
            key={role}
            type="button"
            className={`role-btn ${currentRole === role ? 'active' : ''}`}
            onClick={() => onRoleChange(role)}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: currentRole === role ? 700 : 500,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: currentRole === role ? (role === 'Owner' ? '#ea580c' : 'var(--card)') : 'transparent',
              color: currentRole === role ? (role === 'Owner' ? '#fff' : 'var(--blue)') : 'var(--mute)',
              boxShadow: currentRole === role ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {role === 'Relationship Manager'
              ? 'RM (Vikram)'
              : role === 'Analyst'
              ? 'Analyst (Meena)'
              : role === 'Credit Officer'
              ? 'Credit Officer (Arjun)'
              : '⚡ Owner (Devina)'}
          </button>
        ))}
      </div>
    </div>
  );
};
