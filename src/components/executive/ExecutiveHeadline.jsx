import React from 'react';
import { generateExecutiveSummary } from '../../utils/summaryGenerator';

/**
 * ExecutiveHeadline Component
 * Dynamic headline summarizing overall system performance
 * Shows answer in 5 seconds: what's working, what's the status
 */
export function ExecutiveHeadline({ data }) {
  const summary = generateExecutiveSummary(data);

  if (!summary) {
    return null;
  }

  const statusStyles = {
    healthy: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    moderate: 'bg-amber-50 border-amber-200 text-amber-900',
    concerning: 'bg-orange-50 border-orange-200 text-orange-900',
    critical: 'bg-red-50 border-red-200 text-red-900'
  };

  const statusIcons = {
    healthy: '✓',
    moderate: '◐',
    concerning: '◑',
    critical: '⚠'
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${statusStyles[summary.overallHealth]}`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl" aria-hidden="true">
          {statusIcons[summary.overallHealth]}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">
            {summary.headline}
          </h1>
          <div className="flex items-center gap-6 text-sm font-medium opacity-80">
            <span>
              System Health: <span className="font-bold capitalize">{summary.overallHealth}</span>
            </span>
            <span>
              Utilization: <span className="font-bold">
                {summary.utilizationRate != null && isFinite(summary.utilizationRate)
                  ? `${Math.round(summary.utilizationRate * 100)}%`
                  : 'N/A'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
