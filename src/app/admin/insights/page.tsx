'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Complaint, EvaluatedComplaint, CampusReportData } from '@/types/complaint';
import { getStoredComplaints } from '@/utils/storage';
import { evaluateComplaint, getSummaryStats, formatAge } from '@/utils/urgency';
import {
  subscribeToComplaints,
  updateComplaintStatusAndRemarks,
  overrideComplaintPriority,
  acknowledgeEmergencyComplaint,
  resetDatabaseToSampleComplaints,
} from '@/services/complaintService';
import { AdminLoginGuard } from '@/components/AdminLoginGuard';
import { Sidebar } from '@/components/Sidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ComplaintDetailsModal } from '@/components/ComplaintDetailsModal';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import {
  Sparkles,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Layers,
  Copy,
  Check,
  Printer,
  Download,
  Calendar,
  ShieldAlert,
  Flame,
  ArrowRight,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';

export default function AIInsightsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [selectedComplaint, setSelectedComplaint] = useState<EvaluatedComplaint | null>(null);

  // Date Filter: 'today' | '7days' | '30days' | 'all'
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | 'all'>('7days');

  // Report generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<CampusReportData | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

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

  // Filter complaints by selected period
  const filteredComplaints = useMemo(() => {
    if (!currentTimestamp) return complaints;
    const ONE_HOUR = 3600000;
    const ONE_DAY = 24 * ONE_HOUR;

    return complaints.filter((c) => {
      const submitted = new Date(c.submittedAt).getTime();
      const diff = currentTimestamp - submitted;

      if (period === 'today') return diff <= ONE_DAY;
      if (period === '7days') return diff <= 7 * ONE_DAY;
      if (period === '30days') return diff <= 30 * ONE_DAY;
      return true; // 'all'
    });
  }, [complaints, period, currentTimestamp]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case 'today':
        return 'Today (Last 24 Hours)';
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case 'all':
      default:
        return 'All Time History';
    }
  }, [period]);

  // Derived Analytics from filtered real complaints
  const metrics = useMemo(() => {
    const total = filteredComplaints.length;
    const resolved = filteredComplaints.filter((c) => c.status === 'Resolved').length;
    const pending = filteredComplaints.filter((c) => c.status !== 'Resolved').length;
    const clearanceRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const emergencies = filteredComplaints.filter((c) => c.isEmergency || c.category === 'Emergency');
    const criticalAI = filteredComplaints.filter(
      (c) => c.aiSeverity === 'Critical' && !c.isEmergency && c.status !== 'Resolved'
    );

    // Category Counts
    const catMap: Record<string, number> = {};
    for (const c of filteredComplaints) {
      catMap[c.category] = (catMap[c.category] || 0) + 1;
    }
    const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const topCategory = catEntries[0] || ['None', 0];

    // Department Performance
    const deptMap: Record<string, { total: number; pending: number; resolved: number }> = {};
    for (const c of filteredComplaints) {
      const dept = c.aiRecommendedDepartment || `${c.category} Maintenance`;
      if (!deptMap[dept]) {
        deptMap[dept] = { total: 0, pending: 0, resolved: 0 };
      }
      deptMap[dept].total++;
      if (c.status === 'Resolved') deptMap[dept].resolved++;
      else deptMap[dept].pending++;
    }

    const deptEntries = Object.entries(deptMap).sort((a, b) => b[1].pending - a[1].pending);
    const mostProblematicDept = deptEntries[0] || ['None', { total: 0, pending: 0, resolved: 0 }];

    // Location / Cluster Detection
    const locMap: Record<string, number> = {};
    for (const c of filteredComplaints) {
      if (c.location) {
        const key = c.location.trim();
        locMap[key] = (locMap[key] || 0) + 1;
      }
    }
    const topLocations = Object.entries(locMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return {
      total,
      resolved,
      pending,
      clearanceRate,
      emergencies,
      criticalAI,
      catEntries,
      topCategory,
      deptEntries,
      mostProblematicDept,
      topLocations,
    };
  }, [filteredComplaints]);

  // Handle Report Generation
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaints: filteredComplaints,
          period: periodLabel,
        }),
      });

      if (!res.ok) throw new Error('Report generation failed');

      const data: CampusReportData = await res.json();
      setGeneratedReport(data);
      setReportModalOpen(true);
    } catch (err) {
      console.error('Failed to generate campus report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReport = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport.fullReportMarkdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!generatedReport) return;
    const blob = new Blob([generatedReport.fullReportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Campus_Grievance_Report_${period}_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenComplaintById = (complaintId: string) => {
    const found = complaints.find((c) => c.id === complaintId);
    if (found) {
      setSelectedComplaint(evaluateComplaint(found, currentTimestamp, complaints));
    }
  };

  return (
    <AdminLoginGuard>
      <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
        <Sidebar
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          activeTab="insights"
        />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <DashboardHeader
              onResetSampleData={async () => {
                const samples = await resetDatabaseToSampleComplaints();
                setComplaints(samples);
              }}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              onViewComplaint={handleOpenComplaintById}
            />

            {/* Page Title & Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#007A78] flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-[#007A78]" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    AI Complaint Intelligence & Insights
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Autonomous pattern analysis, recurring hazard detection, and department backlog forecasting.
                </p>
              </div>

              {/* Filters & Actions */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Date Filter Tabs */}
                <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-semibold">
                  {(
                    [
                      { id: 'today', label: 'Today' },
                      { id: '7days', label: '7 Days' },
                      { id: '30days', label: '30 Days' },
                      { id: 'all', label: 'All Time' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPeriod(t.id)}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                        period === t.id
                          ? 'bg-white text-[#007A78] font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Generate Campus Report Button */}
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#007A78] hover:bg-[#005C5A] text-white text-xs font-bold rounded-2xl transition shadow-md shadow-[#007A78]/20 cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Synthesizing...' : 'Generate Campus Report'}</span>
                </button>
              </div>
            </div>

            {/* SECTION A: COMPLAINT TRENDS & VOLUME */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#007A78]" />
                  <span>Section A: Complaint Trends & Volume ({periodLabel})</span>
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  Sample size: {metrics.total} grievances
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Volume */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Total Volume
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {metrics.total}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">tickets</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Logged in {periodLabel.toLowerCase()}
                  </p>
                </div>

                {/* Active Pending Backlog */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-amber-600 uppercase">
                    Active Pending
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600">
                      {metrics.pending}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">unresolved</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Requires department dispatch
                  </p>
                </div>

                {/* Clearance Rate */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase">
                    Clearance Rate
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                      {metrics.clearanceRate}%
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({metrics.resolved} closed)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Successfully verified resolutions
                  </p>
                </div>

                {/* Most Reported Issue */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase">
                    Leading Category
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                      {metrics.topCategory[0]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    {metrics.topCategory[1]} grievances recorded
                  </p>
                </div>
              </div>

              {/* Category Breakdown Bar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Category Distribution Matrix
                </span>
                <div className="space-y-2">
                  {metrics.catEntries.map(([cat, count]) => {
                    const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            {cat === 'Emergency' && (
                              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                            )}
                            <strong className={cat === 'Emergency' ? 'text-rose-600 font-bold' : ''}>
                              {cat}
                            </strong>
                          </span>
                          <span>
                            {count} complaints ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              cat === 'Emergency'
                                ? 'bg-rose-600'
                                : cat === 'Wi-Fi'
                                ? 'bg-teal-500'
                                : cat === 'Hostel'
                                ? 'bg-emerald-500'
                                : cat === 'Laboratory'
                                ? 'bg-sky-500'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION B: DEPARTMENT PERFORMANCE & HOTSPOTS */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#007A78]" />
                <span>Section B: Department Performance & Hotspots</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Most Problematic Department Highlight */}
                <div className="bg-gradient-to-br from-amber-50/70 via-rose-50/30 to-white p-5 rounded-3xl border border-amber-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Most Impacted Campus Office
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900">
                      {metrics.mostProblematicDept[0]}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Carries highest unresolved volume ({metrics.mostProblematicDept[1].pending}{' '}
                      pending of {metrics.mostProblematicDept[1].total} total tickets). Engineering
                      or administrative support reallocation suggested.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-amber-200/60 text-xs">
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">TOTAL</span>
                      <strong className="text-slate-800">{metrics.mostProblematicDept[1].total}</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-[10px] text-amber-600 block font-bold">PENDING</span>
                      <strong className="text-amber-700">{metrics.mostProblematicDept[1].pending}</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-[10px] text-emerald-600 block font-bold">RESOLVED</span>
                      <strong className="text-emerald-700">
                        {metrics.mostProblematicDept[1].resolved}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Department Clearance Table */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    All Department Clearance Breakdown
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {metrics.deptEntries.map(([dept, counts]) => (
                      <div key={dept} className="pt-2 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-slate-800 block font-semibold">{dept}</strong>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {counts.total} assigned • {counts.resolved} closed
                          </span>
                        </div>
                        <span
                          className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                            counts.pending > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {counts.pending} pending
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION C: CRITICAL & EMERGENCY ISSUES */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Section C: Critical Safety & Emergency Review</span>
              </h3>

              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      High-Risk Campus Tickets
                    </h4>
                    <p className="text-xs text-slate-500">
                      Emergencies and AI-detected critical severity safety hazards.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {metrics.emergencies.length} Emergencies
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {metrics.criticalAI.length} Critical AI
                    </span>
                  </div>
                </div>

                {/* List of High-Risk tickets */}
                {metrics.emergencies.length === 0 && metrics.criticalAI.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-slate-700">No active critical safety incidents</p>
                    <p className="text-[11px] text-slate-400">All emergency and safety hazards have been inspected or closed.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {[...metrics.emergencies, ...metrics.criticalAI].map((c) => {
                      const isEmerg = c.isEmergency || c.category === 'Emergency';
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleOpenComplaintById(c.id)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isEmerg
                              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300/40 hover:bg-rose-100/60'
                              : 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/50'
                          }`}
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {c.id}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                  isEmerg ? 'bg-rose-600 text-white animate-pulse' : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {isEmerg ? 'Emergency' : 'Critical Severity'}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                📍 {c.location || 'Campus Facilities'}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900">
                              {c.emergencyDetails || c.title || c.description}
                            </p>
                            {c.aiReason && (
                              <p className="text-[11px] text-slate-600 font-medium">
                                AI Assessment: {c.aiReason}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-slate-500">
                              {c.status}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenComplaintById(c.id);
                              }}
                              className="px-3 py-1 text-xs font-bold bg-white text-slate-800 border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>Inspect</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION D: AI ROOT CAUSE ANALYSIS & PREVENTIVE RECOMMENDATIONS */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#007A78]" />
                <span>Section D: AI Root Cause Analysis & Preventive Directives</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recurring Clusters */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    Detected Incident Hotspots & Locations
                  </span>

                  {metrics.topLocations.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No multi-complaint location clusters found in this period.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {metrics.topLocations.map(([loc, count], idx) => (
                        <div
                          key={loc}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-[#007A78] font-bold text-[10px] flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-slate-800">{loc}</span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {count} reports
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Preventive Directives */}
                <div className="bg-teal-50/60 p-5 rounded-3xl border border-teal-200/90 shadow-2xs space-y-3">
                  <span className="text-xs font-bold text-[#007A78] block">
                    Autonomous Preventive Directives
                  </span>
                  <ul className="space-y-2 text-xs text-slate-700 leading-relaxed font-medium">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#007A78] shrink-0 mt-1.5" />
                      <span>
                        Schedule preventive maintenance for <strong>{metrics.topCategory[0]}</strong>, which makes up {metrics.catEntries[0] ? Math.round((metrics.catEntries[0][1] / (metrics.total || 1)) * 100) : 0}% of all tickets.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#007A78] shrink-0 mt-1.5" />
                      <span>
                        Deploy extra technician staffing to <strong>{metrics.mostProblematicDept[0]}</strong> to clear active backlog tickets before age exceeds 24h.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#007A78] shrink-0 mt-1.5" />
                      <span>
                        Enforce rapid acknowledgment protocol: designated wardens must verify emergency tickets within 30 minutes of logging.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* EXECUTIVE CAMPUS REPORT VIEWER MODAL */}
      {reportModalOpen && generatedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setReportModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#007A78] bg-[#E6FFFA] px-2.5 py-1 rounded-full border border-[#99F6E4]">
                  AI Executive Governance Report
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {generatedReport.title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Certified on {new Date(generatedReport.generatedAt).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2 justify-end text-xs font-semibold">
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedReport ? 'Copied Markdown!' : 'Copy Markdown'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Download .md</span>
              </button>
              <button
                type="button"
                onClick={handlePrintReport}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print</span>
              </button>
            </div>

            {/* Report Content */}
            <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
              {/* Executive Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  1. Executive Overview
                </h4>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {generatedReport.summary}
                </p>
              </div>

              {/* Top Issue & Bottleneck Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Primary Impact Driver
                  </span>
                  <p className="text-sm font-black text-slate-900">{generatedReport.topIssue}</p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Department Bottleneck
                  </span>
                  <p className="text-sm font-black text-amber-700">
                    {generatedReport.problematicDepartment}
                  </p>
                </div>
              </div>

              {/* Safety Review */}
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1">
                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                  2. Safety & Emergency Audit
                </h4>
                <p className="text-slate-800 font-medium">
                  {generatedReport.safetyEmergencyReview}
                </p>
              </div>

              {/* Recurring Issues */}
              {generatedReport.recurringIncidents && generatedReport.recurringIncidents.length > 0 && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    3. Recurrence Patterns
                  </h4>
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-700 font-medium">
                    {generatedReport.recurringIncidents.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {generatedReport.recommendations && generatedReport.recommendations.length > 0 && (
                <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-[#007A78] uppercase tracking-wide">
                    4. Actionable Directives
                  </h4>
                  <ul className="space-y-1.5 pl-4 list-decimal text-slate-800 font-medium">
                    {generatedReport.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatusAndRemarks={async (id, newStatus, remarks) => {
            const updated = await updateComplaintStatusAndRemarks(id, newStatus, remarks);
            setComplaints(updated);
          }}
          onOverridePriority={async (id, priority) => {
            const updated = await overrideComplaintPriority(id, priority);
            setComplaints(updated);
          }}
          onAcknowledgeEmergency={async (id) => {
            const updated = await acknowledgeEmergencyComplaint(id, 'Admin');
            setComplaints(updated);
          }}
        />
      )}

      <ChatbotWidget />
    </AdminLoginGuard>
  );
}
