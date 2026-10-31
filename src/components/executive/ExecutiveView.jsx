import React from 'react';
import { ExecutiveHeadline } from './ExecutiveHeadline';
import { PrimaryFinding } from './PrimaryFinding';
import { SimplifiedCascade } from './SimplifiedCascade';
import { PrimaryIndicators } from './PrimaryIndicators';
import { NextInvestigation } from './NextInvestigation';

/**
 * ExecutiveView Component
 * Orchestrates executive dashboard layout
 * Goal: Answer 3 questions in 30 seconds
 */
export function ExecutiveView({ data }) {
  return (
    <div className="space-y-6">
      {/* Dynamic Headline - What's Working? */}
      <ExecutiveHeadline data={data} />

      {/* Primary Bottleneck - Where's the Breakdown? */}
      <PrimaryFinding data={data} />

      {/* Key Indicators */}
      <PrimaryIndicators data={data} />

      {/* Simplified Cascade - Visual Flow */}
      <SimplifiedCascade data={data} />

      {/* Investigation Recommendation - What to Do Next? */}
      <NextInvestigation data={data} />

      {/* Context Footer */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>
            <strong>Executive View:</strong> Designed for rapid decision-making. Switch to Analyst View for detailed metrics.
          </span>
          <span className="text-slate-500">
            {data?.metadata?.scenario || 'Current Scenario'}
          </span>
        </div>
      </div>
    </div>
  );
}
