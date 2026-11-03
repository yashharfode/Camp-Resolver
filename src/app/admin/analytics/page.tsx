'use client';

import React, { useState, useEffect } from 'react';
import { Complaint } from '@/types/complaint';
import { getStoredComplaints } from '@/utils/storage';
import { subscribeToComplaints } from '@/services/complaintService';
import { AdminLoginGuard } from '@/components/AdminLoginGuard';
import { Sidebar } from '@/components/Sidebar';
import { AnalyticsView } from '@/components/AnalyticsView';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { Menu } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const cached = getStoredComplaints();
    setComplaints(cached);
    setCurrentTimestamp(Date.now());

    const unsubscribe = subscribeToComplaints((updated) => {
      setComplaints(updated);
    });

    return () => unsubscribe();
  }, []);

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
            <span className="font-bold text-sm text-slate-800">Analytics</span>
            <div className="w-8" />
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            <AnalyticsView complaints={complaints} currentTimestamp={currentTimestamp} />
          </main>
        </div>

        <ChatbotWidget />
      </div>
    </AdminLoginGuard>
  );
}
