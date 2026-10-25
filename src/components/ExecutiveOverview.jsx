import { formatNumber, formatCurrency } from '../utils/formatters';

export default function ExecutiveOverview({ data, scenario }) {
  const { summary, metadata } = data;

  const indicators = [
    {
      label: 'Facilities Accredited',
      value: summary.accredited_facilities,
      total: summary.total_facilities,
      description: 'Facilities approved to provide mental health services'
    },
    {
      label: 'Facilities Filing Claims',
      value: summary.facilities_filing_claims,
      total: summary.accredited_facilities,
      description: 'Accredited facilities that have submitted at least one claim'
    },
    {
      label: 'Facilities Receiving Payment',
      value: summary.facilities_receiving_payment,
      total: summary.facilities_filing_claims,
      description: 'Filing facilities that have received at least one payment'
    },
    {
      label: 'Total Claims Submitted',
      value: summary.total_claims,
      description: 'All claims submitted during reporting period'
    },
    {
      label: 'Claims Approved but Unpaid',
      value: summary.approved_but_unpaid,
      total: summary.total_claims,
      description: 'Claims approved for reimbursement but payment not yet disbursed'
    },
    {
      label: 'Total Amount Disbursed',
      value: formatCurrency(summary.total_disbursed),
      description: 'Total reimbursements paid to facilities'
    }
  ];

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Executive Overview</h2>
          <p className="mt-1 text-sm text-gray-600">
            Reporting Period: January 1 - July 15, 2025 • 
            Scenario: <span className="font-medium capitalize">{scenario}</span> Activity
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {indicators.map((indicator, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-600 mb-2">
                  {indicator.label}
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {typeof indicator.value === 'number' ? formatNumber(indicator.value) : indicator.value}
                  {indicator.total && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      / {formatNumber(indicator.total)}
                      <span className="ml-1">
                        ({((indicator.value / indicator.total) * 100).toFixed(1)}%)
                      </span>
                    </span>
                  )}
                </dd>
                <p className="mt-1 text-xs text-gray-500">
                  {indicator.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
