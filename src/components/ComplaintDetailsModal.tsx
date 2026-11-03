'use client';

import React from 'react';
import { EvaluatedComplaint } from '@/types/complaint';
import { CategoryBadge } from './CategoryBadge';
import { StatusBadge } from './StatusBadge';
import { formatAge } from '@/utils/urgency';
import { X, Calendar, Clock, Flame, ArrowRight, CheckCircle2, Check } from 'lucide-react';

interface ComplaintDetailsModalProps {
  complaint: EvaluatedComplaint | null;
  onClose: () => void;
  onAdvanceStatus: (id: string) => void;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  onClose,
  onAdvanceStatus,
}) => {
  if (!complaint) return null;

  const steps = [
    { key: 'Raised', label: '1. Raised', desc: 'Complaint registered by student' },
    { key: 'In Progress', label: '2. In Progress', desc: 'Assigned to campus department' },
    { key: 'Resolved', label: '3. Resolved', desc: 'Issue resolved & verified' },
  ];

  const currentStepIndex =
    complaint.status === 'Raised'
      ? 0
      : complaint.status === 'In Progress'
      ? 1
      : 2;

  const ageFactor = Math.floor(complaint.ageInHours / 24);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              {complaint.id}
            </span>
            <CategoryBadge category={complaint.category} showWeight size="md" />
            <StatusBadge status={complaint.status} size="md" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Progression Stepper */}
        <div className="mt-5 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
            Workflow Status Pipeline
          </span>
          <div className="grid grid-cols-3 gap-2">
            {steps.map((s, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={s.key}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'bg-white border-[#007A78] ring-2 ring-[#007A78]/20 shadow-xs'
                      : isDone
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-white/60 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold block text-slate-800">
                    {s.key}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                    {s.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issue Description */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Description
          </label>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </div>
        </div>

        {/* Metadata & Urgency Analytics */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Submission Timestamp */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Submission Time
            </span>
            <p className="text-xs font-semibold text-slate-900">
              {new Date(complaint.submittedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatAge(complaint.ageInHours)} ({complaint.ageInHours} total hours)
            </p>
          </div>

          {/* Urgency Calculation */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Urgency Evaluation
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-mono font-bold text-slate-900">
                Score: {complaint.urgencyScore}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  complaint.urgencyTier === 'High'
                    ? 'bg-rose-100 text-rose-700'
                    : complaint.urgencyTier === 'Medium'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {complaint.urgencyTier} Priority
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              Weight ({complaint.categoryWeight}) + floor({complaint.ageInHours}h / 24) ={' '}
              {complaint.urgencyScore}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {complaint.status === 'Raised' && (
              <button
                type="button"
                onClick={() => {
                  onAdvanceStatus(complaint.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#007A78] hover:bg-[#0b6664] rounded-lg shadow-sm transition active:scale-98"
              >
                <span>Advance to In Progress</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {complaint.status === 'In Progress' && (
              <button
                type="button"
                onClick={() => {
                  onAdvanceStatus(complaint.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg shadow-sm transition active:scale-98"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Resolved</span>
              </button>
            )}

            {complaint.status === 'Resolved' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Issue Fully Resolved</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
