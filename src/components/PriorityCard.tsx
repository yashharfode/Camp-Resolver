'use client';

import React from 'react';
import { EvaluatedComplaint } from '@/types/complaint';
import { CategoryBadge } from './CategoryBadge';
import { StatusBadge } from './StatusBadge';
import { formatAge } from '@/utils/urgency';
import { Clock, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PriorityCardProps {
  complaint: EvaluatedComplaint;
  rank: number;
  onAdvanceStatus: (id: string) => void;
  onViewDetails: (complaint: EvaluatedComplaint) => void;
}

export const PriorityCard: React.FC<PriorityCardProps> = ({
  complaint,
  rank,
  onAdvanceStatus,
  onViewDetails,
}) => {
  const ageFactor = Math.floor(complaint.ageInHours / 24);

  const getRankBadge = () => {
    switch (rank) {
      case 1:
        return 'bg-rose-500 text-white ring-4 ring-rose-100';
      case 2:
        return 'bg-amber-500 text-white ring-4 ring-amber-100';
      case 3:
        return 'bg-blue-500 text-white ring-4 ring-blue-100';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="relative bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top row: Rank, ID, and Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Rank badge */}
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getRankBadge()}`}
              title={`Rank #${rank} in Priority Queue`}
            >
              #{rank}
            </span>
            {/* Complaint ID */}
            <button
              type="button"
              onClick={() => onViewDetails(complaint)}
              className="font-mono text-sm font-bold text-slate-900 hover:text-indigo-600 transition"
            >
              {complaint.id}
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <CategoryBadge category={complaint.category} size="sm" showWeight />
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm font-medium text-slate-800 line-clamp-2 mt-2 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      {/* Urgency breakdown & Age */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          {/* Age */}
          <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatAge(complaint.ageInHours)}</span>
            <span className="text-[11px] text-slate-400">({complaint.ageInHours}h)</span>
          </span>

          {/* Urgency Score Pill */}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
            title={`Base weight (${complaint.categoryWeight}) + floor(${complaint.ageInHours}h / 24) = ${complaint.urgencyScore}`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Score: {complaint.urgencyScore}</span>
          </span>
        </div>

        {/* Mathematical breakdown formula */}
        <div className="bg-slate-50 rounded-md px-2.5 py-1 text-[11px] font-mono text-slate-500 flex items-center justify-between border border-slate-200/50">
          <span>Formula:</span>
          <span className="font-semibold text-slate-700">
            {complaint.categoryWeight} (weight) + {ageFactor} (age/24) ={' '}
            <strong className="text-rose-600">{complaint.urgencyScore}</strong>
          </span>
        </div>

        {/* Action button */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(complaint)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            View Details
          </button>

          {complaint.status === 'Raised' && (
            <button
              type="button"
              onClick={() => onAdvanceStatus(complaint.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition active:scale-98"
            >
              <span>Advance to In Progress</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {complaint.status === 'In Progress' && (
            <button
              type="button"
              onClick={() => onAdvanceStatus(complaint.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition active:scale-98"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Mark as Resolved</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
