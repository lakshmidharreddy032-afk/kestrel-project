import React from 'react';
import sheetData from '../../data/sheet.json';

export const ScorecardPanel: React.FC = () => {
  const { scorecard } = sheetData;

  return (
    <div style={{
      background: 'var(--card-subtle)', borderRadius: '12px', border: '1px solid var(--line)', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Legacy Scorecard: Existing, Unchanged</h3>
          <span style={{ fontSize: '11.5px', color: 'var(--mute)' }}>Last calibrated: {scorecard.lastRecalibrated}</span>
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700, background: 'var(--blue-bg)', color: 'var(--blue)'
        }}>
          {scorecard.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '4px' }}>
        <div style={{ background: 'var(--card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Placeholder Score</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--mono)' }}>
            {scorecard.score} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--mute)' }}>/ {scorecard.maxScore}</span>
          </div>
        </div>

        <div style={{ background: 'var(--card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Rating Tier</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>{scorecard.tier}</div>
        </div>

        <div style={{ background: 'var(--card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Risk Category</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-secondary)' }}>{scorecard.riskBand}</div>
        </div>
      </div>

      <div style={{
        fontSize: '11.5px', color: 'var(--mute)', background: 'var(--card)', padding: '10px', borderRadius: '6px',
        border: '1px dashed var(--line2)', lineHeight: 1.4
      }}>
        ℹ️ {scorecard.disclaimer}
      </div>
    </div>
  );
};
