import { formatNumber, safePercent } from '../utils/formatters';

export default function ClaimsProcessingCascade({ data }) {
  const claimsCascade = data?.analytics?.claimsProcessingCascade;

  const stages = [
    {
      label: 'Submitted',
      count: claimsCascade?.stage1_submitted?.count || 0,
      description: 'All claims submitted by facilities',
      denominator: null,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      label: 'Pending Acceptance',
      count: claimsCascade?.stage1a_pending_acceptance?.count || 0,
      description: 'Awaiting initial review and acceptance',
      denominator: claimsCascade?.stage1_submitted?.count || 0,
      denominatorLabel: 'submitted claims',
      isPending: true,
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      label: 'Accepted',
      count: claimsCascade?.stage2_accepted?.count || 0,
      description: 'Passed initial review, proceeding to adjudication',
      denominator: claimsCascade?.stage1_submitted?.count || 0,
      denominatorLabel: 'submitted claims',
      color: 'bg-green-50 border-green-200'
    },
    {
      label: 'Pending Adjudication',
      count: claimsCascade?.stage2a_pending_adjudication?.count || 0,
      description: 'Accepted but awaiting adjudication decision',
      denominator: claimsCascade?.stage2_accepted?.count || 0,
      denominatorLabel: 'accepted claims',
      isPending: true,
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      label: 'Adjudicated',
      count: claimsCascade?.stage3_adjudicated?.count || 0,
      description: 'Reviewed and decision made',
      denominator: claimsCascade?.stage2_accepted?.count || 0,
      denominatorLabel: 'accepted claims',
      color: 'bg-green-50 border-green-200'
    },
    {
      label: 'Approved',
      count: claimsCascade?.stage4_approved?.count || 0,
      description: 'Approved for reimbursement (includes paid and unpaid)',
      denominator: claimsCascade?.stage3_adjudicated?.count || 0,
      denominatorLabel: 'adjudicated claims',
      color: 'bg-green-50 border-green-200'
    },
    {
      label: 'Approved but Unpaid',
      count: claimsCascade?.breakdown?.approvedUnpaid?.count || 0,
      description: 'Approved but payment not yet disbursed',
      denominator: claimsCascade?.stage4_approved?.count || 0,
      denominatorLabel: 'approved claims',
      isSubcategory: true,
      color: 'bg-orange-50 border-orange-200'
    },
    {
      label: 'Paid',
      count: claimsCascade?.stage5_paid?.count || 0,
      description: 'Payment disbursed (full or partial)',
      denominator: claimsCascade?.stage4_approved?.count || 0,
      denominatorLabel: 'approved claims',
      isSubcategory: true,
      color: 'bg-emerald-50 border-emerald-200'
    },
    {
      label: 'Denied',
      count: claimsCascade?.breakdown?.denied?.count || 0,
      description: 'Not approved for reimbursement',
      denominator: claimsCascade?.stage3_adjudicated?.count || 0,
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
