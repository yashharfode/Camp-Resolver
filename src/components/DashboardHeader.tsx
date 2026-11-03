'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, RotateCcw, Check, GraduationCap, ArrowRight, XCircle, LogOut, X } from 'lucide-react';
import { FirebaseConnectionStatus } from '@/services/complaintService';
import { useAdminAuth } from './AdminLoginGuard';

interface DashboardHeaderProps {
  onResetSampleData: () => void;
  onOpenMobileMenu: () => void;
  connectionStatus?: FirebaseConnectionStatus;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onResetSampleData,
  onOpenMobileMenu,
}) => {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [justReset, setJustReset] = useState(false);
  const { logout } = useAdminAuth();

  const handleConfirmReset = () => {
    onResetSampleData();
    setResetConfirmOpen(false);
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2500);
  };

  const handleCloseDashboard = () => {
    logout();
    window.location.href = '/student';
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
          {/* Student Portal Switcher Link */}
          <Link
            href="/student"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#007A78] hover:text-white bg-[#F0FDFA] hover:bg-[#007A78] border border-[#99F6E4] rounded-full transition shadow-2xs"
            title="Open Student Complaint Portal"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Portal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {/* Reset Sample Records Button */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow-2xs transition"
            title="Reset to sample dataset C01 - C04"
          >
            {justReset ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-700 font-semibold">Reset Done</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Data</span>
              </>
            )}
          </button>

          {/* Close Dashboard Button */}
          <button
            onClick={() => setCloseConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-full shadow-2xs transition cursor-pointer"
            title="Close Dashboard and Exit"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Close Dashboard</span>
          </button>
        </div>
      </div>

      {/* Close Dashboard Confirmation Modal */}
      {closeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Close Admin Dashboard?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This will end your administrative session and return you to the Student Portal. You will need to enter the admin password (123456) to re-enter.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCloseConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCloseDashboard}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Close & Exit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
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

            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#007A78] hover:bg-[#005C5A] rounded-lg shadow-sm transition"
              >
                Yes, Restore Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
