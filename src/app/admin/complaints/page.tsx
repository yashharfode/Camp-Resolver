'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, EvaluatedComplaint, FilterState } from '@/types/complaint';
import { getStoredComplaints } from '@/utils/storage';
import { evaluateComplaint } from '@/utils/urgency';
import {
  subscribeToComplaints,
  updateComplaintStatusAndRemarks,
  FirebaseConnectionStatus,
} from '@/services/complaintService';
import { AdminLoginGuard } from '@/components/AdminLoginGuard';
import { Sidebar } from '@/components/Sidebar';
import { ComplaintTable } from '@/components/ComplaintTable';
import { ComplaintDetailsModal } from '@/components/ComplaintDetailsModal';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { Menu, ClipboardList } from 'lucide-react';
import { STATUS_TRANSITIONS } from '@/utils/constants';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [selectedComplaint, setSelectedComplaint] = useState<EvaluatedComplaint | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'ALL',
    status: 'ALL',
  });

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

  const filteredComplaints = useMemo(() => {
    return evaluatedComplaints.filter((c) => {
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.trim().toLowerCase();
        const matchesId = c.id.toLowerCase().includes(query);
        const matchesDesc = (c.description || '').toLowerCase().includes(query);
        const matchesTitle = (c.title || '').toLowerCase().includes(query);
        const matchesStudent = (c.studentName || '').toLowerCase().includes(query);
        const matchesScholar = (c.scholarNumber || '').toLowerCase().includes(query);
        if (!matchesId && !matchesDesc && !matchesTitle && !matchesStudent && !matchesScholar) {
          return false;
        }
      }

      if (filters.category !== 'ALL' && c.category !== filters.category) {
        return false;
      }

      if (filters.status !== 'ALL' && c.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [evaluatedComplaints, filters]);

  const handleAdvanceStatus = async (id: string) => {
    const target = complaints.find((c) => c.id === id);
    if (!target) return;
    const nextStatus = STATUS_TRANSITIONS[target.status];
    if (!nextStatus) return;

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

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'ALL',
      status: 'ALL',
    });
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
            <span className="font-bold text-sm text-slate-800">All Complaints</span>
            <div className="w-8" />
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            <ComplaintTable
              complaints={filteredComplaints}
              totalComplaintsCount={complaints.length}
              filters={filters}
              onFilterChange={setFilters}
              onAdvanceStatus={handleAdvanceStatus}
              onViewDetails={setSelectedComplaint}
              onResetFilters={handleResetFilters}
            />
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

