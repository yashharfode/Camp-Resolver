'use client';

import React, { useState } from 'react';
import { Database, Menu, RotateCcw, Check } from 'lucide-react';
import { FirebaseConnectionStatus } from '@/services/complaintService';

interface DashboardHeaderProps {
  onResetSampleData: () => void;
  onOpenMobileMenu: () => void;
  connectionStatus: FirebaseConnectionStatus;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onResetSampleData,
  onOpenMobileMenu,
  connectionStatus,
}) => {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [justReset, setJustReset] = useState(false);

  const handleConfirmReset = () => {
    onResetSampleData();
    setResetConfirmOpen(false);
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2500);
  };

  const renderConnectionPill = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#0F766E] bg-[#F0FDFA] border border-[#99F6E4] rounded-full shadow-2xs cursor-default"
            title="Connected to Firebase Firestore"
          >
            <Database className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Firebase Connected</span>
            <span className="h-2 w-2 rounded-full bg-[#14B8A6] animate-pulse" />
          </div>
        );
      case 'connecting':
        return (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full shadow-2xs cursor-default"
            title="Connecting to Firebase..."
          >
            <Database className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Connecting...</span>
          </div>
        );
      case 'fallback':
      default:
        return (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#0F766E] bg-[#F0FDFA] border border-[#99F6E4] rounded-full shadow-2xs cursor-default"
            title="Offline Local Storage active"
          >
            <Database className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Local Storage Active</span>
            <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
          </div>
        );
    }
  };

  return (
    <header className="py-2 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Campus Complaint Management System
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Report, track and resolve campus issues
            </p>
          </div>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* CODE CRACK 3.0 Badge */}
          <span className="inline-flex items-center px-3.5 py-1 text-xs font-semibold bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4] rounded-full shadow-2xs">
            CODE CRACK 3.0
          </span>

          {/* Database Connection Pill */}
          {renderConnectionPill()}

          {/* Reset Sample Records Button */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow-2xs transition"
            title="Reset to sample dataset C01 - C04"
          >
            {justReset ? (
              <>
                <Check className="w-3 h-3 text-teal-600" />
                <span className="text-teal-700 font-semibold">Reset Done</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset Data</span>
              </>
            )}
          </button>
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
                  This will reload the initial benchmark dataset (C01 Wi-Fi 48h, C02 Hostel 8h, C03 Classroom 72h, and C04 Laboratory 24h).
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
                className="px-4 py-2 text-xs font-semibold text-white bg-[#007A78] hover:bg-[#0b6664] rounded-lg shadow-sm transition active:scale-98"
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
