'use client';

import React from 'react';
import { SearchX, Inbox, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-matches' | 'no-complaints';
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onReset }) => {
  if (type === 'no-matches') {
    return (
      <div className="py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">
          No matching complaints found
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
          Try adjusting your search terms, changing the category, or clearing status filters.
        </p>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">
        No complaints recorded yet
      </h3>
      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
        Use the submission form above to register a new student complaint.
      </p>
    </div>
  );
};

