import React from 'react';
import sheetData from '../../data/sheet.json';

export const ScorecardPanel: React.FC = () => {
  const { scorecard } = sheetData;

  const fiveCPillars = [
    { name: 'Character (Promoter KYC, CIBIL 740, Banking Conduct)', score: 18, max: 20 },
    { name: 'Capacity (DSCR 1.82x, Monthly Cash Accruals)', score: 22, max: 25 },
    { name: 'Capital (Net Worth ₹68L, Debt/Equity 0.82x)', score: 14, max: 20 },
    { name: 'Collateral (Hypothecation of Book Debts & Stock)', score: 10, max: 15 },
    { name: 'Conditions (Industrial Sector, Stable Order Book)', score: 4, max: 10 }
  ];

  return (
    <div style={{
      background: 'var(--card-subtle)', borderRadius: '12px', border: '1px solid var(--line)', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: 'var(--shadow-xs)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800 }}>5-C Risk Scorecard (Fixed Baseline)</h3>
          <span style={{ fontSize: '11.5px', color: 'var(--mute)' }}>Last calibrated: {scorecard.lastRecalibrated}</span>
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700, background: 'var(--blue-bg)', color: 'var(--blue)'
        }}>
          {scorecard.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        <div style={{ background: 'var(--card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Composite Score</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--mono)' }}>
            {scorecard.score} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--mute)' }}>/ {scorecard.maxScore}</span>
          </div>
        </div>

        <div style={{ background: 'var(--card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Rating Tier</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>{scorecard.tier}</div>
          <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Tier B - Moderate Risk</div>
        </div>

        <div style={{ background: 'var(--card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Risk Category</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink-secondary)', marginTop: '4px' }}>{scorecard.riskBand}</div>
        </div>
      </div>

      {/* 5-C Pillar Breakdown */}
      <div style={{ background: 'var(--card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>5-C Credit Scoring Dimensions:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {fiveCPillars.map(p => (
            <div key={p.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span style={{ color: 'var(--ink)' }}>{p.name}</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{p.score}/{p.max}</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--line)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${(p.score / p.max) * 100}%`, height: '100%', background: 'var(--blue)', borderRadius: '9999px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Governance Notice */}
      <div style={{
        fontSize: '11.5px', color: 'var(--ink-secondary)', background: 'var(--card)', padding: '12px', borderRadius: '8px',
        border: '1px solid var(--blue-border)', lineHeight: 1.45
      }}>
        🛡 <strong>Governance Notice:</strong> Scorecard model is existing and unchanged. Extraction tools do not alter risk scoring. All underwriting decisions remain strictly human-driven.
      </div>
    </div>
  );
};
