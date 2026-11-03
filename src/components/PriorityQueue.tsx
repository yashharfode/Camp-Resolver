'use client';

import React from 'react';
import { EvaluatedComplaint } from '@/types/complaint';
import { PriorityCard } from './PriorityCard';
import { PriorityExplanation } from './PriorityExplanation';
import { Flame, CheckCircle, ShieldAlert } from 'lucide-react';

interface PriorityQueueProps {
  topComplaints: EvaluatedComplaint[];
  totalUnresolvedCount: number;
  onAdvanceStatus: (id: string) => void;
  onViewDetails: (complaint: EvaluatedComplaint) => void;
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
  topComplaints,
  totalUnresolvedCount,
  onAdvanceStatus,
  onViewDetails,
}) => {
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Unresolved Priority Queue</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                Top {topComplaints.length} of {totalUnresolvedCount} Unresolved
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Ranked dynamically by Urgency Score & Tie-Breaking Rules
            </p>
          </div>
        </div>
      </div>

      {/* Priority Cards or Empty State */}
      {topComplaints.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            All complaints have been resolved!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Great job! There are currently no pending or raised complaints in the priority queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topComplaints.map((complaint, index) => (
            <PriorityCard
              key={complaint.id}
              complaint={complaint}
              rank={index + 1}
              onAdvanceStatus={onAdvanceStatus}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

      {/* Priority & Urgency Formula Explainer */}
      <PriorityExplanation />
    </section>
  );
};
