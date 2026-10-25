export default function SyntheticDataNotice() {
  return (
    <div className="bg-yellow-50 border-b-2 border-yellow-400 p-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-yellow-900">
              SYNTHETIC DEMONSTRATION DATA — NOT ACTUAL PHILHEALTH PERFORMANCE
            </p>
            <p className="mt-1 text-xs text-yellow-800">
              All data, facilities, claims, and regional patterns are entirely fabricated for diagnostic tool development. 
              Reporting period: January 1 - July 15, 2025 23:59:59 UTC (Analysis Cutoff).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
