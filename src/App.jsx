import { useState, useEffect } from 'react';
import './App.css';
import { useViewMode } from './hooks/useViewMode';
import { ViewToggle } from './components/ViewToggle';
import { ExecutiveView } from './components/executive/ExecutiveView';
import { AnalystView } from './components/analyst/AnalystView';
import SyntheticDataNotice from './components/SyntheticDataNotice';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

function App() {
  const [scenario, setScenario] = useState('moderate');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { viewMode, toggleView } = useViewMode();

  useEffect(() => {
    // Create AbortController for this request
    const abortController = new AbortController();
    
    loadScenarioData(scenario, abortController.signal);
    
    // Cleanup function to abort on unmount or scenario change
    return () => {
      abortController.abort();
    };
  }, [scenario]);

  const loadScenarioData = async (selectedScenario, signal) => {
    setLoading(true);
    setError(null);
    
    try {
      // Load analytics data for the selected scenario
      // Use import.meta.env.BASE_URL to handle GitHub Pages subdirectory deployment
      const basePath = import.meta.env.BASE_URL || '/';
      const dataPath = `${basePath}outputs/phase3_analytics/${selectedScenario}_bottleneck_mix_analytics.json`;
      
      const response = await fetch(dataPath, { signal });
      
      if (!response.ok) {
        throw new Error(`Failed to load analytics data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate analytics data structure before setting state
      if (!data.analytics || !data.analytics.facilityParticipationCascade) {
        throw new Error('Invalid analytics data structure');
      }
      
      // Only update state if the request wasn't aborted
      if (!signal.aborted) {
        setAnalyticsData(data);
      }
    } catch (err) {
      // Don't set error if request was aborted (normal scenario change)
      if (err.name !== 'AbortError' && !signal.aborted) {
        console.error('Error loading scenario data:', err);
        setError(err.message);
      }
    } finally {
      // Only update loading state if not aborted
      if (!signal.aborted) {
        setLoading(false);
      }
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
      
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  Finvanta Health Diagnostic
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 text-gray-900">
                  PROTOTYPE
                </span>
              </div>
              <p className="mt-2 text-indigo-100">
                Executive intelligence platform for mental health benefit implementation
              </p>
            </div>
            <ViewToggle viewMode={viewMode} onToggle={toggleView} />
          </div>
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
            {viewMode === 'executive' ? (
              <ExecutiveView data={analyticsData} />
            ) : (
              <AnalystView 
                data={analyticsData} 
                onScenarioChange={setScenario}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-slate-800 text-slate-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm">
            Finvanta Health Diagnostic • Phase 4.1 Executive UX • Synthetic Data Only
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
