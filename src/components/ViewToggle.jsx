import React from 'react';

/**
 * ViewToggle Component
 * Enables switching between Executive and Analyst views
 * Design: Professional segmented control with active state indicators
 */
export function ViewToggle({ viewMode, onToggle }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      <button
        onClick={() => viewMode !== 'executive' && onToggle()}
        className={`
          px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
          ${viewMode === 'executive'
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
          }
        `}
        aria-pressed={viewMode === 'executive'}
        aria-label="Switch to Executive View"
      >
        Executive View
      </button>
      <button
        onClick={() => viewMode !== 'analyst' && onToggle()}
        className={`
          px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
          ${viewMode === 'analyst'
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
          }
        `}
        aria-pressed={viewMode === 'analyst'}
        aria-label="Switch to Analyst View"
      >
        Analyst View
      </button>
    </div>
  );
}
