import { formatNumber, safePercent } from '../utils/formatters';

export default function FacilityCascade({ data }) {
  const { summary } = data;

  const stages = [
    {
      label: 'Eligible Facilities',
      count: summary.total_facilities,
      description: 'All facilities in the network',
      denominator: null
    },
    {
      label: 'Accredited Facilities',
      count: summary.accredited_facilities,
      description: 'Facilities approved to provide mental health services',
      denominator: summary.total_facilities,
      denominatorLabel: 'eligible facilities'
    },
    {
      label: 'Facilities Filing Claims',
      count: summary.facilities_filing_claims,
      description: 'Accredited facilities that submitted at least one claim',
      denominator: summary.accredited_facilities,
      denominatorLabel: 'accredited facilities'
    },
    {
      label: 'Facilities Receiving Payment',
      count: summary.facilities_receiving_payment,
      description: 'Filing facilities that received at least one payment',
      denominator: summary.facilities_filing_claims,
      denominatorLabel: 'filing facilities'
    }
  ];

  // Identify largest drop
  const conversions = stages.slice(1).map((stage, idx) => ({
    from: stages[idx].label,
    to: stage.label,
    rate: stage.denominator ? (stage.count / stage.denominator) * 100 : 100
  }));
  
  const lowestConversion = conversions.reduce((min, curr) => 
    curr.rate < min.rate ? curr : min
  );

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Facility Implementation Cascade</h2>
          <p className="mt-1 text-sm text-gray-600">
            Track facility participation from eligibility through payment receipt
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const conversionRate = stage.denominator 
                ? (stage.count / stage.denominator) * 100 
                : null;
              
              const isLowestConversion = stage.denominator && 
                conversionRate <= lowestConversion.rate && 
                lowestConversion.to === stage.label;

              return (
                <div key={idx}>
                  <div className={`relative ${isLowestConversion ? 'ring-2 ring-red-400 rounded-lg' : ''}`}>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            {stage.label}
                            {isLowestConversion && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Largest Drop
                              </span>
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">{stage.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold text-blue-900">
                            {formatNumber(stage.count)}
                          </div>
                          {stage.denominator && (
                            <div className="mt-1 text-sm text-gray-600">
                              {safePercent(stage.count, stage.denominator)} of {stage.denominatorLabel}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {idx < stages.length - 1 && (
                    <div className="flex justify-center my-2">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Denominator Definitions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Accreditation rate:</strong> Accredited / Total eligible facilities</li>
              <li>• <strong>Claims filing rate:</strong> Filing / Accredited facilities</li>
              <li>• <strong>Payment receipt rate:</strong> Receiving payment / Filing facilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
