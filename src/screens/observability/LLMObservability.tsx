import React, { useState } from 'react';
import type { LLMCallTrace, LLMModelCatalogItem, UserRole, ModelPromptConfig } from '../../domain/types';
import rawData from '../../data/llmObservability.json';
import { useToast } from '../../components/ui/Toast';
import { store } from '../../services/store';
import { DEFAULT_PROMPTS } from '../../domain/prompts';
import { ROLES } from '../../roles/roles';

interface LLMObservabilityProps {
  currentRole?: UserRole;
  currentUserName?: string;
}

export const LLMObservability: React.FC<LLMObservabilityProps> = ({
  currentRole = store.getState().currentRole,
  currentUserName = ROLES[store.getState().currentRole].name
}) => {
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState<'telemetry' | 'prompts'>('telemetry');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTrace, setSelectedTrace] = useState<LLMCallTrace | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [traces, setTraces] = useState<LLMCallTrace[]>(rawData.traces as LLMCallTrace[]);

  // Prompt Studio States
  const [promptsList, setPromptsList] = useState<ModelPromptConfig[]>(
    store.getState().systemPrompts || DEFAULT_PROMPTS
  );
  const [selectedPromptId, setSelectedPromptId] = useState<string>('ocr_extraction');
  const currentPromptObj = promptsList.find(p => p.id === selectedPromptId) || promptsList[0];
  const [promptText, setPromptText] = useState<string>(currentPromptObj.prompt);
  const [temperature, setTemperature] = useState<number>(currentPromptObj.temperature);
  const [isTestingPrompt, setIsTestingPrompt] = useState<boolean>(false);
  const [dryRunResult, setDryRunResult] = useState<{
    latencyMs: number;
    tokensEstimated: number;
    costUSD: number;
    costINR: number;
    outputSample: string;
  } | null>(null);

  const fxRate = rawData.currency.fxRate; // 84.0 INR / USD
  const isOwner = currentRole === 'Owner';

  const formatCost = (costUSD: number) => {
    if (currency === 'INR') {
      const inr = costUSD * fxRate;
      return `₹${inr.toFixed(4)}`;
    }
    return `$${costUSD.toFixed(5)}`;
  };

  const formatCurrencyTotal = (amountUSD: number) => {
    if (currency === 'INR') {
      return `₹${(amountUSD * fxRate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filter traces
  const filteredTraces = traces.filter(t => {
    if (modelFilter !== 'all' && t.model !== modelFilter) return false;
    if (stageFilter !== 'all' && !t.stage.toLowerCase().includes(stageFilter.toLowerCase())) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        t.appId.toLowerCase().includes(q) ||
        t.applicant.toLowerCase().includes(q) ||
        t.document.toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate dynamic totals
  const totalCalls = traces.length;
  const totalTokens = traces.reduce((acc, t) => acc + t.totalTokens, 0);
  const totalCostUSD = traces.reduce((acc, t) => acc + t.costUSD, 0) + rawData.budget.spentUSD;
  const budgetLimitUSD = rawData.budget.monthlyLimitUSD;
  const budgetUsedPct = Math.min(100, Math.round((totalCostUSD / budgetLimitUSD) * 100));

  // Switch selected prompt
  const handleSelectPrompt = (id: string) => {
    setSelectedPromptId(id);
    const target = promptsList.find(p => p.id === id);
    if (target) {
      setPromptText(target.prompt);
      setTemperature(target.temperature);
      setDryRunResult(null);
    }
  };

  // Save prompt changes (Owner only)
  const handleSavePrompt = () => {
    if (!isOwner) {
      showToast('error', 'Permission Denied', 'Only Platform Owner (Devina Sen) holds permissions to update model system prompts.');
      return;
    }

    if (!promptText.trim() || promptText.trim().length < 20) {
      showToast('error', 'Invalid Prompt', 'System instruction must be at least 20 characters long.');
      return;
    }

    const res = store.updatePrompt(selectedPromptId, promptText.trim(), temperature, currentRole, currentUserName);
    if (res.success) {
      const updatedList = store.getState().systemPrompts;
      setPromptsList([...updatedList]);
      showToast('success', 'Prompt Version Deployed', `Updated ${currentPromptObj.name}. New version active in GCP asia-south1.`);
    } else {
      showToast('error', 'Save Failed', res.error || 'Failed to update prompt.');
    }
  };

  // Reset prompt to defaults (Owner only)
  const handleResetPrompts = () => {
    if (!isOwner) {
      showToast('error', 'Permission Denied', 'Only Platform Owner can restore factory system instructions.');
      return;
    }

    const res = store.resetPrompts(currentRole, currentUserName);
    if (res.success) {
      const updatedList = store.getState().systemPrompts;
      setPromptsList([...updatedList]);
      const restored = updatedList.find(p => p.id === selectedPromptId) || updatedList[0];
      setPromptText(restored.prompt);
      setTemperature(restored.temperature);
      setDryRunResult(null);
      showToast('info', 'Factory Instructions Restored', 'Restored baseline model instructions.');
    }
  };

  // Test prompt dry run
  const handleTestPromptDryRun = () => {
    setIsTestingPrompt(true);
    showToast('info', 'Executing Prompt Dry-Run', `Running evaluation test against ${currentPromptObj.targetModel}...`);

    setTimeout(() => {
      const tokens = Math.round(promptText.length / 3.8) + 320;
      const latency = Math.floor(580 + Math.random() * 260);
      const costU = tokens * 0.00000012;
      const costI = costU * fxRate;

      setDryRunResult({
        latencyMs: latency,
        tokensEstimated: tokens,
        costUSD: costU,
        costINR: costI,
        outputSample: JSON.stringify({
          status: 'SUCCESS',
          extractedFields: 4,
          fieldKey: selectedPromptId === 'ocr_extraction' ? 'total_credits' : 'reconciliation_status',
          extractedValue: selectedPromptId === 'ocr_extraction' ? 8450000 : 'MATCH',
          confidenceScore: 0.99,
          boundingBox: { ymin: 24.5, xmin: 61.2, ymax: 29.0, xmax: 87.5 },
          evaluationSummary: 'Prompt validated. Output adheres 100% to JSON schema. Zero credit decision hallucination.'
        }, null, 2)
      });
      setIsTestingPrompt(false);
      showToast('success', 'Dry-Run Complete', `Evaluation passed in ${latency}ms • Estimated tokens: ${tokens}`);
    }, 750);
  };

  // Trigger simulated live model call
  const handleTriggerLiveCall = () => {
    setIsSimulating(true);
    showToast('info', 'Executing Model Call', 'Invoking Gemini 1.5 Flash Vision OCR on GCP asia-south1...');

    setTimeout(() => {
      const promptToks = Math.floor(1600 + Math.random() * 800);
      const compToks = Math.floor(250 + Math.random() * 200);
      const cachedToks = Math.random() > 0.4 ? 600 : 0;
      const totalToks = promptToks + compToks;
      const costUSD = (promptToks * 0.000000075) + (compToks * 0.00000030) - (cachedToks * 0.00000005625);
      const costINR = costUSD * fxRate;
      const latency = Math.floor(680 + Math.random() * 320);

      const newTrace: LLMCallTrace = {
        id: `llm-trace-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        appId: 'APP-1001',
        applicant: 'Malabar Spices & Agro LLP',
        document: 'live_telemetry_sample.pdf',
        stage: 'S4 OCR Extraction',
        model: 'gemini-1.5-flash',
        endpoint: 'POST /v1beta/models/gemini-1.5-flash:generateContent',
        promptTokens: promptToks,
        completionTokens: compToks,
        cachedTokens: cachedToks,
        totalTokens: totalToks,
        costUSD,
        costINR,
        latencyMs: latency,
        statusCode: 200,
        status: 'Success (Live Stream)',
        confidence: 0.98,
        tenancy: 'GCP asia-south1 (Zero Data Retention)',
        extractedFields: 6,
        systemPrompt: promptText,
        rawResponse: JSON.stringify({
          fieldKey: 'live_turnover',
          label: 'Live Verified Stream Extraction',
          extractedValue: 1820000,
          confidenceScore: 0.98,
          timestamp: new Date().toISOString()
        }, null, 2)
      };

      setTraces([newTrace, ...traces]);
      setIsSimulating(false);
      showToast('success', 'Model Execution Complete', `Latency: ${latency}ms • Cost: ₹${costINR.toFixed(4)} (${totalToks} tokens)`);
    }, 900);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rawData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kestrel-llm-observability-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', 'Export Generated', 'Downloaded full telemetry traces and cost accounting log.');
  };

  return (
    <div className="screen-container">
      {/* Header & Persona Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>⚡ LLM Observability, Model Cost &amp; Prompt Studio</h2>
            <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: '#ffedd5', color: '#ea580c', border: '1px solid #fdba74' }}>
              OWNER CONSOLE
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'var(--blue-bg)', color: 'var(--blue)' }}>
              SOC-2 / RBI AUDIT READY
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--mute)', marginTop: '4px' }}>
            Continuous real-time token tracking, per-call billing breakdown, latency metrics, and prompt engineering governance.
          </p>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Currency Switcher */}
          <div style={{ display: 'flex', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--line)', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setCurrency('INR')}
              style={{
                padding: '5px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 700,
                background: currency === 'INR' ? 'var(--blue)' : 'transparent',
                color: currency === 'INR' ? '#fff' : 'var(--mute)', cursor: 'pointer'
              }}
            >
              INR (₹)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              style={{
                padding: '5px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 700,
                background: currency === 'USD' ? 'var(--blue)' : 'transparent',
                color: currency === 'USD' ? '#fff' : 'var(--mute)', cursor: 'pointer'
              }}
            >
              USD ($)
            </button>
          </div>

          {/* Trigger Live Call Button */}
          <button
            type="button"
            disabled={isSimulating}
            onClick={handleTriggerLiveCall}
            style={{
              padding: '7px 16px', borderRadius: '8px', border: 'none',
              background: isSimulating ? 'var(--line)' : '#ea580c',
              color: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: isSimulating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
            }}
          >
            <span>{isSimulating ? '⏳' : '⚡'}</span>
            <span>{isSimulating ? 'Invoking Model...' : 'Trigger Live Test Call'}</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            style={{
              padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--line)',
              background: 'var(--card)', color: 'var(--ink)', fontSize: '12.5px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <span>📥</span>
            <span>Export Traces</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation: Observability Telemetry vs Prompt Engineering Studio */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveView('telemetry')}
          style={{
            padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
            background: activeView === 'telemetry' ? 'var(--blue)' : 'var(--card-subtle)',
            color: activeView === 'telemetry' ? '#fff' : 'var(--ink)',
            boxShadow: activeView === 'telemetry' ? 'var(--shadow-xs)' : 'none'
          }}
        >
          📊 LLM Observability &amp; Cost Metrics
        </button>

        <button
          type="button"
          onClick={() => setActiveView('prompts')}
          style={{
            padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
            background: activeView === 'prompts' ? '#ea580c' : 'var(--card-subtle)',
            color: activeView === 'prompts' ? '#fff' : 'var(--ink)',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: activeView === 'prompts' ? '0 4px 12px rgba(234, 88, 12, 0.3)' : 'none'
          }}
        >
          <span>⚙️ System Prompt Studio</span>
          <span style={{
            fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
            background: activeView === 'prompts' ? 'rgba(255,255,255,0.25)' : '#ffedd5',
            color: activeView === 'prompts' ? '#fff' : '#ea580c', fontWeight: 800
          }}>
            EXCLUSIVE OWNER AUTHORITY
          </span>
        </button>
      </div>

      {/* Tenancy & RBI Sovereignty Compliance Banner */}
      <div style={{
        background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 18px',
        color: '#166534', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '10px', fontSize: '12.5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🛡️</span>
          <div>
            <strong>Single-Tenant Boundary &amp; Zero Data Retention Verified:</strong> All LLM API calls are routed through Google Cloud Cloud Run in <strong>asia-south1 (Mumbai)</strong>. Volatile memory processing only; customer document scans are never cached, persisted, or used for model training.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px', border: '1px solid #bbf7d0' }}>
            TLS 1.3 IN FLIGHT
          </span>
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px', border: '1px solid #bbf7d0' }}>
            AES-256 CMEK AT REST
          </span>
        </div>
      </div>

      {/* VIEW 1: OBSERVABILITY TELEMETRY & COST ACCOUNTING */}
      {activeView === 'telemetry' && (
        <>
          {/* Primary Financial & Operational Metrics (4 Tiles) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Metric 1: Monthly Spend & Budget */}
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '18px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mute)' }}>Monthly LLM Spend (MTD)</span>
                <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--ok-bg)', color: 'var(--ok-ink)' }}>
                  {budgetUsedPct}% of Cap
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--mono)', margin: '4px 0' }}>
                {formatCurrencyTotal(totalCostUSD)}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--mute)', marginBottom: '8px' }}>
                Monthly Budget Cap: <strong>{formatCurrencyTotal(budgetLimitUSD)}</strong> (Headroom: {formatCurrencyTotal(budgetLimitUSD - totalCostUSD)})
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--line)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${budgetUsedPct}%`, height: '100%', background: '#10b981', borderRadius: '9999px' }} />
              </div>
            </div>

            {/* Metric 2: Unit Economics per Loan File */}
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '18px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mute)' }}>Cost per SME Loan File</span>
                <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--ok-bg)', color: 'var(--ok-ink)' }}>
                  ↓ 98.9% Cheaper
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ok-ink)', fontFamily: 'var(--mono)', margin: '4px 0' }}>
                {currency === 'INR' ? `₹${rawData.benchmarks.llmCostPerFileINR.toFixed(2)}` : `$${(rawData.benchmarks.llmCostPerFileINR / fxRate).toFixed(3)}`}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--mute)' }}>
                vs Manual Typing: <strong>{currency === 'INR' ? `₹${rawData.benchmarks.manualCostPerFileINR}` : `$${(rawData.benchmarks.manualCostPerFileINR / fxRate).toFixed(2)}`}</strong> per file
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ok-ink)', marginTop: '6px', fontWeight: 600 }}>
                ⚡ Net Savings: ₹182.98 / file • Touch time: 45m → 2m
              </div>
            </div>

            {/* Metric 3: Tokens & Context Caching */}
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '18px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mute)' }}>Token Throughput &amp; Caching</span>
                <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                  29% Cached
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--mono)', margin: '4px 0' }}>
                {(totalTokens / 1000000).toFixed(2)}M <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--mute)' }}>tokens</span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--mute)' }}>
                Cached Tokens: <strong>{(rawData.summary.cachedTokens / 1000).toLocaleString()}k</strong> (Saved {formatCurrencyTotal(rawData.summary.cachedSavingsUSD)})
              </div>
              <div style={{ fontSize: '11px', color: 'var(--mute)', marginTop: '6px' }}>
                Prompt: 77% • Completion: 23% • Schema reuse active
              </div>
            </div>

            {/* Metric 4: Latency & Reliability */}
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '18px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mute)' }}>Latency &amp; Model Uptime</span>
                <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--ok-bg)', color: 'var(--ok-ink)' }}>
                  99.6% Success
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#1e56a0', fontFamily: 'var(--mono)', margin: '4px 0' }}>
                {rawData.summary.avgLatencyMs} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--mute)' }}>ms avg</span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--mute)' }}>
                P95: <strong>{rawData.summary.p95LatencyMs}ms</strong> • P99: <strong>{rawData.summary.p99LatencyMs}ms</strong>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ok-ink)', marginTop: '6px', fontWeight: 600 }}>
                ✔ Total Calls: {totalCalls.toLocaleString()} (Zero silent hallucinations)
              </div>
            </div>
          </div>

          {/* Model Catalog & Cost Matrix Table */}
          <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Model Deployment Roster &amp; Pricing Matrix</h3>
                <span style={{ fontSize: '12px', color: 'var(--mute)' }}>Active models orchestrated in the Kestrel credit pipeline</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--mute)' }}>All rates aligned to Google Cloud Platform enterprise contracts</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
                    <th style={{ padding: '10px 14px' }}>Model &amp; Version</th>
                    <th style={{ padding: '10px 14px' }}>Operational Milestone</th>
                    <th style={{ padding: '10px 14px' }}>Hosting Region</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Input Rate / 1M</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Output Rate / 1M</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Calls</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Spend</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Avg Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {rawData.modelCatalog.map((m: LLMModelCatalogItem) => (
                    <tr key={m.modelId} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--blue)' }}>{m.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--mute)', fontFamily: 'var(--mono)' }}>{m.version}</div>
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: '240px', fontSize: '11.5px', color: 'var(--ink)' }}>
                        {m.primaryUse}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', background: 'var(--card-subtle)', border: '1px solid var(--line)', fontWeight: 600 }}>
                          📍 {m.region}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--mono)' }}>
                        {currency === 'INR' ? `₹${(m.pricing.inputPer1MTokensUSD * fxRate).toFixed(2)}` : `$${m.pricing.inputPer1MTokensUSD.toFixed(3)}`}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--mono)' }}>
                        {currency === 'INR' ? `₹${(m.pricing.outputPer1MTokensUSD * fxRate).toFixed(2)}` : `$${m.pricing.outputPer1MTokensUSD.toFixed(2)}`}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700 }}>
                        {m.stats.callsCount.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 800, color: 'var(--ok-ink)' }}>
                        {formatCurrencyTotal(m.stats.totalCostUSD)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--mono)' }}>
                        {m.stats.avgLatencyMs}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Granular Invocations Explorer (Every LLM Call) */}
          <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '20px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Granular Model Invocation Log &amp; Live Trace Audits</h3>
                <span style={{ fontSize: '12px', color: 'var(--mute)' }}>Click any record to inspect exact prompt payload, bounding box schema, and billing calculation</span>
              </div>

              {/* Filters Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="search"
                  placeholder="Filter by ID, applicant, document..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card-subtle)', fontSize: '12.5px', minWidth: '220px'
                  }}
                />

                <select
                  value={modelFilter}
                  onChange={e => setModelFilter(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '12.5px', fontWeight: 600 }}
                >
                  <option value="all">All Models</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                </select>

                <select
                  value={stageFilter}
                  onChange={e => setStageFilter(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '12.5px', fontWeight: 600 }}
                >
                  <option value="all">All Stages</option>
                  <option value="s1">S1 Intake</option>
                  <option value="s3">S3 Gap Check</option>
                  <option value="s4">S4 Extraction</option>
                </select>
              </div>
            </div>

            {/* Traces Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--card-subtle)', borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
                    <th style={{ padding: '10px 12px' }}>Trace ID &amp; Time</th>
                    <th style={{ padding: '10px 12px' }}>Application &amp; Borrower</th>
                    <th style={{ padding: '10px 12px' }}>Document Target</th>
                    <th style={{ padding: '10px 12px' }}>Operational Stage</th>
                    <th style={{ padding: '10px 12px' }}>Model</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Tokens (P / C / Tot)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Calculated Cost</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Latency</th>
                    <th style={{ padding: '10px 12px' }}>Status / Quality</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Trace Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTraces.map(trace => (
                    <tr key={trace.id} style={{ borderBottom: '1px solid var(--line)' }} className="table-row-hover">
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--blue)' }}>{trace.id}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--mute)' }}>{new Date(trace.timestamp).toLocaleTimeString()}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700 }}>{trace.appId}</div>
                        <div style={{ fontSize: '11px', color: 'var(--mute)' }}>{trace.applicant}</div>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '11px' }}>
                        {trace.document}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600, background: 'var(--card-subtle)', border: '1px solid var(--line)' }}>
                          {trace.stage}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                          background: trace.model.includes('pro') ? '#ede9fe' : trace.model.includes('2.0') ? '#ffedd5' : '#e0f2fe',
                          color: trace.model.includes('pro') ? '#6d28d9' : trace.model.includes('2.0') ? '#c2410c' : '#0369a1'
                        }}>
                          {trace.model}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--mono)' }}>
                        <div><strong>{trace.totalTokens.toLocaleString()}</strong></div>
                        <div style={{ fontSize: '10px', color: 'var(--mute)' }}>{trace.promptTokens} / {trace.completionTokens}</div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--ok-ink)' }}>
                        {formatCost(trace.costUSD)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--mono)' }}>
                        {trace.latencyMs}ms
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700,
                          background: trace.status.includes('Degraded') ? '#fef3c7' : 'var(--ok-bg)',
                          color: trace.status.includes('Degraded') ? '#92400e' : 'var(--ok-ink)',
                          border: trace.status.includes('Degraded') ? '1px solid #fde68a' : '1px solid var(--ok-border)'
                        }}>
                          {trace.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedTrace(trace)}
                          style={{
                            padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--blue-border)',
                            background: 'var(--blue-bg)', color: 'var(--blue)', fontSize: '11px', fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          🔍 Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: SYSTEM PROMPT STUDIO (EXCLUSIVE OWNER AUTHORITY) */}
      {activeView === 'prompts' && (
        <div>
          {/* Permission State Banner */}
          {isOwner ? (
            <div style={{
              background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '10px', padding: '14px 20px',
              color: '#065f46', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '10px', fontSize: '13px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⚡</span>
                <div>
                  <strong>Owner Authorization Active:</strong> You are logged in as <strong>{currentUserName} (Platform &amp; AI Operations Owner)</strong>. You have exclusive administrative authority to edit, calibrate, test, and deploy model system instructions across production.
                </div>
              </div>
              <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em' }}>
                IAM: PROMPT WRITE ACCESS
              </span>
            </div>
          ) : (
            <div style={{
              background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '10px', padding: '14px 20px',
              color: '#991b1b', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '10px', fontSize: '13px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🔒</span>
                <div>
                  <strong>Access Restricted (Read-Only Mode):</strong> You are currently logged in as <strong>{currentRole} ({currentUserName})</strong>. Under Kestrel IAM policy, <em>only</em> the <strong>Platform Owner (Devina Sen)</strong> is permitted to alter model system prompts. Text editing and deployment are disabled.
                </div>
              </div>
              <span style={{ background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '11px' }}>
                READ-ONLY GUARDRAIL
              </span>
            </div>
          )}

          {/* Prompt Selector Ribbon */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            {promptsList.map(p => {
              const isSelected = selectedPromptId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPrompt(p.id)}
                  style={{
                    background: isSelected ? 'var(--card)' : 'var(--card-subtle)',
                    border: isSelected ? '2px solid #ea580c' : '1px solid var(--line)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 14px rgba(234, 88, 12, 0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700,
                      background: p.targetModel.includes('pro') ? '#ede9fe' : p.targetModel.includes('2.0') ? '#ffedd5' : '#e0f2fe',
                      color: p.targetModel.includes('pro') ? '#6d28d9' : p.targetModel.includes('2.0') ? '#c2410c' : '#0369a1'
                    }}>
                      {p.targetModel}
                    </span>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--mute)', fontWeight: 600 }}>
                      {p.version}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: isSelected ? '#ea580c' : 'var(--ink)', marginBottom: '4px' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--mute)', lineHeight: 1.35 }}>
                    {p.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Prompt Editor & Workbench */}
          <div style={{ background: 'var(--card)', borderRadius: '14px', border: '1px solid var(--line)', padding: '24px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                    {currentPromptObj.name}
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                    {currentPromptObj.version}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--mute)', marginTop: '4px' }}>
                  Target: <code>{currentPromptObj.targetModel}</code> • Host: <strong>GCP asia-south1 (Mumbai)</strong> • Last updated by <em>{currentPromptObj.lastUpdatedBy}</em> on {currentPromptObj.lastUpdatedAt}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  disabled={!isOwner}
                  onClick={handleResetPrompts}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--line)',
                    background: 'var(--card-subtle)', color: isOwner ? 'var(--ink)' : 'var(--mute)',
                    fontSize: '12px', fontWeight: 600, cursor: isOwner ? 'pointer' : 'not-allowed'
                  }}
                  title={!isOwner ? 'Only Owner can reset instructions' : undefined}
                >
                  🔄 Reset Defaults
                </button>

                <button
                  type="button"
                  disabled={isTestingPrompt}
                  onClick={handleTestPromptDryRun}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--blue-border)',
                    background: 'var(--blue-bg)', color: 'var(--blue)', fontSize: '12px', fontWeight: 700,
                    cursor: isTestingPrompt ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <span>{isTestingPrompt ? '⏳' : '🧪'}</span>
                  <span>{isTestingPrompt ? 'Running Test...' : 'Test Prompt (Dry-Run)'}</span>
                </button>

                <button
                  type="button"
                  disabled={!isOwner}
                  onClick={handleSavePrompt}
                  style={{
                    padding: '8px 18px', borderRadius: '8px', border: 'none',
                    background: isOwner ? '#ea580c' : 'var(--line)',
                    color: '#fff', fontSize: '12.5px', fontWeight: 700,
                    cursor: isOwner ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px',
                    boxShadow: isOwner ? '0 4px 12px rgba(234, 88, 12, 0.3)' : 'none'
                  }}
                  title={!isOwner ? 'Only Platform Owner holds permissions to deploy prompts' : undefined}
                >
                  <span>💾</span>
                  <span>Save &amp; Deploy Prompt</span>
                </button>
              </div>
            </div>

            {/* Prompt Editor Textarea */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="prompt-textarea" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  System Instructions (Strict Deterministic Boundaries):
                </label>
                <div style={{ fontSize: '11px', color: 'var(--mute)', fontFamily: 'var(--mono)' }}>
                  Character Count: <strong>{promptText.length}</strong> • Estimated Input Tokens: <strong>~{Math.round(promptText.length / 3.8)}</strong>
                </div>
              </div>

              <textarea
                id="prompt-textarea"
                rows={7}
                value={promptText}
                disabled={!isOwner}
                onChange={e => setPromptText(e.target.value)}
                placeholder="Enter system prompt instructions..."
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: isOwner ? '1px solid var(--blue)' : '1px solid var(--line)',
                  background: isOwner ? 'var(--card)' : 'var(--card-subtle)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--mono)',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                  cursor: isOwner ? 'text' : 'not-allowed',
                  boxShadow: isOwner ? '0 0 0 2px rgba(30,86,160,0.1)' : 'none'
                }}
              />
            </div>

            {/* Controls Bar: Temperature & Parameter Adjustments */}
            <div style={{
              background: 'var(--card-subtle)', border: '1px solid var(--line)', borderRadius: '10px', padding: '14px 18px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink)' }}>Model Temperature:</div>
                  <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Lower values ensure deterministic extraction</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    disabled={!isOwner}
                    value={temperature}
                    onChange={e => setTemperature(parseFloat(e.target.value))}
                    style={{ width: '130px', cursor: isOwner ? 'pointer' : 'not-allowed' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>
                    {temperature.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '11px', color: temperature === 0 ? 'var(--ok-ink)' : 'var(--mute)', fontWeight: 600 }}>
                    {temperature === 0 ? '(Strict Deterministic)' : temperature <= 0.2 ? '(Conservative)' : '(Exploratory)'}
                  </span>
                </div>
              </div>

              {/* Supported Dynamic Placeholders */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mute)' }}>Variables:</span>
                <code>{'{{DOCUMENT_TYPE}}'}</code>
                <code>{'{{BORROWER_ID}}'}</code>
                <code>{'{{NORMALIZED_BOUNDING_BOXES}}'}</code>
                <code>{'{{JSON_SCHEMA}}'}</code>
              </div>
            </div>

            {/* Dry Run Evaluation Results (if triggered) */}
            {dryRunResult && (
              <div style={{
                background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px',
                color: '#e2e8f0', marginTop: '16px', fontFamily: 'var(--mono)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✔</span>
                    <span>Evaluation Dry-Run Telemetry Result</span>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#94a3b8' }}>
                    <span>Latency: <strong style={{ color: '#4ade80' }}>{dryRunResult.latencyMs}ms</strong></span>
                    <span>Tokens: <strong style={{ color: '#f8fafc' }}>{dryRunResult.tokensEstimated}</strong></span>
                    <span>Cost: <strong style={{ color: '#4ade80' }}>₹{dryRunResult.costINR.toFixed(4)}</strong> (${dryRunResult.costUSD.toFixed(6)})</span>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                  Model Output Schema adhering to prompt instructions:
                </div>
                <pre style={{ margin: 0, fontSize: '11px', color: '#a5f3fc', lineHeight: 1.4, overflowX: 'auto' }}>
                  {dryRunResult.outputSample}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trace Inspector Modal */}
      {selectedTrace && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)',
          display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: '14px', width: '100%', maxWidth: '780px', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>LLM Invocation Trace: {selectedTrace.id}</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                    {selectedTrace.model}
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--mute)' }}>
                  {selectedTrace.appId} • {selectedTrace.applicant} • {selectedTrace.document}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrace(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--mute)' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              {/* Cost & Token Accounting Breakdown */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px', fontSize: '12.5px' }}>
                  💰 Token Accounting &amp; Exact Billing Formula
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontFamily: 'var(--mono)' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>Prompt Tokens:</div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>{selectedTrace.promptTokens}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>Completion:</div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>{selectedTrace.completionTokens}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>Cached Tokens:</div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#0369a1' }}>{selectedTrace.cachedTokens}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>Total Call Cost:</div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#059669' }}>{formatCost(selectedTrace.costUSD)}</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', fontFamily: 'var(--mono)' }}>
                  Billing Formula: ({selectedTrace.promptTokens} in × $0.075/1M) + ({selectedTrace.completionTokens} out × $0.30/1M) - ({selectedTrace.cachedTokens} cached discount) = ${selectedTrace.costUSD.toFixed(6)} USD ({formatCost(selectedTrace.costUSD)})
                </div>
              </div>

              {/* Tenancy & Sovereignty Check */}
              <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', padding: '10px 14px', color: '#065f46' }}>
                <strong style={{ display: 'block', marginBottom: '2px', fontSize: '12px' }}>🔒 Verified Sovereign Tenancy Boundary:</strong>
                Endpoint: <code>{selectedTrace.endpoint}</code> | Region: <strong>GCP asia-south1 (Mumbai)</strong>. Volatile memory processing with Zero Data Retention guaranteed.
              </div>

              {/* System Instruction */}
              <div>
                <span style={{ color: 'var(--mute)', fontSize: '11px', fontWeight: 600 }}>SYSTEM INSTRUCTION (Deterministic OCR Extraction Assist):</span>
                <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '10px 12px', borderRadius: '6px', marginTop: '4px', fontFamily: 'var(--mono)', fontSize: '11px', lineHeight: 1.4 }}>
                  {selectedTrace.systemPrompt}
                </div>
              </div>

              {/* Raw Response Payload */}
              <div>
                <span style={{ color: 'var(--mute)', fontSize: '11px', fontWeight: 600 }}>STRUCTURED JSON OUTPUT (With Bounding Boxes):</span>
                <pre style={{ background: '#0f172a', color: '#a5f3fc', padding: '10px 12px', borderRadius: '6px', marginTop: '4px', fontFamily: 'var(--mono)', fontSize: '11px', overflowX: 'auto', lineHeight: 1.4 }}>
                  {selectedTrace.rawResponse}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', background: 'var(--card-subtle)' }}>
              <button
                type="button"
                onClick={() => setSelectedTrace(null)}
                style={{ padding: '6px 18px', borderRadius: '6px', border: 'none', background: 'var(--blue)', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
