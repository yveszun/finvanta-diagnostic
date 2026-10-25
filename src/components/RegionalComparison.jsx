import { useState, useMemo } from 'react';
import { formatNumber, safePercent } from '../utils/formatters';

export default function RegionalComparison({ data }) {
  const { regionalComparisons } = data.analytics;
  const [sortField, setSortField] = useState('accreditationRate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedRegion, setSelectedRegion] = useState(null);

  if (!regionalComparisons || !regionalComparisons.byRegion) {
    return (
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Regional Comparison</h2>
        <p className="text-gray-600">Regional data not available</p>
      </div>
    );
  }

  const regionData = useMemo(() => {
    const regions = Object.entries(regionalComparisons.byRegion).map(([name, metrics]) => ({
      name,
      ...metrics
    }));

    // Sort regions
    const sorted = [...regions].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [regionalComparisons.byRegion, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Regional Implementation Comparison</h2>
          <p className="mt-1 text-sm text-gray-600">
            Compare implementation indicators across Philippine regions
          </p>
          <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-sm text-yellow-800">
              <strong>SYNTHETIC PATTERNS:</strong> Geographic differences are simulated and do not represent actual regional performance
            </p>
          </div>
        </div>
        
        <div className="p-6">
          {/* Region selector for detailed view */}
          {selectedRegion && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedRegion.name}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-gray-600">Facilities</dt>
                      <dd className="text-lg font-semibold text-gray-900">{formatNumber(selectedRegion.facilities)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-600">Accredited</dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {formatNumber(selectedRegion.accredited)} ({safePercent(selectedRegion.accredited, selectedRegion.facilities)})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-600">Filing Claims</dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {formatNumber(selectedRegion.filing)} ({safePercent(selectedRegion.filing, selectedRegion.accredited)})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-600">Receiving Payment</dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {formatNumber(selectedRegion.receivingPayment)} ({safePercent(selectedRegion.receivingPayment, selectedRegion.filing)})
                      </dd>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Region</span>
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('facilities')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Facilities</span>
                      <SortIcon field="facilities" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('accreditationRate')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Accred. Rate</span>
                      <SortIcon field="accreditationRate" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('filingRate')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Filing Rate</span>
                      <SortIcon field="filingRate" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('paymentRate')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Payment Rate</span>
                      <SortIcon field="paymentRate" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('claims')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Claims</span>
                      <SortIcon field="claims" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regionData.map((region) => {
                  // Highlight simulated bottleneck regions
                  const isBottleneck = region.accreditationRate < 10 || region.filingRate < 30;
                  const isHighPerformer = region.accreditationRate > 20 && region.filingRate > 45;
                  
                  return (
                    <tr 
                      key={region.name}
                      className={`hover:bg-gray-50 ${isBottleneck ? 'bg-red-50' : isHighPerformer ? 'bg-green-50' : ''}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {region.name}
                        {isBottleneck && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Low
                          </span>
                        )}
                        {isHighPerformer && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            High
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(region.facilities)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {safePercent(region.accredited, region.facilities)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {safePercent(region.filing, region.accredited)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {safePercent(region.receivingPayment, region.filing)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(region.claims)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedRegion(region)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Rate Definitions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Accreditation Rate:</strong> Accredited facilities / Total facilities in region</li>
              <li>• <strong>Filing Rate:</strong> Filing facilities / Accredited facilities in region</li>
              <li>• <strong>Payment Rate:</strong> Facilities receiving payment / Filing facilities in region</li>
            </ul>
          </div>

          {regionalComparisons.limitations && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Important Limitations</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {regionalComparisons.limitations.map((limitation, idx) => (
                  <li key={idx}>• {limitation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
