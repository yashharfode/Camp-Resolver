'use client';

import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintCategory } from '@/types/complaint';
import { getStoredComplaints, generateNextComplaintId } from '@/utils/storage';
import { subscribeToComplaints, addComplaint } from '@/services/complaintService';
import { AdminLoginGuard } from '@/components/AdminLoginGuard';
import { Sidebar } from '@/components/Sidebar';
import { ComplaintForm } from '@/components/ComplaintForm';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { Menu, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function AdminSubmitComplaintPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    const cached = getStoredComplaints();
    setComplaints(cached);

    const unsubscribe = subscribeToComplaints((updated) => {
      setComplaints(updated);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateComplaint = async (data: {
    category: ComplaintCategory;
    description: string;
  }) => {
    const nextId = generateNextComplaintId(complaints);
    const nowStr = new Date().toISOString();

    const created: Complaint = {
      id: nextId,
      category: data.category,
      description: data.description.trim(),
      submittedAt: nowStr,
      status: 'Raised',
      createdAt: nowStr,
      adminRemarks: 'Ticket created via Admin Desk',
      statusUpdates: [
        {
          status: 'Raised',
          timestamp: nowStr,
          note: 'Created by Campus Administrator',
        },
      ],
    };

    await addComplaint(created);
    setComplaints((prev) => [created, ...prev]);
    setLastSubmittedId(nextId);
    return created;
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
            <span className="font-bold text-sm text-slate-800">Submit Complaint</span>
            <div className="w-8" />
          </header>

          <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-11 h-11 rounded-2xl bg-[#E6FFFA] text-[#007A78] flex items-center justify-center border border-[#99F6E4]">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Submit Campus Complaint
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Direct administrative grievance logging with instant sequential ID assignment
                </p>
              </div>
            </div>

            {lastSubmittedId && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-bold animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Complaint {lastSubmittedId} has been successfully recorded!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLastSubmittedId(null)}
                  className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <ComplaintForm onSubmitComplaint={handleCreateComplaint} />
            </div>
          </main>
        </div>

        <ChatbotWidget />
      </div>
    </AdminLoginGuard>
  );
}
