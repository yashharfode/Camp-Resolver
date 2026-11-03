'use client';

import React, { useState } from 'react';
import { EvaluatedComplaint, ComplaintStatus } from '@/types/complaint';
import { CategoryBadge } from './CategoryBadge';
import { StatusBadge } from './StatusBadge';
import { formatAge } from '@/utils/urgency';
import {
  X,
  Calendar,
  Clock,
  Flame,
  ArrowRight,
  CheckCircle2,
  Check,
  User,
  Mail,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Send,
  History,
} from 'lucide-react';

interface ComplaintDetailsModalProps {
  complaint: EvaluatedComplaint | null;
  onClose: () => void;
  onAdvanceStatus?: (id: string) => void;
  onUpdateStatusAndRemarks?: (id: string, newStatus: ComplaintStatus, remarks?: string) => void;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  onClose,
  onAdvanceStatus,
  onUpdateStatusAndRemarks,
}) => {
  if (!complaint) return null;

  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [remarks, setRemarks] = useState<string>(complaint.adminRemarks || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onUpdateStatusAndRemarks) {
        await onUpdateStatusAndRemarks(complaint.id, selectedStatus, remarks.trim());
      } else if (onAdvanceStatus && selectedStatus !== complaint.status) {
        onAdvanceStatus(complaint.id);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 relative max-h-[92vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-base font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
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

        {/* Title & Subject */}
        {complaint.title && (
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
              Subject
            </span>
            <h3 className="text-base font-bold text-slate-900">{complaint.title}</h3>
          </div>
        )}

        {/* Student & Location Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>Student Details</span>
            </span>
            <p className="font-bold text-slate-800">
              {complaint.studentName || 'Student'}
            </p>
            {complaint.scholarNumber && (
              <p className="text-slate-600 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-slate-400" />
                <span>{complaint.scholarNumber}</span>
              </p>
            )}
            {complaint.email && (
              <p className="text-slate-600 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{complaint.email}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Campus Location</span>
            </span>
            <p className="font-bold text-slate-800">
              {complaint.location || 'Campus Facilities'}
            </p>
            {complaint.gpsLocation && (
              <p className="text-emerald-700 font-mono text-[11px] font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>GPS: {complaint.gpsLocation}</span>
              </p>
            )}
          </div>
        </div>

        {/* Issue Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Description
          </label>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </div>
        </div>

        {/* Urgency Calculation Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Submission Time</span>
            </span>
            <p className="font-semibold text-slate-900">
              {new Date(complaint.submittedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatAge(complaint.ageInHours)} ({complaint.ageInHours}h total)</span>
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-500" />
              <span>Urgency Formula Score</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-mono font-bold text-slate-900">
                Score: {complaint.urgencyScore}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
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
            <p className="text-[10px] font-mono text-slate-500">
              Weight ({complaint.categoryWeight}) + floor({complaint.ageInHours}h / 24) ={' '}
              {complaint.urgencyScore}
            </p>
          </div>
        </div>

        {/* ADMIN STATUS UPDATER SECTION (2 to 3 Status Options + Remarks) */}
        <form onSubmit={handleSaveStatus} className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#007A78]">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Status Update & Student Feedback</span>
          </div>

          {/* 3 Status Options */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              Update Status:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Raised', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedStatus === st
                      ? st === 'Resolved'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : st === 'In Progress'
                        ? 'bg-[#007A78] text-white shadow-xs'
                        : 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {selectedStatus === st && <Check className="w-3.5 h-3.5" />}
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Admin Remarks Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              Official Administration Remark (Visible to student on tracking):
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Electrician Kumar assigned, spare parts arriving today..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78]/20 focus:border-[#007A78] transition font-medium"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Updated successfully!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#007A78] hover:bg-[#005C5A] text-white transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3 h-3" />
              <span>{isSaving ? 'Saving...' : 'Save & Publish Update'}</span>
            </button>
          </div>
        </form>

        {/* Status History (if any) */}
        {complaint.statusUpdates && complaint.statusUpdates.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              <span>Status History Log</span>
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {complaint.statusUpdates.map((su, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{su.status}</span>
                    <span className="text-slate-500">{su.note}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(su.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
