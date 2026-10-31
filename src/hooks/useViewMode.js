import { useState, useEffect } from 'react';

/**
 * Custom hook for managing Executive/Analyst view state
 * Preserves view preference in localStorage for session persistence
 */
export function useViewMode() {
  const [viewMode, setViewMode] = useState(() => {
    // Initialize from localStorage or default to 'executive'
    const stored = localStorage.getItem('finvanta-view-mode');
    return stored === 'analyst' ? 'analyst' : 'executive';
  });

  useEffect(() => {
    // Persist view preference
    localStorage.setItem('finvanta-view-mode', viewMode);
  }, [viewMode]);

  const toggleView = () => {
    setViewMode(prev => prev === 'executive' ? 'analyst' : 'executive');
  };

  const setExecutiveView = () => setViewMode('executive');
  const setAnalystView = () => setViewMode('analyst');

  return {
    viewMode,
    isExecutiveView: viewMode === 'executive',
    isAnalystView: viewMode === 'analyst',
    toggleView,
    setExecutiveView,
    setAnalystView
  };
}
