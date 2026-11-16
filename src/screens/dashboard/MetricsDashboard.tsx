import React, { useState } from 'react';
import metricsData from '../../data/metrics.json';

interface MetricsDashboardProps {
  onResetDemoData: () => void;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ onResetDemoData }) => {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [dateRange, setDateRange] = useState('q3');

  const { figureAccuracyPostCheck, grossNPA } = metricsData;

  const kpis = [
    {
      label: "Turnaround Time (TAT)",
      current: "11.8 Days",
      baseline: "Baseline: 18.0 Days (Source: Kestrel FY25 Credit Operations Audit)",
      target: "Target: ≤ 12.0 Days",
      delta: "↓ 34.4% Faster",
      positive: true,
      note: "Application receipt to final credit sanction sign-off."
    },
    {
      label: "Analyst Touch Time per File",
      current: "48 Minutes",
      baseline: "Baseline: 4.5 Hours (270m)",
      target: "Target: ≤ 60 Minutes",
      delta: "↓ 82.2% Touch Reduction",
      positive: true,
      note: "Eliminates manual figure re-typing into spreading sheets."
    },
    {
      label: "Day-1 Checklist Completeness",
      current: "91% Yield",
      baseline: "Baseline: 62% Completeness",
      target: "Target: ≥ 85% First-Pass",
      delta: "↑ 29% First-Pass Yield",
      positive: true,
      note: "Single-chase deficiency request prevents multi-round ping-pong."
    },
    {
      label: "Figure Extraction Accuracy",
      current: `${figureAccuracyPostCheck.current}%`,
      baseline: `Baseline: ${figureAccuracyPostCheck.baseline}%`,
      target: `Target: ${figureAccuracyPostCheck.target}%`,
      delta: "Zero Silent Hallucinations",
      positive: true,
      note: "Enforced by mandatory Credit Analyst human verification gate."
    }
  ];

  const tatStages = [
    { stage: "S1 Intake & Checklist", manual: "3.5 Days", prototype: "0.5 Days", improvement: "85%" },
    { stage: "S2 Document Collection", manual: "6.8 Days", prototype: "3.8 Days", improvement: "44%" },
    { stage: "S3 Gap Diagnostics", manual: "2.2 Days", prototype: "0.2 Days", improvement: "90%" },
    { stage: "S4 OCR & Extraction", manual: "3.0 Days", prototype: "0.8 Days", improvement: "73%" },
    { stage: "S5 Spreading & Scoring", manual: "1.5 Days", prototype: "0.5 Days", improvement: "66%" },
    { stage: "S6 Credit Sign-Off", manual: "1.0 Day", prototype: "0.5 Days", improvement: "50%" }
  ];

  return (
    <div className="screen-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Executive Operational Metrics & Risk Guardrails</h2>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--blue-bg)', color: 'var(--blue)' }}>
              Board Review Level
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--mute)', marginTop: '2px' }}>
            Comparing legacy manual workflow baseline (18.0 days) against Kestrel Finance assisted extraction & human verification prototype.
          </p>
        </div>

        {/* Filters & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '13px', fontWeight: 600 }}
          >
            <option value="all">All Branches (Consolidated)</option>
            <option value="mumbai">Mumbai (BKC Hub)</option>
            <option value="bangalore">Bangalore (Indiranagar)</option>
            <option value="delhi">Delhi NCR (Connaught Place)</option>
            <option value="hyderabad">Hyderabad (Hitec City)</option>
            <option value="chennai">Chennai (T. Nagar)</option>
          </select>

          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '13px', fontWeight: 600 }}
          >
            <option value="q3">Current Quarter (FY26 Q3)</option>
            <option value="ytd">Year-to-Date (FY26)</option>
            <option value="trailing12">Trailing 12 Months</option>
          </select>

          <button
            type="button"
            onClick={onResetDemoData}
            style={{
              padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)',
              color: 'var(--error-ink)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            🔄 Reset Demo Data
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '18px', boxShadow: 'var(--shadow-xs)' }} className="interactive-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ fontSize: '12.5px', color: 'var(--mute)', fontWeight: 600 }}>{kpi.label}</div>
              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--ok-bg)', color: 'var(--ok-ink)' }}>
                {kpi.delta}
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--mono)', marginBottom: '6px' }}>
              {kpi.current}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--mute)', marginBottom: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '6px' }}>
              <span>{kpi.baseline}</span>
              <span style={{ fontWeight: 700, color: 'var(--ok-ink)' }}>{kpi.target}</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--mute)', lineHeight: 1.4 }}>{kpi.note}</div>
          </div>
        ))}
      </div>

      {/* TAT Lifecycle Breakdown Table */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-xs)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px' }}>
          Turnaround Time (TAT) Stage-by-Stage Elimination Analysis
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
              <th style={{ padding: '10px 14px' }}>Operational Stage</th>
              <th style={{ padding: '10px 14px' }}>Manual Baseline TAT</th>
              <th style={{ padding: '10px 14px' }}>Kestrel Prototype TAT</th>
              <th style={{ padding: '10px 14px' }}>Efficiency Gain</th>
              <th style={{ padding: '10px 14px' }}>Visual Reduction</th>
            </tr>
          </thead>
          <tbody>
            {tatStages.map(s => (
              <tr key={s.stage} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{s.stage}</td>
                <td style={{ padding: '10px 14px', color: 'var(--mute)' }}>{s.manual}</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--blue)', fontFamily: 'var(--mono)' }}>{s.prototype}</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--ok-ink)' }}>{s.improvement} faster</td>
                <td style={{ padding: '10px 14px', width: '25%' }}>
                  <div style={{ width: '100%', height: '6px', background: 'var(--line)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: s.improvement, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: '9999px' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: '11.5px', color: 'var(--mute)', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--line)' }}>
          * <strong>Baseline TAT Source:</strong> 18.0 Working Days (Kestrel Finance FY25 Internal Credit Operations Benchmark across 420 SME loan files under ₹25 Lakh).
        </div>
      </div>

      {/* Gross NPA Guardrail Indicator Card */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '24px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Non-Negotiable Risk Guardrail: Gross Portfolio NPA</h3>
              <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, background: 'var(--ok-bg)', color: 'var(--ok-ink)' }}>
                ✔ Safe Underwriting
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--mute)', marginTop: '2px' }}>
              {grossNPA.description}
            </p>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, background: 'var(--ok-bg)', color: 'var(--ok-ink)', border: '1px solid var(--ok-border)' }}>
            ✔ {grossNPA.status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--ok-ink)' }}>
            {grossNPA.current}%
          </span>
          <span style={{ fontSize: '13.5px', color: 'var(--ink)' }}>
            Gross NPA vs Board Ceiling Limit of <strong>{grossNPA.boardLimit}%</strong> (<strong style={{ color: 'var(--ok-ink)' }}>{grossNPA.headroom}%</strong> safe risk headroom)
          </span>
        </div>

        {/* Progress Bar Gauge */}
        <div style={{ width: '100%', height: '12px', borderRadius: '9999px', background: 'var(--line)', overflow: 'hidden' }}>
          <div style={{
            width: `${(grossNPA.current / grossNPA.boardLimit) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
            borderRadius: '9999px'
          }} />
        </div>
      </div>
    </div>
  );
};
