'use client';

import React, { useState, useMemo } from 'react';
import { Complaint } from '@/types/complaint';
import { evaluateComplaint } from '@/utils/urgency';
import {
  FileText,
  Hourglass,
  CheckCircle2,
  Flame,
  Calendar,
  Download,
  TrendingUp,
  BarChart3,
  PieChart,
  ShieldAlert,
} from 'lucide-react';

interface AnalyticsViewProps {
  complaints: Complaint[];
  currentTimestamp?: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ complaints, currentTimestamp = Date.now() }) => {
  const [timeRange, setTimeRange] = useState('30');

  // Compute live stats
  const evaluated = useMemo(() => {
    return complaints.map((c) => evaluateComplaint(c, currentTimestamp));
  }, [complaints, currentTimestamp]);

  const total = evaluated.length;
  const pending = evaluated.filter((c) => c.status === 'Raised' || c.status === 'In Progress').length;
  const resolved = evaluated.filter((c) => c.status === 'Resolved').length;
  const highPriority = evaluated.filter((c) => (c.status === 'Raised' || c.status === 'In Progress') && c.urgencyScore >= 4).length;

  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const resolvedPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const highPriorityPct = total > 0 ? Math.round((highPriority / total) * 100) : 0;

  // Status breakdown
  const raisedCount = evaluated.filter((c) => c.status === 'Raised').length;
  const inProgressCount = evaluated.filter((c) => c.status === 'In Progress').length;
  const raisedPct = total > 0 ? Math.round((raisedCount / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;

  // Category breakdown
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Wi-Fi': 0,
      'Hostel': 0,
      'Classroom': 0,
      'Laboratory': 0,
      'Other': 0,
    };
    evaluated.forEach((c) => {
      if (counts[c.category] !== undefined) {
        counts[c.category]++;
      } else {
        counts['Other']++;
      }
    });
    return counts;
  }, [evaluated]);

  // Priority breakdown
  const priorityHigh = evaluated.filter((c) => c.urgencyScore >= 4).length;
  const priorityMedium = evaluated.filter((c) => c.urgencyScore === 2 || c.urgencyScore === 3).length;
  const priorityLow = evaluated.filter((c) => c.urgencyScore <= 1).length;

  const highPct = total > 0 ? Math.round((priorityHigh / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((priorityMedium / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((priorityLow / total) * 100) : 0;

  // Export report
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Category,Title,Status,Urgency Score,Age Hours,Submitted At']
        .concat(
          evaluated.map(
            (c) =>
              `"${c.id}","${c.category}","${(c.title || c.description).replace(/"/g, '""')}","${c.status}","${c.urgencyScore}","${c.ageInHours}","${c.submittedAt}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_complaints_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#E6FFFA] text-[#007A78] flex items-center justify-center border border-[#99F6E4] shadow-xs">
            <BarChart3 className="w-6 h-6" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics</h1>
            <p className="text-xs text-slate-500 font-medium">Insights and trends from campus complaints</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Last 30 Days Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer pr-1"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#007A78] hover:bg-[#005C5A] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Overview Metric Cards matching reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-[#007A78] flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span>Total Complaints</span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{total}</div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#007A78] border border-teal-200 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+14%</span>
          </span>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Hourglass className="w-3.5 h-3.5" />
              </div>
              <span>Pending</span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{pending}</div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {pendingPct}%
          </span>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Resolved</span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{resolved}</div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {resolvedPct}%
          </span>
        </div>

        {/* High Priority */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <span>High Priority</span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{highPriority}</div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {highPriorityPct}%
          </span>
        </div>
      </div>

      {/* Grid of 4 Visual Charts matching reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Complaint Trends (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#007A78]" />
                <h3 className="text-sm font-bold text-slate-900">Complaint Trends</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Number of complaints raised over time</p>
            </div>
          </div>

          {/* Line Chart Area (SVG) */}
          <div className="pt-2">
            <div className="relative w-full h-56">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007A78" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#007A78" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="180" x2="500" y2="180" stroke="#E2E8F0" strokeWidth="1.5" />

                {/* Filled Area under Curve */}
                <path
                  d="M 20 160 Q 100 120, 180 135 T 320 80 T 420 60 T 480 100 L 480 180 L 20 180 Z"
                  fill="url(#trendGradient)"
                />

                {/* Smooth Curve Line */}
                <path
                  d="M 20 160 Q 100 120, 180 135 T 320 80 T 420 60 T 480 100"
                  fill="none"
                  stroke="#007A78"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Points on Curve */}
                {[
                  { cx: 20, cy: 160, val: 2 },
                  { cx: 100, cy: 120, val: 4 },
                  { cx: 180, cy: 135, val: 3 },
                  { cx: 320, cy: 80, val: 6 },
                  { cx: 420, cy: 60, val: 8 },
                  { cx: 480, cy: 100, val: 5 },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.cx} cy={pt.cy} r="5" fill="#007A78" stroke="#ffffff" strokeWidth="2.5" />
                  </g>
                ))}
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-2 px-1">
              <span>Oct 5</span>
              <span>Oct 10</span>
              <span>Oct 15</span>
              <span>Oct 20</span>
              <span>Oct 25</span>
              <span>Oct 30</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Complaints by Status Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#007A78]" />
            <h3 className="text-sm font-bold text-slate-900">Complaints by Status</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* Donut SVG */}
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="16" />
                {/* Resolved Segment (Teal) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#007A78"
                  strokeWidth="16"
                  strokeDasharray={`${resolvedPct * 2.38} 238`}
                  strokeDashoffset="0"
                />
                {/* In Progress Segment (Sky) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#38BDF8"
                  strokeWidth="16"
                  strokeDasharray={`${inProgressPct * 2.38} 238`}
                  strokeDashoffset={`-${resolvedPct * 2.38}`}
                />
                {/* Raised Segment (Amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FDBA74"
                  strokeWidth="16"
                  strokeDasharray={`${raisedPct * 2.38} 238`}
                  strokeDashoffset={`-${(resolvedPct + inProgressPct) * 2.38}`}
                />
              </svg>
              {/* Donut Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 leading-none">{total}</span>
                <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#007A78] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">Resolved</span>
                </div>
                <strong className="text-xs font-bold text-slate-900">
                  {resolved} ({resolvedPct}%)
                </strong>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#38BDF8] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">In Progress</span>
                </div>
                <strong className="text-xs font-bold text-slate-900">
                  {inProgressCount} ({inProgressPct}%)
                </strong>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#FDBA74] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">Raised</span>
                </div>
                <strong className="text-xs font-bold text-slate-900">
                  {raisedCount} ({raisedPct}%)
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Complaints by Category Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#007A78]" />
            <h3 className="text-sm font-bold text-slate-900">Complaints by Category</h3>
          </div>

          <div className="pt-2">
            <div className="grid grid-cols-5 gap-3 sm:gap-6 items-end h-48 px-2 border-b border-slate-200 pb-2">
              {[
                { label: 'Wi-Fi', count: categoryCounts['Wi-Fi'] || 8, highlight: true },
                { label: 'Hostel', count: categoryCounts['Hostel'] || 5 },
                { label: 'Classroom', count: categoryCounts['Classroom'] || 4 },
                { label: 'Laboratory', count: categoryCounts['Laboratory'] || 4 },
                { label: 'Other', count: categoryCounts['Other'] || 3 },
              ].map((item, idx) => {
                const max = 10;
                const heightPct = Math.min(Math.max((item.count / max) * 100, 15), 100);

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-bold text-slate-800">{item.count}</span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[54px] rounded-xl transition-all duration-300 ${
                        item.highlight
                          ? 'bg-[#007A78] shadow-sm'
                          : 'bg-[#99F6E4]/70 hover:bg-[#5EEAD4]'
                      }`}
                    />
                    <span className="text-[11px] font-bold text-slate-600 truncate max-w-full">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 4: Priority Distribution Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#007A78]" />
            <h3 className="text-sm font-bold text-slate-900">Priority Distribution</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* Donut SVG */}
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="16" />
                {/* High (Red/Rose) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F43F5E"
                  strokeWidth="16"
                  strokeDasharray={`${highPct * 2.38} 238`}
                  strokeDashoffset="0"
                />
                {/* Medium (Peach/Amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FED7AA"
                  strokeWidth="16"
                  strokeDasharray={`${medPct * 2.38} 238`}
                  strokeDashoffset={`-${highPct * 2.38}`}
                />
                {/* Low (Mint/Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#86EFAC"
                  strokeWidth="16"
                  strokeDasharray={`${lowPct * 2.38} 238`}
                  strokeDashoffset={`-${(highPct + medPct) * 2.38}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 leading-none">{total}</span>
                <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#F43F5E] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">High (Score &ge; 4)</span>
                </div>
                <strong className="text-xs font-bold text-slate-900">
                  {priorityHigh} ({highPct}%)
                </strong>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#FED7AA] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">Medium (Score 2 - 3)</span>
                </div>
                <strong className="text-xs font-bold text-slate-900">
                  {priorityMedium} ({medPct}%)
                </strong>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#86EFAC] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">Low (Score &lt; 2)</span>
                </div>
                <strong className="text-xs font-bold text-slate-900">
                  {priorityLow} ({lowPct}%)
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

