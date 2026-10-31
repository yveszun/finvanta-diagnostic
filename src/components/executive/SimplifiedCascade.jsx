import React from 'react';

/**
 * SimplifiedCascade Component
 * Clean visual flow showing 4-stage participation funnel
 * Reduced complexity: numbers + percentages only, no deep metrics
 */
export function SimplifiedCascade({ data }) {
  if (!data?.analytics?.facilityParticipationCascade) {
    return null;
  }

  const cascade = data.analytics.facilityParticipationCascade;

  // Extract counts from nested objects (Phase 4 data structure)
  const eligible = cascade.stage1_eligible?.count || 0;
  const accredited = cascade.stage2_accredited?.count || 0;
  const claiming = cascade.stage3_claiming?.count || 0;
  const receivingPayment = cascade.stage4_receiving_payment?.count || 0;

  const stages = [
    {
      label: 'Eligible',
      count: eligible,
      percent: 100,
      color: 'bg-indigo-100 text-indigo-700'
    },
    {
      label: 'Accredited',
      count: accredited,
      percent: eligible > 0 ? Math.round((accredited / eligible) * 100) : 0,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      label: 'Claiming',
      count: claiming,
      percent: eligible > 0 ? Math.round((claiming / eligible) * 100) : 0,
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      label: 'Receiving Payment',
      count: receivingPayment,
      percent: eligible > 0 ? Math.round((receivingPayment / eligible) * 100) : 0,
      color: 'bg-green-100 text-green-700'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-6">
        Facility Participation Flow
      </h2>

      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div key={stage.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700">{stage.label}</span>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-slate-900">
                  {stage.count.toLocaleString()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${stage.color}`}>
                  {stage.percent}%
                </span>
              </div>
            </div>
            
            {/* Visual bar */}
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${stage.color.replace('text-', 'bg-').replace('100', '500')}`}
                style={{ width: `${stage.percent}%` }}
                aria-label={`${stage.percent}% of facilities`}
              />
            </div>

            {/* Arrow connector (except for last stage) */}
            {index < stages.length - 1 && (
              <div className="flex justify-center py-1">
                <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
