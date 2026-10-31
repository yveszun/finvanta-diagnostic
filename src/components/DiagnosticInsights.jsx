import { useState, useEffect } from 'react';
import { evaluateRecommendations } from '../utils/recommendationEngine';

export default function DiagnosticInsights({ data }) {
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationRules, setRecommendationRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecommendationRules();
  }, []);

  useEffect(() => {
    if (recommendationRules && data) {
      try {
        const recs = evaluateRecommendations(data, recommendationRules);
        setRecommendations(recs);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error evaluating recommendations:', err);
        setError('Failed to evaluate recommendations. Please check diagnostic configuration.');
        setRecommendations([]);
      }
    }
  }, [data, recommendationRules]);

  const loadRecommendationRules = async () => {
    try {
      // Use import.meta.env.BASE_URL to handle GitHub Pages subdirectory deployment
      const basePath = import.meta.env.BASE_URL || '/';
      const configPath = `${basePath}config/recommendationRules.json`;
      
      const response = await fetch(configPath);
      
      // CHECK: Verify HTTP response status
      if (!response.ok) {
        throw new Error(`Failed to load recommendation rules: HTTP ${response.status} ${response.statusText}`);
      }
      
      // CHECK: Verify content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Recommendation rules file is not valid JSON');
      }
      
      const rules = await response.json();
      
      // CHECK: Verify rules structure
      if (!rules || !rules.rules || !Array.isArray(rules.rules)) {
        throw new Error('Invalid recommendation rules structure: missing or malformed rules array');
      }
      
      setRecommendationRules(rules);
      setError(null);
    } catch (err) {
      console.error('Error loading recommendation rules:', err);
      setError(`Failed to load diagnostic rules: ${err.message}`);
      setRecommendationRules(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Diagnostic Insights</h2>
        <p className="text-gray-600">Loading recommendations...</p>
      </div>
    );
  }

  // CRITICAL: Display error state - diagnostic engine failure must not be presented as success
  if (error || !recommendationRules) {
    return (
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Diagnostic Insights</h2>
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Diagnostic Engine Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'Failed to load recommendation rules. Diagnostic insights unavailable.'}</p>
                <p className="mt-2 text-xs">
                  This does not indicate successful implementation performance. The diagnostic system failed to load.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DISTINCTION: Empty valid recommendations (evaluated successfully) vs failed evaluation
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Diagnostic Insights</h2>
        <p className="text-gray-600">No significant bottlenecks identified at this time.</p>
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
          <p className="text-sm text-green-800">
            Implementation metrics appear within expected ranges. Continue monitoring trends.
          </p>
          <p className="mt-2 text-xs text-green-700">
            Note: This indicates successful diagnostic evaluation with no critical findings, not a system error.
          </p>
        </div>
      </div>
    );
  }

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-400 text-red-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-400 text-yellow-900';
      case 'success':
        return 'bg-green-50 border-green-400 text-green-900';
      default:
        return 'bg-gray-50 border-gray-400 text-gray-900';
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-blue-100 text-blue-800'
    };
    return styles[priority] || 'bg-gray-100 text-gray-800';
  };

  // Sort by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Diagnostic Insights</h2>
          <p className="mt-1 text-sm text-gray-600">
            Rules-based analysis of implementation bottlenecks and suggested investigations
          </p>
        </div>
        
        {recommendationRules && recommendationRules.disclaimer && (
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
            <p className="text-xs text-yellow-900">
              <strong>⚠️ {recommendationRules.thresholdWarning}</strong>
            </p>
            <p className="mt-1 text-xs text-yellow-800">
              {recommendationRules.disclaimer}
            </p>
          </div>
        )}
        
        <div className="p-6 space-y-6">
          {sortedRecommendations.map((rec, idx) => (
            <div 
              key={rec.id}
              className={`border-l-4 ${getSeverityStyle(rec.severity)} rounded-lg p-6`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority} PRIORITY
                    </span>
                    <span className="text-sm text-gray-600">
                      {rec.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rec.observedFinding}
                  </h3>
                </div>
              </div>

              {/* Supporting Indicator */}
              <div className="mb-4">
                <dt className="text-sm font-medium text-gray-700 mb-1">Supporting Indicator</dt>
                <dd className="text-sm text-gray-900">{rec.supportingIndicator}</dd>
              </div>

              {/* Possible Explanation */}
              <div className="mb-4 p-3 bg-white bg-opacity-50 rounded">
                <dt className="text-sm font-medium text-gray-700 mb-1">Possible Explanation</dt>
                <dd className="text-sm text-gray-900 italic">{rec.potentialExplanation}</dd>
              </div>

              {/* Evidence Limitations */}
              <div className="mb-4 p-3 bg-white bg-opacity-50 rounded border border-gray-200">
                <dt className="text-sm font-semibold text-gray-900 mb-1">⚠️ Evidence Limitations</dt>
                <dd className="text-sm text-gray-700">{rec.evidenceLimitations}</dd>
              </div>

              {/* Suggested Investigation */}
              <div className="mb-4">
                <dt className="text-sm font-medium text-gray-700 mb-1">Suggested Investigation</dt>
                <dd className="text-sm text-gray-900">{rec.suggestedInvestigation}</dd>
              </div>

              {/* Possible Institutional Decisions */}
              <div className="mb-4">
                <dt className="text-sm font-medium text-gray-700 mb-1">Potential Operational Response</dt>
                <dd className="text-sm text-gray-900">{rec.possibleInstitutionalDecisions}</dd>
              </div>

              {/* Threshold Information */}
              {rec.threshold && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong className="text-yellow-800">{rec.threshold.label}:</strong>{' '}
                    {rec.threshold.note || rec.threshold.source}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Analytical Notes */}
        {recommendationRules && recommendationRules.analyticalNotes && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Analytical Framework Notes</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {recommendationRules.analyticalNotes.map((note, idx) => (
                <li key={idx}>• {note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
