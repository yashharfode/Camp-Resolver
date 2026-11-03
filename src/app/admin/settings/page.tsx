'use client';

import React, { useState, useEffect } from 'react';
import { Complaint } from '@/types/complaint';
import { getStoredComplaints } from '@/utils/storage';
import {
  subscribeToComplaints,
  resetDatabaseToSampleComplaints,
  FirebaseConnectionStatus,
  COLLECTION_NAME,
} from '@/services/complaintService';
import { AdminLoginGuard, useAdminAuth } from '@/components/AdminLoginGuard';
import { Sidebar } from '@/components/Sidebar';
import { PriorityExplanation } from '@/components/PriorityExplanation';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import {
  Menu,
  Settings,
  RotateCcw,
  Database,
  Lock,
  ShieldCheck,
  Check,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<FirebaseConnectionStatus>('connecting');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { logout } = useAdminAuth();

  useEffect(() => {
    const cached = getStoredComplaints();
    setComplaints(cached);

    const unsubscribe = subscribeToComplaints(
      (updated) => {
        setComplaints(updated);
      },
      (status) => {
        setConnectionStatus(status);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleResetData = async () => {
    if (
      window.confirm(
        'Are you sure you want to restore the official benchmark sample dataset (C01 - C04)? All newly added records will be replaced.'
      )
    ) {
      const reset = await resetDatabaseToSampleComplaints();
      setComplaints(reset);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  return (
    <AdminLoginGuard>
      <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
        <Sidebar
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-slate-800">Admin Settings</span>
            <div className="w-8" />
          </header>

          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-11 h-11 rounded-2xl bg-[#E6FFFA] text-[#007A78] flex items-center justify-center border border-[#99F6E4]">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  System Settings & Controls
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Database persistence controls, algorithmic configuration, and administrative credentials
                </p>
              </div>
            </div>

            {/* Persistence & Database Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#007A78]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Database & Cloud Sync Configuration
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold block">Firestore Collection</span>
                  <strong className="font-mono text-slate-800 text-xs block">
                    {COLLECTION_NAME}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold block">Connection Status</span>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="capitalize">{connectionStatus}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold block">Local Cache Records</span>
                  <strong className="text-slate-800 text-sm block">
                    {complaints.length} Complaints Loaded
                  </strong>
                </div>
              </div>
            </div>

            {/* Benchmark Reset Action */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#007A78]" />
                    <span>Reset to Benchmark Sample Data (C01 - C04)</span>
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                    Instantly restores the official CODE CRACK 3.0 evaluation complaints (C01 Wi-Fi, C02 Hostel, C03 Classroom, C04 Laboratory) for grading and algorithmic inspection.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-2 shrink-0 border border-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Restore Sample Data</span>
                </button>
              </div>

              {resetSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Benchmark sample dataset successfully restored!</span>
                </div>
              )}
            </div>

            {/* Admin Security Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Lock className="w-4 h-4 text-[#007A78]" />
                  <span>Administrator Security Session</span>
                </div>
                <p className="text-xs text-slate-500">
                  Access Key: <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono font-bold">123456</code>. You can end your administrative session anytime.
                </p>
              </div>

              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Log Out of Admin Desk</span>
              </button>
            </div>

            {/* Urgency Explanation Reference */}
            <PriorityExplanation />
          </main>
        </div>

        <ChatbotWidget />
      </div>
    </AdminLoginGuard>
  );
}

