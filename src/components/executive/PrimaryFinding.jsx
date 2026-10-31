import React from 'react';
import { detectPrimaryBottleneck, getBottleneckInsight } from '../../analytics/bottleneckDetector';

/**
 * PrimaryFinding Component
 * Shows the single most important constraint in the system
 * Answers: where is the breakdown?
 */
export function PrimaryFinding({ data }) {
  const bottleneck = detectPrimaryBottleneck(data);
  const insight = getBottleneckInsight(bottleneck);

  if (!bottleneck || !insight) {
    return null;
  }

  const severityStyles = {
    critical: 'bg-red-900 text-white',
    high: 'bg-orange-600 text-white',
    moderate: 'bg-amber-500 text-white',
    low: 'bg-blue-600 text-white'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          Primary Bottleneck
        </h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${severityStyles[bottleneck.severity]}`}>
          {bottleneck.severity}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xl font-semibold text-slate-900 mb-2">
            {insight.finding}
          </p>
          <p className="text-slate-600">
            {(bottleneck.facilitiesLost || 0).toLocaleString()} {bottleneck.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <div className="text-sm text-slate-500 mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold text-slate-900">
              {bottleneck.conversionRate != null && isFinite(bottleneck.conversionRate)
                ? `${Math.round(bottleneck.conversionRate * 100)}%`
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Stage</div>
            <div className="text-lg font-semibold text-slate-900">
              {bottleneck.stage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
