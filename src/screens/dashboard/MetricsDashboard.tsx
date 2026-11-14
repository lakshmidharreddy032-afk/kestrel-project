import React from 'react';
import metricsData from '../../data/metrics.json';

interface MetricsDashboardProps {
  onResetDemoData: () => void;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ onResetDemoData }) => {
  const { minutesPerFile, documentRoundsPerFile, medianWorkingDays, figureAccuracyPostCheck, grossNPA } = metricsData;

  const kpis = [
    { label: "Turnaround Time (Working Days)", current: `${medianWorkingDays.current}d`, baseline: `Baseline: ${medianWorkingDays.baseline}d`, target: `Target: ${medianWorkingDays.target}d`, note: "Application receipt to sign-off" },
    { label: "Request Rounds Per File", current: `${documentRoundsPerFile.current}`, baseline: `Baseline: ${documentRoundsPerFile.baseline}`, target: `Target: ${documentRoundsPerFile.target}`, note: "Target 1 round via consolidated S1" },
    { label: "Touch Time Per File", current: `${minutesPerFile.current} min`, baseline: `Baseline: ${minutesPerFile.baseline} min`, target: `Target: ${minutesPerFile.target} min`, note: "Analyst & RM manual handling time" },
    { label: "Figure Accuracy Post-Check", current: `${figureAccuracyPostCheck.current}%`, baseline: `Baseline: ${figureAccuracyPostCheck.baseline}%`, target: `Target: ${figureAccuracyPostCheck.target}%`, note: "Accuracy flowing to spreading sheet" }
  ];

  return (
    <div className="screen-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Success Measures & Guardrail Dashboard</h2>
          <p style={{ fontSize: '13px', color: 'var(--mute)' }}>
            Operational metrics from Section 6 of Discover and Shape Pack. Includes Gross NPA credit quality guardrail.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetDemoData}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)',
            color: 'var(--error-ink)', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          🔄 Reset Demo Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--mute)', marginBottom: '4px' }}>{kpi.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--mono)', marginBottom: '4px' }}>
              {kpi.current}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--mute)', marginBottom: '4px' }}>
              <span>{kpi.baseline}</span>
              <span style={{ fontWeight: 600, color: 'var(--ok-ink)' }}>{kpi.target}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--mute)' }}>{kpi.note}</div>
          </div>
        ))}
      </div>

      {/* Gross NPA Guardrail Indicator Card */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Risk Guardrail: Gross Non-Performing Assets (NPA)</h3>
            <p style={{ fontSize: '12px', color: 'var(--mute)' }}>{grossNPA.description}</p>
          </div>
          <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700, background: 'var(--ok-bg)', color: 'var(--ok-ink)' }}>
            ✔ {grossNPA.status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--ok-ink)' }}>
            {grossNPA.current}%
          </span>
          <span style={{ fontSize: '13px', color: 'var(--mute)' }}>
            vs Board Ceiling Limit of <strong>{grossNPA.boardLimit}%</strong> ({grossNPA.headroom}% safe headroom)
          </span>
        </div>

        {/* Progress Bar Gauge */}
        <div style={{ width: '100%', height: '10px', borderRadius: '9999px', background: 'var(--line)', overflow: 'hidden' }}>
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
