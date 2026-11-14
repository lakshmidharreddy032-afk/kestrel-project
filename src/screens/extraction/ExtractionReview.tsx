import React, { useState } from 'react';
import type { SMEApplication, ExtractedFigure, UserRole } from '../../domain/types';
import { SplitView } from '../../components/documents/SplitView';
import { MockBanner } from '../../components/layout/MockBanner';

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

  const isAnalyst = currentRole === 'Analyst';

  const handleOpenOverride = (fig: ExtractedFigure) => {
    setOverrideModalFig(fig);
    setCorrectedVal(String(fig.confirmedValue !== null ? fig.confirmedValue : fig.extractedValue));
    setOverrideReason(fig.overrideReason || '');
  };

  const handleSaveOverride = () => {
    if (!overrideModalFig) return;
    const val = parseFloat(correctedVal);
    if (isNaN(val)) {
      alert('Please enter a valid numeric value.');
      return;
    }
    if (!overrideReason || overrideReason.trim().length < 5) {
      alert('Hard Rule: Overriding an extracted figure requires a documented reason (at least 5 characters).');
      return;
    }
    onOverrideFigure(overrideModalFig.id, val, overrideReason.trim());
    setOverrideModalFig(null);
  };

  return (
    <div className="screen-container">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Extraction with Source Pages (S4 Pilot)</h2>
        <p style={{ fontSize: '13px', color: 'var(--mute)' }}>
          Review figures extracted from {application.applicant}&apos;s bank statements and GST returns.
        </p>
      </div>

      <MockBanner message="Mock extraction. Not a live model. No external AI APIs called. All figures must be confirmed by an analyst." />

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
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)',
          display: 'grid', placeItems: 'center', zIndex: 300, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px',
            boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Override Extracted Figure</h3>
            <p style={{ fontSize: '12px', color: 'var(--mute)' }}>
              Metric: <strong>{overrideModalFig.label}</strong> (Source: Page {overrideModalFig.sourcePage})
            </p>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Extracted Value:</label>
              <input
                type="text"
                disabled
                value={`₹ ${overrideModalFig.extractedValue.toLocaleString('en-IN')}`}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card-subtle)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Corrected Figure (₹):</label>
              <input
                type="number"
                value={correctedVal}
                onChange={e => setCorrectedVal(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Justification Reason (Mandatory, min 5 chars):</label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                placeholder="e.g. Excluded internal transfer contra entry; verified on page 1."
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--card)', fontSize: '12.5px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setOverrideModalFig(null)}
                style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOverride}
                style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: 'var(--blue)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
              >
                Save Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
