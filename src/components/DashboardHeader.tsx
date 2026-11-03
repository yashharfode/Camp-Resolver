'use client';

import React, { useState } from 'react';
import { Building2, Database, RotateCcw, Check, Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
  onResetSampleData: () => void;
  complaintCount: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onResetSampleData,
  complaintCount,
}) => {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [justReset, setJustReset] = useState(false);

  const handleConfirmReset = () => {
    onResetSampleData();
    setResetConfirmOpen(false);
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2500);
  };

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Campus Complaint Management System
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full">
                  CODE CRACK 3.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Centralized student grievance desk & automated urgency prioritization
              </p>
            </div>
          </div>

          {/* Right controls: Local Storage badge & Reset Data */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Storage indicator */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100/80 rounded-lg border border-slate-200/70"
              title="All records are saved directly in browser LocalStorage"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Local Storage Active</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Reset to Sample Records Button */}
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-all hover:border-slate-400 active:scale-98"
              title="Restore original 4 sample complaints (C01 - C04)"
            >
              {justReset ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Records Restored</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Sample Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Restore Initial Sample Records?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This will reload the official evaluation dataset (C01 Wi-Fi 48h, C02 Hostel 8h, C03 Classroom 72h, and C04 Laboratory 24h). Any newly created complaint records will be replaced.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition active:scale-98"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
