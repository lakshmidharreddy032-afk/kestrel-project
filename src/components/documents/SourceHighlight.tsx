import React from 'react';
import type { ExtractedFigure } from '../../domain/types';

interface SourceHighlightProps {
  figure: ExtractedFigure;
  isSelected: boolean;
  onSelect: (figId: string) => void;
}

export const SourceHighlight: React.FC<SourceHighlightProps> = ({ figure, isSelected, onSelect }) => {
  const { x, y, width, height } = figure.boundingBox;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(figure.id)}
      onKeyDown={e => { if (e.key === 'Enter') onSelect(figure.id); }}
      title={`${figure.label}: ₹${figure.extractedValue.toLocaleString('en-IN')}`}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        border: isSelected ? '2px solid #e11d48' : '2px dashed #1e56a0',
        backgroundColor: isSelected ? 'rgba(225, 29, 72, 0.22)' : 'rgba(30, 86, 160, 0.12)',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.18s ease-in-out',
        zIndex: isSelected ? 10 : 2
      }}
    >
      <span style={{
        position: 'absolute',
        top: '-18px',
        left: '0',
        fontSize: '10px',
        fontWeight: 700,
        background: isSelected ? '#e11d48' : '#1e56a0',
        color: '#ffffff',
        padding: '1px 5px',
        borderRadius: '3px',
        whiteSpace: 'nowrap'
      }}>
        {figure.label.split('(')[0]}
      </span>
    </div>
  );
};
