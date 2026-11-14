import React, { useState } from 'react';
import type { SMEApplication, ExtractedFigure, UserRole } from '../../domain/types';
import { SplitView } from '../../components/documents/SplitView';
import { MockBanner } from '../../components/layout/MockBanner';
import { canSyncToSpreading } from '../../domain/rules/signOff';
import { store } from '../../services/store';
import { useToast } from '../../components/ui/Toast';

interface ExtractionReviewProps {
  application: SMEApplication;
  figures: ExtractedFigure[];
  currentRole: UserRole;
  onConfirmFigure: (figId: string) => void;
  onOverrideFigure: (figId: string, val: number, reason: string) => void;
}

export const ExtractionReview: React.FC<ExtractionReviewProps> = ({
  application,
  figures,
  currentRole,
  onConfirmFigure,
  onOverrideFigure
}) => {
  const [selectedFigureId, setSelectedFigureId] = useState<string | null>(figures[0]?.id || null);
  const [overrideModalFig, setOverrideModalFig] = useState<ExtractedFigure | null>(null);
  const [correctedVal, setCorrectedVal] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const { showToast } = useToast();

  const isAnalyst = currentRole === 'Analyst';
  const gate = canSyncToSpreading(figures);
  const totalFigures = figures.length;
  const verifiedFigures = figures.filter(f => f.status === 'Confirmed' || f.status === 'Overridden');
  const verifiedCount = verifiedFigures.length;
  const verifiedPct = totalFigures > 0 ? Math.round((verifiedCount / totalFigures) * 100) : 0;

  const handleOpenOverride = (fig: ExtractedFigure) => {
    setOverrideModalFig(fig);
    setCorrectedVal(String(fig.confirmedValue !== null ? fig.confirmedValue : fig.extractedValue));
    setOverrideReason(fig.overrideReason || '');
  };

  const handleSaveOverride = () => {
    if (!overrideModalFig) return;
    const val = parseFloat(correctedVal);
    if (isNaN(val)) {
      showToast('error', 'Invalid Input', 'Please enter a valid numeric value.');
      return;
    }
    if (!overrideReason || overrideReason.trim().length < 5) {
      showToast('error', 'Policy Guardrail', 'Overriding an extracted figure requires a documented reason of at least 5 characters.');
      return;
    }
    onOverrideFigure(overrideModalFig.id, val, overrideReason.trim());
    setOverrideModalFig(null);
  };

  const handleBulkVerify = () => {
    figures.forEach(fig => {
      if (fig.status === 'Unchecked') {
        onConfirmFigure(fig.id);
      }
    });
    showToast('success', 'Bulk Verification Complete', `All ${totalFigures} figures verified as Analyst.`);
  };

  const handleCommitToSpreading = () => {
    if (!gate.allowed) {
      showToast('warning', 'Gate Locked', gate.message || 'Cannot sync to spreading sheet.');
      return;
    }
    store.syncSpreading('Credit Analyst');
    showToast('success', 'Spreading Sheet Synchronized', '100% verified figures committed to spreading model.');
    store.setScreen('sheet');
  };

  const calcDiff = () => {
    if (!overrideModalFig) return null;
    const original = overrideModalFig.extractedValue;
    const parsed = parseFloat(correctedVal);
    if (isNaN(parsed)) return null;
    const diff = parsed - original;
    const pct = original !== 0 ? ((diff / original) * 100).toFixed(1) : '0';
    return { diff, pct };
  };

  const diffInfo = calcDiff();

  return (
    <div className="screen-container">
      {/* Top Header & Verification Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Model Extraction & Analyst Verification (S4 Pilot)</h2>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--blue-bg)', color: 'var(--blue)' }}>
              Human-in-the-Loop Gate
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--mute)', marginTop: '2px' }}>
            Interactive Split-View for {application.applicant}. Synchronizing with spreading sheet is locked until 100% of figures are verified.
          </p>
        </div>

        {/* Action Controls: Bulk Verify & Commit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAnalyst && verifiedCount < totalFigures && (
            <button
              type="button"
              onClick={handleBulkVerify}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--ok-border)', background: 'var(--ok-bg)',
                color: 'var(--ok-ink)', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              ✔ Quick-Verify All Remaining
            </button>
          )}

          <button
            type="button"
            disabled={!gate.allowed}
            onClick={handleCommitToSpreading}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none',
              background: gate.allowed ? 'var(--ok-ink)' : 'var(--line)',
              color: '#ffffff', fontSize: '13px', fontWeight: 700,
              cursor: gate.allowed ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: gate.allowed ? 'var(--shadow-emerald)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{gate.allowed ? '🔓' : '🔒'}</span>
            <span>Commit to Spreading Sheet {gate.allowed ? '(Ready)' : `(${verifiedPct}%)`}</span>
          </button>
        </div>
      </div>

      {/* Verification Gate Progress Indicator */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '14px 20px', marginBottom: '16px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>
            <span>Analyst Verification Gate: </span>
            <span style={{ color: gate.allowed ? 'var(--ok-ink)' : 'var(--warn-ink)' }}>
              {verifiedCount} of {totalFigures} figures verified ({verifiedPct}%)
            </span>
          </div>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
            background: gate.allowed ? 'var(--ok-bg)' : 'var(--warn-bg)',
            color: gate.allowed ? 'var(--ok-ink)' : 'var(--warn-ink)'
          }}>
            {gate.allowed ? '✔ SPREADING SYNC UNLOCKED' : '🔒 SPREADING SYNC LOCKED'}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--line)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{
            width: `${verifiedPct}%`,
            height: '100%',
            background: gate.allowed ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' : 'linear-gradient(90deg, #3b82f6 0%, #1e56a0 100%)',
            transition: 'width 0.3s ease',
            borderRadius: '9999px'
          }} />
        </div>
      </div>

      <MockBanner message="Mock extraction. Not a live model. No external AI APIs called. Figure verification mandatory." />

      <SplitView
        figures={figures}
        selectedFigureId={selectedFigureId}
        onSelectFigure={setSelectedFigureId}
        onConfirmFigure={onConfirmFigure}
        onOpenOverride={handleOpenOverride}
        canEdit={isAnalyst}
      />

      {/* Override Modal */}
      {overrideModalFig && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)',
          display: 'grid', placeItems: 'center', zIndex: 400, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px',
            boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--line)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Override Extracted Figure</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--mute)' }}>
              Metric: <strong>{overrideModalFig.label}</strong> (Source: Page {overrideModalFig.sourcePage})
            </p>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Model Extracted Value:</label>
              <input
                type="text"
                disabled
                value={`₹ ${overrideModalFig.extractedValue.toLocaleString('en-IN')}`}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card-subtle)', fontFamily: 'var(--mono)', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Corrected Figure (₹):</label>
              <input
                type="number"
                value={correctedVal}
                onChange={e => setCorrectedVal(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card)', fontFamily: 'var(--mono)', fontWeight: 700 }}
              />
              {diffInfo && (
                <div style={{ fontSize: '11.5px', marginTop: '4px', color: diffInfo.diff < 0 ? 'var(--error-ink)' : 'var(--ok-ink)', fontWeight: 600 }}>
                  Variance: {diffInfo.diff >= 0 ? `+₹${diffInfo.diff.toLocaleString('en-IN')}` : `-₹${Math.abs(diffInfo.diff).toLocaleString('en-IN')}`} ({diffInfo.pct}%)
                </div>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Justification Reason (Mandatory, min 5 chars):</label>
                <span style={{ fontSize: '11px', color: overrideReason.trim().length >= 5 ? 'var(--ok-ink)' : 'var(--error-ink)', fontWeight: 600 }}>
                  {overrideReason.trim().length}/5 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                placeholder="e.g. Excluded internal transfer contra entry; verified on page 1."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '12.5px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setOverrideModalFig(null)}
                style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={overrideReason.trim().length < 5}
                onClick={handleSaveOverride}
                style={{
                  padding: '7px 18px', borderRadius: '6px', border: 'none',
                  background: overrideReason.trim().length >= 5 ? 'var(--blue)' : 'var(--line)',
                  color: '#fff', cursor: overrideReason.trim().length >= 5 ? 'pointer' : 'not-allowed',
                  fontSize: '12.5px', fontWeight: 700
                }}
              >
                Save Override & Log Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
