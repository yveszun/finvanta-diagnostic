import React, { useState } from 'react';
import { ExecutiveOverview } from '../ExecutiveOverview';
import { FacilityCascade } from '../FacilityCascade';
import { ClaimsProcessingCascade } from '../ClaimsProcessingCascade';
import { RegionalComparison } from '../RegionalComparison';
import { DiagnosticInsights } from '../DiagnosticInsights';

/**
 * AnalystView Component
 * Preserves ALL Phase 4 analytical components with tabbed organization
 * Non-destructive wrapper: no changes to existing components
 */
export function AnalystView({ data, onScenarioChange }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'cascade', label: 'Facility Cascade', icon: '🏥' },
    { id: 'claims', label: 'Claims Processing', icon: '📋' },
    { id: 'regional', label: 'Regional Analysis', icon: '🗺️' },
    { id: 'insights', label: 'Diagnostic Insights', icon: '💡' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2">
        <nav className="flex gap-1" aria-label="Analyst view sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
              aria-pressed={activeTab === tab.id}
            >
              <span className="mr-2" aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - All Phase 4 Components Preserved */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ExecutiveOverview data={data} />
          </div>
        )}

        {activeTab === 'cascade' && (
          <div className="space-y-6">
            <FacilityCascade data={data} />
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="space-y-6">
            <ClaimsProcessingCascade data={data} />
          </div>
        )}

        {activeTab === 'regional' && (
          <div className="space-y-6">
            <RegionalComparison data={data} />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <DiagnosticInsights 
              data={data} 
              onScenarioChange={onScenarioChange}
            />
          </div>
        )}
      </div>

      {/* Metadata Footer */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>
            <strong>Analyst View:</strong> Complete analytical toolkit with all Phase 4 validated components
          </span>
          <span className="text-slate-500">
            {data?.metadata?.scenario || 'Unknown Scenario'}
          </span>
        </div>
      </div>
    </div>
  );
}
