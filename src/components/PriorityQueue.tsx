'use client';

import React from 'react';
import { EvaluatedComplaint } from '@/types/complaint';
import { CategoryBadge } from './CategoryBadge';
import { StatusBadge } from './StatusBadge';
import { formatAge } from '@/utils/urgency';
import { Flame, Clock, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface PriorityQueueProps {
  topComplaints: EvaluatedComplaint[];
  totalUnresolvedCount: number;
  onAdvanceStatus: (id: string) => void;
  onViewDetails: (complaint: EvaluatedComplaint) => void;
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
  topComplaints,
  totalUnresolvedCount,
  onViewDetails,
}) => {
  const getRankConfig = (rank: number, isEmergency: boolean) => {
    if (isEmergency) {
      return {
        rankBadge: 'bg-rose-600 text-white animate-pulse',
        borderLeft: 'border-l-4 border-l-rose-600 bg-rose-50/30',
      };
    }
    switch (rank) {
      case 1:
        return {
          rankBadge: 'bg-[#EF4444] text-white',
          borderLeft: 'border-l-4 border-l-[#EF4444]',
        };
      case 2:
        return {
          rankBadge: 'bg-[#F97316] text-white',
          borderLeft: 'border-l-4 border-l-[#F97316]',
        };
      case 3:
      default:
        return {
          rankBadge: 'bg-[#EAB308] text-white',
          borderLeft: 'border-l-4 border-l-[#EAB308]',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-[#F97316] shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Unresolved Priority Queue
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ranked by AI Severity & Mathematical Urgency
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-[#5B21B6] bg-[#ECE9FE] px-3 py-1 rounded-full border border-indigo-100 shadow-2xs">
            Top {topComplaints.length} of {totalUnresolvedCount}
          </span>
        </div>

        {/* Priority items list or Empty state */}
        {topComplaints.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              All complaints have been resolved!
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              No pending or raised complaints in the queue.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topComplaints.map((complaint, index) => {
              const rank = index + 1;
              const isEmergency =
                complaint.effectivePriority === 'Emergency' || complaint.isEmergency;
              const { rankBadge, borderLeft } = getRankConfig(rank, !!isEmergency);

              return (
                <div
                  key={complaint.id}
                  onClick={() => onViewDetails(complaint)}
                  className={`bg-white rounded-xl border border-slate-200/70 p-3.5 shadow-2xs hover:shadow-md transition-all duration-150 cursor-pointer ${borderLeft}`}
                >
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    {/* Left: Rank, ID, and Category badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rankBadge}`}
                      >
                        #{rank}
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {complaint.id}
                      </span>
                      <CategoryBadge category={complaint.category} size="sm" />

                      {/* Priority Tier Tag */}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isEmergency
                            ? 'bg-rose-600 text-white animate-pulse'
                            : complaint.effectivePriority === 'Critical'
                            ? 'bg-rose-100 text-rose-700'
                            : complaint.effectivePriority === 'High'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {complaint.effectivePriority}
                      </span>
                    </div>

                    {/* Right: Score pill, Age, and Status badge */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {/* Urgency Score Pill */}
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FFE4E6]"
                        title={`Mathematical Score: Base Weight (${complaint.categoryWeight}) + Age Factor (${Math.floor(
                          complaint.ageInHours / 24
                        )})`}
                      >
                        <Flame className="w-3 h-3 text-[#E11D48]" />
                        <span>Score: {complaint.urgencyScore}</span>
                      </span>

                      {/* Age */}
                      <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatAge(complaint.ageInHours)}</span>
                      </span>

                      {/* Status */}
                      <StatusBadge status={complaint.status} size="sm" />
                    </div>
                  </div>

                  {/* Middle: Title & description */}
                  <div className="sm:pl-8 mt-1.5">
                    <p className="text-xs text-slate-800 font-semibold line-clamp-1">
                      {complaint.title || complaint.description}
                    </p>
                    {complaint.priorityExplanation && (
                      <p className="text-[11px] text-teal-700 font-medium line-clamp-1 mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#007A78] shrink-0" />
                        <span>{complaint.priorityExplanation}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
