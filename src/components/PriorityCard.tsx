'use client';

import React from 'react';
import { EvaluatedComplaint, AIPriority, AISeverity } from '@/types/complaint';
import { CategoryBadge } from './CategoryBadge';
import { StatusBadge } from './StatusBadge';
import { formatAge } from '@/utils/urgency';
import { Clock, Flame, ArrowRight, CheckCircle2, AlertTriangle, Sparkles, ShieldAlert } from 'lucide-react';

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
  const isEmergency = complaint.effectivePriority === 'Emergency' || complaint.isEmergency;

  const getRankBadge = () => {
    if (isEmergency) {
      return 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse';
    }
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

  const getPriorityBadgeClass = (priority: AIPriority) => {
    switch (priority) {
      case 'Emergency':
        return 'bg-rose-600 text-white font-black animate-pulse border-rose-700 shadow-xs';
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  const getSeverityBadgeClass = (sev?: AISeverity) => {
    switch (sev) {
      case 'Critical':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'High':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low':
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        isEmergency
          ? 'border-rose-400 ring-2 ring-rose-400/30'
          : 'border-slate-200/90'
      }`}
    >
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
              className="font-mono text-sm font-bold text-slate-900 hover:text-teal-700 transition"
            >
              {complaint.id}
            </button>

            {/* Priority Tier Badge */}
            <span
              className={`text-[10px] uppercase px-2 py-0.5 rounded-md border tracking-wider flex items-center gap-1 ${getPriorityBadgeClass(
                complaint.effectivePriority
              )}`}
            >
              {isEmergency && <ShieldAlert className="w-3 h-3 text-white" />}
              <span>{complaint.effectivePriority} Priority</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <CategoryBadge category={complaint.category} size="sm" showWeight />
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        {/* Title or Description */}
        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
          {complaint.title || complaint.description}
        </h4>
        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
          {complaint.description}
        </p>

        {/* Location & Reporter info */}
        {complaint.location && (
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            📍 {complaint.location}
            {complaint.studentName ? ` • ${complaint.studentName}` : ''}
          </p>
        )}
      </div>

      {/* Rationale & Mathematical Urgency Section */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2.5">
        {/* Transparent Priority Explanation Pill */}
        <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-2 text-[11px] text-slate-700 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#007A78] shrink-0 mt-0.5" />
          <span className="leading-tight font-medium">
            <strong className="text-[#007A78] font-bold">Priority Factor: </strong>
            {complaint.priorityExplanation}
          </span>
        </div>

        {/* Side-by-side metrics: Mathematical Urgency Score + AI Severity */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {/* Mathematical Urgency Score */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">
              Math Urgency Score
            </span>
            <div className="flex items-center gap-1 font-mono font-bold text-slate-800 mt-0.5">
              <Flame className="w-3 h-3 text-rose-500" />
              <span>Score: {complaint.urgencyScore}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({complaint.categoryWeight}+{ageFactor})
              </span>
            </div>
          </div>

          {/* AI Severity */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">
              AI Detected Severity
            </span>
            <span
              className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(
                complaint.aiSeverity
              )}`}
            >
              {complaint.aiSeverity || 'Standard'}
            </span>
          </div>
        </div>

        {/* Footer: Pending Age & Advance Button */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatAge(complaint.ageInHours)}</span>
            <span className="text-[11px] text-slate-400">({complaint.ageInHours}h)</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onViewDetails(complaint)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              Details
            </button>

            {complaint.status !== 'Resolved' && (
              <button
                type="button"
                onClick={() => onAdvanceStatus(complaint.id)}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-[#007A78] hover:bg-[#005C5A] rounded-lg transition shadow-2xs cursor-pointer"
              >
                <span>{complaint.status === 'Raised' ? 'Assign' : 'Resolve'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
