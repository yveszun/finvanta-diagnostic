import { formatNumber, safePercent } from '../utils/formatters';

export default function ClaimsProcessingCascade({ data }) {
  const { claims_cascade } = data;

  const stages = [
    {
      label: 'Submitted',
      count: claims_cascade.submitted,
      description: 'All claims submitted by facilities',
      denominator: null,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      label: 'Pending Acceptance',
      count: claims_cascade.pending_acceptance,
      description: 'Awaiting initial review and acceptance',
      denominator: claims_cascade.submitted,
      denominatorLabel: 'submitted claims',
      isPending: true,
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      label: 'Accepted',
      count: claims_cascade.accepted,
      description: 'Passed initial review, proceeding to adjudication',
      denominator: claims_cascade.submitted,
      denominatorLabel: 'submitted claims',
      color: 'bg-green-50 border-green-200'
    },
    {
      label: 'Pending Adjudication',
      count: claims_cascade.pending_adjudication,
      description: 'Accepted but awaiting adjudication decision',
      denominator: claims_cascade.accepted,
      denominatorLabel: 'accepted claims',
      isPending: true,
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      label: 'Adjudicated',
      count: claims_cascade.adjudicated,
      description: 'Reviewed and decision made',
      denominator: claims_cascade.accepted,
      denominatorLabel: 'accepted claims',
      color: 'bg-green-50 border-green-200'
    },
    {
      label: 'Approved',
      count: claims_cascade.approved,
      description: 'Approved for reimbursement (includes paid and unpaid)',
      denominator: claims_cascade.adjudicated,
      denominatorLabel: 'adjudicated claims',
      color: 'bg-green-50 border-green-200'
    },
    {
      label: 'Approved but Unpaid',
      count: claims_cascade.approved_but_unpaid,
      description: 'Approved but payment not yet disbursed',
      denominator: claims_cascade.approved,
      denominatorLabel: 'approved claims',
      isSubcategory: true,
      color: 'bg-orange-50 border-orange-200'
    },
    {
      label: 'Paid',
      count: claims_cascade.paid,
      description: 'Payment disbursed (full or partial)',
      denominator: claims_cascade.approved,
      denominatorLabel: 'approved claims',
      isSubcategory: true,
      color: 'bg-emerald-50 border-emerald-200'
    },
    {
      label: 'Denied',
      count: claims_cascade.denied,
      description: 'Not approved for reimbursement',
      denominator: claims_cascade.adjudicated,
      denominatorLabel: 'adjudicated claims',
      color: 'bg-red-50 border-red-200'
    }
  ];

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Claims Processing Cascade</h2>
          <p className="mt-1 text-sm text-gray-600">
            Track claims from submission through payment • This is CLAIM COUNTS, not facility counts
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {stages.map((stage, idx) => (
              <div 
                key={idx} 
                className={`border-l-4 ${stage.color} p-4 ${stage.isSubcategory ? 'ml-8' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center">
                      {stage.label}
                      {stage.isPending && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-600">{stage.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(stage.count)}
                    </div>
                    {stage.denominator && (
                      <div className="mt-0.5 text-xs text-gray-600">
                        {safePercent(stage.count, stage.denominator)} of {stage.denominatorLabel}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Important Distinctions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Approved ≠ Paid:</strong> Approval authorizes payment but does not guarantee immediate disbursement</li>
              <li>• <strong>Paid claims:</strong> Includes both fully paid and partially paid claims</li>
              <li>• <strong>Pending categories:</strong> Claims stopped at a specific processing stage</li>
              <li>• <strong>Claim counts:</strong> Number of claims, not number of facilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
