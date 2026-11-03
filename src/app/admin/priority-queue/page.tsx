'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, EvaluatedComplaint } from '@/types/complaint';
import { getStoredComplaints } from '@/utils/storage';
import { evaluateComplaint, getPriorityQueue, getSummaryStats } from '@/utils/urgency';
import {
  subscribeToComplaints,
  updateComplaintStatusAndRemarks,
  FirebaseConnectionStatus,
} from '@/services/complaintService';
import { AdminLoginGuard } from '@/components/AdminLoginGuard';
import { Sidebar } from '@/components/Sidebar';
import { PriorityCard } from '@/components/PriorityCard';
import { PriorityExplanation } from '@/components/PriorityExplanation';
import { ComplaintDetailsModal } from '@/components/ComplaintDetailsModal';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import {
  Flame,
  Menu,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { CATEGORIES } from '@/utils/constants';

export default function PriorityQueuePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [selectedComplaint, setSelectedComplaint] = useState<EvaluatedComplaint | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'ALL'>('ALL');

  useEffect(() => {
    const cached = getStoredComplaints();
    setComplaints(cached);
    setCurrentTimestamp(Date.now());

    const unsubscribe = subscribeToComplaints((updated) => {
      setComplaints(updated);
    });

    const interval = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const evaluatedComplaints = useMemo(() => {
    return complaints.map((c) => evaluateComplaint(c, currentTimestamp));
  }, [complaints, currentTimestamp]);

  // All unresolved complaints sorted by urgency & tie-breaking rules
  const allUnresolvedQueue = useMemo(() => {
    const unresolved = complaints.filter(
      (c) => c.status === 'Raised' || c.status === 'In Progress'
    );
    const queue = getPriorityQueue(unresolved, unresolved.length, currentTimestamp);

    if (categoryFilter === 'ALL') {
      return queue;
    }
    return queue.filter((c) => c.category === categoryFilter);
  }, [complaints, currentTimestamp, categoryFilter]);

  const summary = useMemo(() => {
    return getSummaryStats(complaints, currentTimestamp);
  }, [complaints, currentTimestamp]);

  const handleAdvanceStatus = async (id: string) => {
    const target = complaints.find((c) => c.id === id);
    if (!target) return;
    const nextStatus: ComplaintStatus = target.status === 'Raised' ? 'In Progress' : 'Resolved';
    const updated = await updateComplaintStatusAndRemarks(id, nextStatus);
    setComplaints(updated);
    setCurrentTimestamp(Date.now());
  };

  const handleUpdateStatusAndRemarks = async (
    id: string,
    newStatus: ComplaintStatus,
    remarks?: string
  ) => {
    const updated = await updateComplaintStatusAndRemarks(id, newStatus, remarks);
    setComplaints(updated);
    setCurrentTimestamp(Date.now());
  };

  return (
    <AdminLoginGuard>
      <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
        <Sidebar
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar on Mobile */}
          <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-slate-800">Priority Queue</span>
            <div className="w-8" />
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-xs">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Unresolved Priority Queue
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Strict mathematical urgency sorting with automated tie-breaking hierarchy
                  </p>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Category:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    categoryFilter === 'ALL'
                      ? 'bg-[#007A78] text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  All ({summary.pending})
                </button>
                {CATEGORIES.map((cat) => {
                  const count = complaints.filter(
                    (c) =>
                      (c.status === 'Raised' || c.status === 'In Progress') &&
                      c.category === cat
                  ).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        categoryFilter === cat
                          ? 'bg-[#007A78] text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Queue Counter Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Unresolved in Queue</span>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {allUnresolvedQueue.length} Issues
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                  #{allUnresolvedQueue.length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">High Priority Tier (Score &ge; 4)</span>
                  <div className="text-2xl font-black text-rose-600 mt-0.5">
                    {summary.highPriority} Issues
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                  <Flame className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Resolved Complaints</span>
                  <div className="text-2xl font-black text-emerald-600 mt-0.5">
                    {summary.resolved} Closed
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Priority Cards List */}
            <div className="space-y-4">
              {allUnresolvedQueue.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    No Pending Complaints!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    All complaints matching the filter have been successfully resolved. Great job!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allUnresolvedQueue.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      {/* Left: Rank & Details */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            idx === 0
                              ? 'bg-rose-500 text-white shadow-xs'
                              : idx === 1
                              ? 'bg-amber-500 text-white shadow-xs'
                              : idx === 2
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{idx + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-bold text-slate-900">
                              {item.id}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {item.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.urgencyScore >= 4
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : item.urgencyScore >= 3
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              Urgency Score: {item.urgencyScore}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              • Age: {item.ageInHours} hours
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-800">
                            {item.title || item.description}
                          </h4>

                          {item.location && (
                            <p className="text-xs text-slate-500">
                              Location: <strong>{item.location}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {item.status === 'Raised' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(item.id)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#007A78] hover:bg-[#005C5A] text-white shadow-2xs transition flex items-center gap-1.5"
                          >
                            <span>Advance to In Progress</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {item.status === 'In Progress' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(item.id)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#059669] hover:bg-[#047857] text-white shadow-2xs transition flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Resolved</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(item)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tie-breaking Rules Explanation Component */}
            <PriorityExplanation />
          </main>
        </div>

        {selectedComplaint && (
          <ComplaintDetailsModal
            complaint={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
            onAdvanceStatus={handleAdvanceStatus}
            onUpdateStatusAndRemarks={handleUpdateStatusAndRemarks}
          />
        )}

        <ChatbotWidget />
      </div>
    </AdminLoginGuard>
  );
}
