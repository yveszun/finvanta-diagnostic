import { useState, useEffect } from 'react';
import './App.css';
import ExecutiveOverview from './components/ExecutiveOverview';
import FacilityCascade from './components/FacilityCascade';
import ClaimsProcessingCascade from './components/ClaimsProcessingCascade';
import RegionalComparison from './components/RegionalComparison';
import DiagnosticInsights from './components/DiagnosticInsights';
import SyntheticDataNotice from './components/SyntheticDataNotice';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

function App() {
  const [scenario, setScenario] = useState('moderate');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScenarioData(scenario);
  }, [scenario]);

  const loadScenarioData = async (selectedScenario) => {
    setLoading(true);
    setError(null);
    
    try {
      // Load analytics data for the selected scenario
      const response = await fetch(`/outputs/phase3_analytics/${selectedScenario}_bottleneck_mix_analytics.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load analytics data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading scenario data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SyntheticDataNotice />
      
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">
            Finvanta Health Benefit Implementation Diagnostic
          </h1>
          <p className="mt-2 text-blue-100">
            Identify implementation bottlenecks in mental health benefit rollout
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scenario Selector */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <label htmlFor="scenario-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Implementation Scenario
          </label>
          <select
            id="scenario-select"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low Activity (5% accreditation, ~150 claims)</option>
            <option value="moderate">Moderate Activity (15% accreditation, ~600 claims)</option>
            <option value="high">High Activity (35% accreditation, ~2000 claims)</option>
          </select>
        </div>

        {analyticsData && (
          <>
            <ExecutiveOverview data={analyticsData} scenario={scenario} />
            
            <FacilityCascade data={analyticsData} />
            
            <ClaimsProcessingCascade data={analyticsData} />
            
            <RegionalComparison data={analyticsData} />
            
            <DiagnosticInsights data={analyticsData} />
          </>
        )}
      </main>

      <footer className="bg-gray-800 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm">
            Finvanta Health Benefit Diagnostic • Phase 4 MVP • Synthetic Data Only
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
