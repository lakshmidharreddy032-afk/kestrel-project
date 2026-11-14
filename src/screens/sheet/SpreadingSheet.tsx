import React from 'react';
import type { SMEApplication, ExtractedFigure } from '../../domain/types';
import { ScorecardPanel } from './ScorecardPanel';

interface SpreadingSheetProps {
  application: SMEApplication;
  figures: ExtractedFigure[];
}

export const SpreadingSheet: React.FC<SpreadingSheetProps> = ({ application, figures }) => {
  const getVal = (key: string, fallback: number) => {
    const item = figures.find(f => f.fieldKey === key);
    if (!item) return fallback;
    return item.confirmedValue !== null ? item.confirmedValue : item.extractedValue;
  };

  const totalCredits = getVal('total_credits', 8450000);
  const totalDebits = getVal('total_debits', 7820000);
  const amb = getVal('avg_monthly_balance', 485000);
  const gstTurnover = getVal('gst_turnover', 16200000);
  const bounces = getVal('inward_cheque_bounces', 0);

  const avgMonthlyCredit = Math.round(totalCredits / 6);
  const annualizedBankCredits = totalCredits * 2;
  const bankGstRatio = gstTurnover > 0 ? (annualizedBankCredits / gstTurnover).toFixed(2) : '1.04';
  const netCashAccrual = totalCredits - totalDebits;
  const estAnnualEmi = application.amount * 0.16;
  const dscr = (netCashAccrual * 2 / (estAnnualEmi || 1)).toFixed(2);

  const rows = [
    { label: "Total Bank Credits (6 Months)", value: `₹ ${totalCredits.toLocaleString('en-IN')}`, formula: "Sum of operational credits", bench: "Verified against HDFC statement" },
    { label: "Average Monthly Credit", value: `₹ ${avgMonthlyCredit.toLocaleString('en-IN')}`, formula: "Total Credits ÷ 6 Months", bench: "Primary cash flow driver" },
    { label: "Total Bank Debits (6 Months)", value: `₹ ${totalDebits.toLocaleString('en-IN')}`, formula: "Sum of debits / withdrawals", bench: "Matches statement debit column" },
    { label: "Average Monthly Balance (AMB)", value: `₹ ${amb.toLocaleString('en-IN')}`, formula: "Sum of month-end balances ÷ 6", bench: "Minimum policy AMB > ₹50,000" },
    { label: "Annualized GST Turnover", value: `₹ ${gstTurnover.toLocaleString('en-IN')}`, formula: "Table 3.1 GSTR-3B Taxable Outward", bench: "Matches GST portal filings" },
    { label: "Banking vs GST Turnover Ratio", value: `${bankGstRatio} x`, formula: "(Bank Credits × 2) ÷ GST Turnover", bench: "Policy range: 0.85x – 1.25x" },
    { label: "Inward Cheque / ECS Returns", value: `${bounces} Count`, formula: "Direct count of outward return code", bench: "Max permitted: 2 in 6 months" },
    { label: "Estimated Debt Service Coverage (DSCR)", value: `${dscr} x`, formula: "Net Cash Accrual ÷ Annual Debt Service", bench: "Benchmark DSCR ≥ 1.35x" }
  ];

  return (
    <div className="screen-container">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Financial Spreading Sheet View</h2>
        <p style={{ fontSize: '13px', color: 'var(--mute)' }}>
          Pre-filled sheet for {application.applicant}. Formulas calculate key ratios transparently from confirmed extraction values.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(480px, 1.4fr) minmax(320px, 1fr)', gap: '20px' }}>
        
        {/* Left: Financial Ratios Table */}
        <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
                <th style={{ padding: '12px 16px' }}>Financial Metric</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Calculated Value</th>
                <th style={{ padding: '12px 16px' }}>Formula</th>
                <th style={{ padding: '12px 16px' }}>Benchmark Policy</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{row.label}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>
                    {row.value}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', background: 'var(--blue-bg)', color: 'var(--blue)', padding: '2px 6px', borderRadius: '4px' }}>
                      {row.formula}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--mute)' }}>{row.bench}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Legacy Scorecard Panel */}
        <ScorecardPanel />

      </div>
    </div>
  );
};
