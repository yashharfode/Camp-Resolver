'use client';

import React, { useState } from 'react';
import { EvaluatedComplaint, ComplaintStatus, AIPriority, AISeverity } from '@/types/complaint';
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
  Sparkles,
  AlertTriangle,
  Building2,
  HelpCircle,
  ShieldAlert,
  EyeOff,
  Shield,
} from 'lucide-react';

interface ComplaintDetailsModalProps {
  complaint: EvaluatedComplaint | null;
  onClose: () => void;
  onAdvanceStatus?: (id: string) => void;
  onUpdateStatusAndRemarks?: (id: string, newStatus: ComplaintStatus, remarks?: string) => void;
  onOverridePriority?: (id: string, priority: AIPriority) => void;
  onAcknowledgeEmergency?: (id: string) => void;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  onClose,
  onAdvanceStatus,
  onUpdateStatusAndRemarks,
  onOverridePriority,
  onAcknowledgeEmergency,
}) => {
  if (!complaint) return null;

  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [remarks, setRemarks] = useState<string>(complaint.adminRemarks || '');
  const [selectedOverride, setSelectedOverride] = useState<AIPriority | 'AUTO'>(
    complaint.priorityOverride || 'AUTO'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const isEmergency = complaint.isEmergency || complaint.category === 'Emergency';

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onOverridePriority && selectedOverride !== 'AUTO' && selectedOverride !== complaint.priorityOverride) {
        await onOverridePriority(complaint.id, selectedOverride as AIPriority);
      }

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

  const handleAcknowledge = async () => {
    if (!onAcknowledgeEmergency) return;
    setIsAcknowledging(true);
    try {
      await onAcknowledgeEmergency(complaint.id);
    } finally {
      setIsAcknowledging(false);
    }
  };

  const getSeverityBadge = (severity?: AISeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getPriorityBadge = (p?: AIPriority) => {
    switch (p) {
      case 'Emergency':
        return 'bg-rose-600 text-white font-black animate-pulse';
      case 'Critical':
        return 'bg-rose-500 text-white font-bold';
      case 'High':
        return 'bg-orange-500 text-white font-bold';
      case 'Medium':
        return 'bg-amber-500 text-white font-medium';
      case 'Low':
      default:
        return 'bg-slate-500 text-white';
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

            {/* Effective Priority Badge */}
            <span
              className={`text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider ${getPriorityBadge(
                complaint.effectivePriority
              )}`}
            >
              Priority: {complaint.effectivePriority}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Alert Banner */}
        {isEmergency && (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-800">
                  Critical Campus Emergency Ticket
                </h4>
                <p className="text-xs font-bold text-rose-900 mt-0.5">
                  {complaint.emergencyDetails || complaint.description}
                </p>
                <p className="text-[11px] text-rose-700 mt-1">
                  Status:{' '}
                  {complaint.emergencyAcknowledged ? (
                    <strong className="text-emerald-700 font-bold">
                      Acknowledged ({complaint.emergencyAcknowledgedBy || 'Admin'})
                    </strong>
                  ) : (
                    <strong className="text-rose-700 font-bold animate-pulse">
                      Pending Administrator Acknowledgment
                    </strong>
                  )}
                </p>
              </div>
            </div>

            {!complaint.emergencyAcknowledged && onAcknowledgeEmergency && (
              <button
                type="button"
                onClick={handleAcknowledge}
                disabled={isAcknowledging}
                className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>{isAcknowledging ? 'Acknowledging...' : 'Acknowledge Emergency'}</span>
              </button>
            )}
          </div>
        )}

        {/* AI-Powered Intelligence Section */}
        <div className="p-4 bg-gradient-to-br from-teal-50/70 via-indigo-50/40 to-slate-50 rounded-2xl border border-teal-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#007A78] text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                AI Complaint Intelligence Analysis
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
              {complaint.aiReviewStatus === 'overridden'
                ? 'Admin Overridden'
                : complaint.aiReviewStatus === 'completed'
                ? 'Analyzed by AI'
                : 'Automated Intelligence'}
            </span>
          </div>

          {/* AI Summary */}
          <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
              Problem Summary
            </span>
            <p className="text-xs font-bold text-slate-800">
              {complaint.aiSummary || complaint.title || complaint.description}
            </p>
          </div>

          {/* AI Grid Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold text-slate-400 block uppercase">
                Identified Issue
              </span>
              <p className="font-bold text-slate-800 text-[11px] truncate mt-0.5" title={complaint.aiIssueType}>
                {complaint.aiIssueType || complaint.category}
              </p>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold text-slate-400 block uppercase">
                AI Severity
              </span>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(
                  complaint.aiSeverity
                )}`}
              >
                {complaint.aiSeverity || 'Medium'}
              </span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold text-slate-400 block uppercase">
                Department
              </span>
              <p className="font-bold text-slate-800 text-[11px] truncate mt-0.5" title={complaint.aiRecommendedDepartment}>
                {complaint.aiRecommendedDepartment || 'Campus Facilities'}
              </p>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold text-slate-400 block uppercase">
                Immediate Action
              </span>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                  complaint.aiImmediateAttention || isEmergency
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {complaint.aiImmediateAttention || isEmergency ? 'YES (Urgent)' : 'Standard'}
              </span>
            </div>
          </div>

          {/* AI Reason */}
          {complaint.aiReason && (
            <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
              <strong className="text-slate-800">Reasoning:</strong> {complaint.aiReason}
            </div>
          )}
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
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>Student Details</span>
              </span>
              {complaint.isAnonymous && (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff className="w-3 h-3 text-indigo-600" />
                  <span>Anonymous to Dept</span>
                </span>
              )}
            </div>

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

            {complaint.isAnonymous && (
              <p className="text-[10px] text-indigo-600 bg-indigo-50/70 p-1.5 rounded-lg border border-indigo-100 font-medium mt-1">
                🔒 Note: Student requested anonymity. Name and email are protected and hidden from department staff. Visible only to Admin.
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

        {/* Urgency Calculation Breakdown & AI Severity Display */}
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
              <span>Mathematical Urgency Score</span>
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
                {complaint.urgencyTier} Tier
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-500">
              Weight ({complaint.categoryWeight}) + floor({complaint.ageInHours}h / 24) ={' '}
              {complaint.urgencyScore}
            </p>
          </div>
        </div>

        {/* ADMIN OVERRIDE & STATUS UPDATE FORM */}
        <form onSubmit={handleSaveStatus} className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#007A78]">
              <ShieldCheck className="w-4 h-4" />
              <span>Administrator Review & Override</span>
            </div>
            {complaint.priorityOverride && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                Manually Overridden to {complaint.priorityOverride}
              </span>
            )}
          </div>

          {/* Priority Override Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              Priority Classification Override:
            </label>
            <select
              value={selectedOverride}
              onChange={(e) => setSelectedOverride(e.target.value as AIPriority | 'AUTO')}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007A78]/20 focus:border-[#007A78]"
            >
              <option value="AUTO">Auto (AI Recommendation & Urgency Formula)</option>
              <option value="Emergency">Emergency (Immediate Life Safety / Critical Hazard)</option>
              <option value="Critical">Critical (Severe Campus Disruption)</option>
              <option value="High">High (High Priority Grievance)</option>
              <option value="Medium">Medium (Standard Academic/Living Issue)</option>
              <option value="Low">Low (Minor Campus Request)</option>
            </select>
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
