import React, { useState } from 'react';
import type { ExtractedFigure } from '../../domain/types';
import { SourceHighlight } from './SourceHighlight';

interface SplitViewProps {
  figures: ExtractedFigure[];
  selectedFigureId: string | null;
  onSelectFigure: (figId: string) => void;
  onConfirmFigure?: (figId: string) => void;
  onOpenOverride?: (fig: ExtractedFigure) => void;
  canEdit?: boolean;
}

export const SplitView: React.FC<SplitViewProps> = ({
  figures,
  selectedFigureId,
  onSelectFigure,
  onConfirmFigure,
  onOpenOverride,
  canEdit = false
}) => {
  const [docType, setDocType] = useState<'bank' | 'gst'>('bank');
  const [zoom, setZoom] = useState<number>(100);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [tableFilter, setTableFilter] = useState<'all' | 'unchecked' | 'verified'>('all');

  const pageNumber = docType === 'bank' ? 1 : 2;
  const pageFigures = figures.filter(f => f.sourcePage === pageNumber);

  const filteredFigures = figures.filter(f => {
    if (tableFilter === 'unchecked') return f.status === 'Unchecked';
    if (tableFilter === 'verified') return f.status === 'Confirmed' || f.status === 'Overridden';
    return true;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(460px, 1.25fr) minmax(380px, 1fr)', gap: '20px' }}>
      
      {/* Left Pane: Rendered Mock Statement with Interactive Bounding Boxes */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '16px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>
              {docType === 'bank' ? 'HDFC Bank Current Account Statement' : 'Government of India — GST Return (GSTR-3B)'}
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--mute)' }}>
              {docType === 'bank' ? 'Period: May 2026 – Oct 2026 • Page 1 of 1' : 'Annual Consolidated Filing • Nov 2025 – Oct 2026'}
            </span>
          </div>

          {/* Document & Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', background: 'var(--card-subtle)', borderRadius: '6px', border: '1px solid var(--line)', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setDocType('bank')}
                style={{
                  padding: '4px 8px', fontSize: '11px', fontWeight: docType === 'bank' ? 700 : 500, borderRadius: '4px',
                  border: 'none', background: docType === 'bank' ? 'var(--blue)' : 'transparent',
                  color: docType === 'bank' ? '#fff' : 'var(--ink)', cursor: 'pointer'
                }}
              >
                Bank Statement
              </button>
              <button
                type="button"
                onClick={() => setDocType('gst')}
                style={{
                  padding: '4px 8px', fontSize: '11px', fontWeight: docType === 'gst' ? 700 : 500, borderRadius: '4px',
                  border: 'none', background: docType === 'gst' ? 'var(--blue)' : 'transparent',
                  color: docType === 'gst' ? '#fff' : 'var(--ink)', cursor: 'pointer'
                }}
              >
                GSTR-3B
              </button>
            </div>

            {/* Zoom Buttons */}
            <div style={{ display: 'flex', gap: '2px' }}>
              <button
                type="button"
                title="Zoom Out"
                onClick={() => setZoom(z => Math.max(80, z - 10))}
                style={{ padding: '3px 7px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer' }}
              >
                -
              </button>
              <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', padding: '3px 4px', color: 'var(--mute)' }}>{zoom}%</span>
              <button
                type="button"
                title="Zoom In"
                onClick={() => setZoom(z => Math.min(130, z + 10))}
                style={{ padding: '3px 7px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer' }}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowBoxes(!showBoxes)}
              style={{
                padding: '4px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '6px',
                border: '1px solid var(--line)', background: showBoxes ? 'var(--ok-bg)' : 'var(--card)',
                color: showBoxes ? 'var(--ok-ink)' : 'var(--mute)', cursor: 'pointer'
              }}
            >
              {showBoxes ? 'Boxes: ON' : 'Boxes: OFF'}
            </button>
          </div>
        </div>

        {/* Document Rendering Surface */}
        <div style={{
          position: 'relative', width: '100%', height: '500px', background: '#fdfdfd', border: '1px solid #d1d5db',
          borderRadius: '8px', padding: '16px', fontFamily: 'var(--mono)', fontSize: '11.5px', color: '#1f2937', overflow: 'auto',
          transform: `scale(${zoom / 100})`, transformOrigin: 'top left', transition: 'transform 0.15s ease'
        }}>
          {docType === 'bank' ? (
            <div>
              <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '6px', marginBottom: '10px' }}>
                <strong style={{ fontSize: '13px', color: '#1e3a8a' }}>HDFC BANK LIMITED — CURRENT ACCOUNT STATEMENT</strong><br/>
                <span style={{ fontSize: '10.5px', color: '#4b5563' }}>Account: 50200084729104 | IFSC: HDFC0001092 | Branch: Industrial Area, Hyderabad</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#f3f4f6', padding: '8px', borderRadius: '4px', marginBottom: '12px' }}>
                <div><strong>Period:</strong> 01/05/2026 to 31/10/2026</div>
                <div><strong>Currency:</strong> INR (₹)</div>
                <div><strong>Total Credits:</strong> ₹ 84,50,000</div>
                <div><strong>Total Debits:</strong> ₹ 78,20,000</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #9ca3af', background: '#e5e7eb' }}>
                    <th style={{ padding: '4px' }}>Date</th>
                    <th style={{ padding: '4px' }}>Description</th>
                    <th style={{ padding: '4px' }}>Chq/Ref</th>
                    <th style={{ padding: '4px', textAlign: 'right' }}>Credit</th>
                    <th style={{ padding: '4px', textAlign: 'right' }}>Debit</th>
                    <th style={{ padding: '4px', textAlign: 'right' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>02/05/26</td><td>NEFT Inward - Malabar Spices</td><td>N92810</td><td style={{ textAlign: 'right' }}>₹ 14,20,000</td><td>-</td><td style={{ textAlign: 'right' }}>₹ 18,50,000</td></tr>
                  <tr><td>18/06/26</td><td>RTGS Inward - Bulk Agro Buyers</td><td>R44102</td><td style={{ textAlign: 'right' }}>₹ 22,00,000</td><td>-</td><td style={{ textAlign: 'right' }}>₹ 25,40,000</td></tr>
                  <tr><td>31/07/26</td><td>Vendor Payouts - Operations</td><td>CMS812</td><td>-</td><td style={{ textAlign: 'right' }}>₹ 12,80,000</td><td style={{ textAlign: 'right' }}>₹ 12,60,000</td></tr>
                  <tr><td>31/10/26</td><td>Month End Calculated AMB</td><td>SYS-INT</td><td>-</td><td>-</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ 4,85,000</td></tr>
                  <tr><td>31/10/26</td><td>Inward ECS / Cheque Dishonour</td><td>RTN-00</td><td>-</td><td>-</td><td style={{ textAlign: 'right' }}>0 Returns</td></tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <div style={{ borderBottom: '2px solid #065f46', paddingBottom: '6px', marginBottom: '10px' }}>
                <strong style={{ fontSize: '13px', color: '#065f46' }}>FORM GSTR-3B — GOVERNMENT OF INDIA</strong><br/>
                <span style={{ fontSize: '10.5px', color: '#4b5563' }}>GSTIN: 36AAACM8492Q1ZT | Legal Name: Malabar Spices & Agro LLP</span>
              </div>
              <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '4px', marginBottom: '12px' }}>
                <strong>Table 3.1: Details of Outward Supplies & Inward Supplies Liable to Reverse Charge</strong>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #9ca3af', background: '#e5e7eb' }}>
                    <th style={{ padding: '4px' }}>Nature of Supply</th>
                    <th style={{ padding: '4px', textAlign: 'right' }}>Total Taxable Value</th>
                    <th style={{ padding: '4px', textAlign: 'right' }}>IGST</th>
                    <th style={{ padding: '4px', textAlign: 'right' }}>CGST</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#fff' }}>
                    <td>(a) Outward taxable supplies (other than zero rated)</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#065f46' }}>₹ 1,62,00,000</td>
                    <td style={{ textAlign: 'right' }}>₹ 8,10,000</td>
                    <td style={{ textAlign: 'right' }}>₹ 4,05,000</td>
                  </tr>
                  <tr>
                    <td>(b) Outward taxable supplies (zero rated)</td>
                    <td style={{ textAlign: 'right' }}>₹ 0</td>
                    <td style={{ textAlign: 'right' }}>₹ 0</td>
                    <td style={{ textAlign: 'right' }}>₹ 0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Interactive Bounding Box Highlights Layer */}
          {showBoxes && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}>
              {pageFigures.map(fig => (
                <SourceHighlight
                  key={fig.id}
                  figure={fig}
                  isSelected={fig.id === selectedFigureId}
                  onSelect={onSelectFigure}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Extracted Figure Table */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', padding: '16px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Extracted Figures Table</h4>
            <p style={{ fontSize: '11.5px', color: 'var(--mute)' }}>
              Cross-reference coordinates on source document.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'var(--card-subtle)', padding: '2px', borderRadius: '6px', border: '1px solid var(--line)' }}>
            <button
              type="button"
              onClick={() => setTableFilter('all')}
              style={{
                padding: '3px 8px', fontSize: '10.5px', borderRadius: '4px', border: 'none',
                background: tableFilter === 'all' ? 'var(--blue)' : 'transparent',
                color: tableFilter === 'all' ? '#fff' : 'var(--ink)', cursor: 'pointer', fontWeight: 600
              }}
            >
              All ({figures.length})
            </button>
            <button
              type="button"
              onClick={() => setTableFilter('unchecked')}
              style={{
                padding: '3px 8px', fontSize: '10.5px', borderRadius: '4px', border: 'none',
                background: tableFilter === 'unchecked' ? 'var(--warn-ink)' : 'transparent',
                color: tableFilter === 'unchecked' ? '#fff' : 'var(--ink)', cursor: 'pointer', fontWeight: 600
              }}
            >
              Unchecked ({figures.filter(f => f.status === 'Unchecked').length})
            </button>
            <button
              type="button"
              onClick={() => setTableFilter('verified')}
              style={{
                padding: '3px 8px', fontSize: '10.5px', borderRadius: '4px', border: 'none',
                background: tableFilter === 'verified' ? 'var(--ok-ink)' : 'transparent',
                color: tableFilter === 'verified' ? '#fff' : 'var(--ink)', cursor: 'pointer', fontWeight: 600
              }}
            >
              Verified ({figures.filter(f => f.status !== 'Unchecked').length})
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left', color: 'var(--mute)' }}>
                <th style={{ padding: '8px' }}>Metric</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Value</th>
                <th style={{ padding: '8px' }}>Conf.</th>
                <th style={{ padding: '8px' }}>Status</th>
                {canEdit && <th style={{ padding: '8px', textAlign: 'center' }}>Analyst Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredFigures.map(fig => {
                const isSelected = fig.id === selectedFigureId;
                const statusColor = fig.status === 'Confirmed' ? 'var(--ok-ink)' : fig.status === 'Overridden' ? 'var(--purple-ink)' : 'var(--warn-ink)';
                const statusBg = fig.status === 'Confirmed' ? 'var(--ok-bg)' : fig.status === 'Overridden' ? 'var(--purple-bg)' : 'var(--warn-bg)';
                const confScore = fig.confidence ?? fig.confidenceScore ?? 0.95;

                return (
                  <tr
                    key={fig.id}
                    onClick={() => {
                      onSelectFigure(fig.id);
                      setDocType(fig.sourcePage === 1 ? 'bank' : 'gst');
                    }}
                    style={{
                      borderBottom: '1px solid var(--line)',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--blue-light)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '8px' }}>
                      <div style={{ fontWeight: 600 }}>{fig.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--mute)' }}>Page {fig.sourcePage} • {fig.fieldKey}</div>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700 }}>
                      ₹{fig.confirmedValue !== null ? fig.confirmedValue.toLocaleString('en-IN') : fig.extractedValue.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--mute)' }}>
                        {(confScore * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: statusBg, color: statusColor }}>
                        {fig.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            title="Confirm Extracted Figure"
                            onClick={(e) => { e.stopPropagation(); onConfirmFigure?.(fig.id); }}
                            style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--ok-border)', background: 'var(--ok-bg)', color: 'var(--ok-ink)', cursor: 'pointer', fontWeight: 700 }}
                          >
                            ✔ Accept
                          </button>
                          <button
                            type="button"
                            title="Override Figure with Justification"
                            onClick={(e) => { e.stopPropagation(); onOpenOverride?.(fig); }}
                            style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--purple-border)', background: 'var(--purple-bg)', color: 'var(--purple-ink)', cursor: 'pointer', fontWeight: 700 }}
                          >
                            ✎ Edit
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
