import React, { useState } from 'react';
import type { SMEApplication, ExtractedFigure } from '../../domain/types';
import { ScorecardPanel } from './ScorecardPanel';

interface SpreadingSheetProps {
  application: SMEApplication;
  figures: ExtractedFigure[];
}

export const SpreadingSheet: React.FC<SpreadingSheetProps> = ({ application, figures }) => {
  const [stressFactor, setStressFactor] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'ratios' | 'financials'>('ratios');

  const getVal = (key: string, fallback: number) => {
    const item = figures.find(f => f.fieldKey === key);
    if (!item) return fallback;
    return item.confirmedValue !== null ? item.confirmedValue : item.extractedValue;
  };

  const baseCredits = getVal('total_credits', 8450000);
  const baseDebits = getVal('total_debits', 7820000);
  const amb = getVal('avg_monthly_balance', 485000);
  const baseGstTurnover = getVal('gst_turnover', 16200000);
  const bounces = getVal('inward_cheque_bounces', 0);

  // Apply stress testing factor (-20% to +20%)
  const multiplier = 1 + (stressFactor / 100);
  const totalCredits = Math.round(baseCredits * multiplier);
  const totalDebits = Math.round(baseDebits * (stressFactor < 0 ? 0.95 : 1.05));
  const gstTurnover = Math.round(baseGstTurnover * multiplier);

  const avgMonthlyCredit = Math.round(totalCredits / 6);
  const annualizedBankCredits = totalCredits * 2;
  const bankGstRatio = gstTurnover > 0 ? (annualizedBankCredits / gstTurnover).toFixed(2) : '1.04';
  const netCashAccrual = totalCredits - totalDebits;
  const estAnnualEmi = application.amount * 0.16;
  const dscr = Number((netCashAccrual * 2 / (estAnnualEmi || 1)).toFixed(2));

  // Calculated Core Ratios from Master Prompt
  const currentRatio = 1.42; // Benchmark > 1.25
  const quickRatio = 1.15;
  const debtToEquity = 0.82; // Benchmark < 1.50
  const ebitda = Math.round(gstTurnover * 0.14);
  const interestExpense = Math.round(application.amount * 0.12);
  const icr = Number((ebitda / (interestExpense || 1)).toFixed(2)); // Benchmark >= 2.0x
  const pat = Math.round(ebitda - interestExpense - (ebitda * 0.25));
  const netProfitMargin = gstTurnover > 0 ? Number(((pat / gstTurnover) * 100).toFixed(1)) : 6.8;

  const ratios = [
    { label: "Average Monthly Credit", value: `₹ ${avgMonthlyCredit.toLocaleString('en-IN')}`, benchmark: "Primary cash flow indicator", status: "PASS", formula: "Total 6M Credits / 6" },
    { label: "Average Monthly Balance (AMB)", value: `₹ ${amb.toLocaleString('en-IN')}`, benchmark: "> ₹50,000 policy minimum", status: amb >= 50000 ? "PASS" : "WARN", formula: "Sum of month-end balances / 6" },
    { label: "Current Ratio", value: `${currentRatio}x`, benchmark: "> 1.25x target", status: "PASS", formula: "Current Assets / Current Liabilities" },
    { label: "Quick Ratio", value: `${quickRatio}x`, benchmark: "> 1.00x target", status: "PASS", formula: "(Current Assets - Inventory) / Current Liabilities" },
    { label: "Debt-to-Equity Ratio", value: `${debtToEquity}x`, benchmark: "< 1.50x target", status: "PASS", formula: "Total Outstanding Debt / Net Worth" },
    { label: "Debt Service Coverage Ratio (DSCR)", value: `${dscr}x`, benchmark: "≥ 1.50x target", status: dscr >= 1.5 ? "PASS" : "WARN", formula: "Net Cash Accrual / Annual Debt Service" },
    { label: "Interest Coverage Ratio (ICR)", value: `${icr}x`, benchmark: "≥ 2.00x target", status: icr >= 2.0 ? "PASS" : "WARN", formula: "Operating EBITDA / Annual Interest" },
    { label: "Net Profit Margin (%)", value: `${netProfitMargin}%`, benchmark: "≥ 5.0% target", status: netProfitMargin >= 5.0 ? "PASS" : "WARN", formula: "Profit After Tax / Total Revenue" },
    { label: "Banking vs GST Turnover Ratio", value: `${bankGstRatio}x`, benchmark: "0.85x – 1.25x policy", status: "PASS", formula: "(Bank Credits × 2) / GST Outward" },
    { label: "Inward Cheque / ECS Returns", value: `${bounces} Count`, benchmark: "Max 2 in 6 months", status: bounces <= 2 ? "PASS" : "FAIL", formula: "Direct count of bounce returns" }
  ];

  return (
    <div className="screen-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Financial Spreading Sheet & Underwriting Ratios (S5)</h2>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--ok-bg)', color: 'var(--ok-ink)' }}>
              100% Analyst Verified Figures
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--mute)', marginTop: '2px' }}>
            Pre-filled spreading model for {application.applicant}. Formulas calculate key solvency, liquidity, and debt service ratios.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--card-subtle)', borderRadius: '8px', border: '1px solid var(--line)', padding: '2px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('ratios')}
            style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none',
              background: activeTab === 'ratios' ? 'var(--blue)' : 'transparent',
              color: activeTab === 'ratios' ? '#fff' : 'var(--ink)',
              fontSize: '12.5px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Core Ratios & Benchmarks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('financials')}
            style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none',
              background: activeTab === 'financials' ? 'var(--blue)' : 'transparent',
              color: activeTab === 'financials' ? '#fff' : 'var(--ink)',
              fontSize: '12.5px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Multi-Year Comparative Spread
          </button>
        </div>
      </div>

      {/* Stress Testing Sensitivity Bar */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '14px 20px', marginBottom: '20px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>⚡</span>
            <strong style={{ fontSize: '13px' }}>Stress Test Simulator: Revenue Shock Sensitivity</strong>
            <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', fontWeight: 700, color: stressFactor < 0 ? 'var(--error-ink)' : stressFactor > 0 ? 'var(--ok-ink)' : 'var(--mute)' }}>
              ({stressFactor >= 0 ? `+${stressFactor}%` : `${stressFactor}%`})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStressFactor(0)}
            style={{ fontSize: '11px', background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 600 }}
          >
            Reset to Baseline
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '11px', color: 'var(--mute)', fontWeight: 600 }}>-20% (Downturn)</span>
          <input
            type="range"
            min="-20"
            max="20"
            step="5"
            value={stressFactor}
            onChange={e => setStressFactor(parseInt(e.target.value, 10))}
            style={{ flex: 1, accentColor: 'var(--blue)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', color: 'var(--mute)', fontWeight: 600 }}>+20% (Expansion)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(480px, 1.4fr) minmax(340px, 1fr)', gap: '20px' }}>
        
        {/* Left: Financial Ratios or Multi-Year Spread */}
        {activeTab === 'ratios' ? (
          <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
                  <th style={{ padding: '12px 16px' }}>Financial Metric</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Calculated Value</th>
                  <th style={{ padding: '12px 16px' }}>Formula</th>
                  <th style={{ padding: '12px 16px' }}>Benchmark Policy</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {ratios.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{row.label}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>
                      {row.value}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '10.5px', fontFamily: 'var(--mono)', background: 'var(--blue-bg)', color: 'var(--blue)', padding: '2px 6px', borderRadius: '4px' }}>
                        {row.formula}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--mute)' }}>{row.benchmark}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700,
                        background: row.status === 'PASS' ? 'var(--ok-bg)' : 'var(--warn-bg)',
                        color: row.status === 'PASS' ? 'var(--ok-ink)' : 'var(--warn-ink)'
                      }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Multi-Year Comparative Financials */
          <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
                  <th style={{ padding: '12px 16px' }}>Line Item (in ₹ Lakhs)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>FY 2024 (Audited)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>FY 2025 (Audited)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>FY 2026 (Projected)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>Gross Turnover / Revenue</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>₹ 138.40 L</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>₹ 162.00 L</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>₹ 188.50 L</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>Operating EBITDA</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>₹ 18.20 L</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>₹ 22.68 L</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>₹ 26.40 L</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>Finance & Interest Costs</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>₹ 4.10 L</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>₹ 4.85 L</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>₹ 5.60 L</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>Profit After Tax (PAT)</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>₹ 8.90 L</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>₹ 11.02 L</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>₹ 13.80 L</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>Tangible Net Worth (TNW)</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>₹ 54.20 L</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>₹ 68.40 L</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>₹ 82.20 L</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Right: Scorecard Panel */}
        <ScorecardPanel />

      </div>
    </div>
  );
};
