import React from 'react';
import { detectPrimaryBottleneck } from '../../analytics/bottleneckDetector';
import { generateInvestigationSuggestion } from '../../utils/summaryGenerator';

/**
 * NextInvestigation Component
 * Single, clear call-to-action for executive decision-making
 * Answers: what should I investigate next?
 */
export function NextInvestigation({ data }) {
  const bottleneck = detectPrimaryBottleneck(data);
  const suggestion = generateInvestigationSuggestion(bottleneck, data);

  if (!suggestion) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
            🔍
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">
            Recommended Next Step
          </h2>
          <p className="text-xl font-bold mb-3">
            {suggestion.action}
          </p>
          <p className="text-sm opacity-90 mb-4">
            {suggestion.context}
          </p>
          {suggestion.dataSource && (
            <div className="bg-white/10 rounded-lg px-4 py-2 text-sm">
              <span className="font-semibold">Data to review:</span> {suggestion.dataSource}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
