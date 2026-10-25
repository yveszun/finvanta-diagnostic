import { useState, useEffect } from 'react';
import { evaluateRecommendations } from '../utils/recommendationEngine';

export default function DiagnosticInsights({ data }) {
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationRules, setRecommendationRules] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendationRules();
  }, []);

  useEffect(() => {
    if (recommendationRules && data) {
      const recs = evaluateRecommendations(data, recommendationRules);
      setRecommendations(recs);
    }
  }, [data, recommendationRules]);

  const loadRecommendationRules = async () => {
    try {
      const response = await fetch('/config/recommendationRules.json');
      const rules = await response.json();
      setRecommendationRules(rules);
    } catch (err) {
      console.error('Error loading recommendation rules:', err);
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

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Diagnostic Insights</h2>
        <p className="text-gray-600">No significant bottlenecks identified at this time.</p>
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
          <p className="text-sm text-green-800">
            Implementation metrics appear within expected ranges. Continue monitoring trends.
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
