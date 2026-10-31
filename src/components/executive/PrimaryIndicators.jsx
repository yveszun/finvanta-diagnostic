import React from 'react';
import { getPrimaryIndicators } from '../../utils/summaryGenerator';

/**
 * PrimaryIndicators Component
 * Shows exactly 3 key metrics executives need to monitor
 * Simple status indicators: good/moderate/poor
 */
export function PrimaryIndicators({ data }) {
  const indicators = getPrimaryIndicators(data);

  if (!indicators || indicators.length === 0) {
    return null;
  }

  const statusStyles = {
    good: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    moderate: 'bg-amber-50 border-amber-200 text-amber-700',
    poor: 'bg-red-50 border-red-200 text-red-700'
  };

  const statusIcons = {
    good: '✓',
    moderate: '◐',
    poor: '✗'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        Key Performance Indicators
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicators.map((indicator) => (
          <div
            key={indicator.label}
            className={`rounded-lg border-2 p-4 ${statusStyles[indicator.status]}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold text-sm">
                {indicator.label}
              </div>
              <div className="text-xl" aria-hidden="true">
                {statusIcons[indicator.status]}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {indicator.value}
            </div>
            <div className="text-xs opacity-75">
              {indicator.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
