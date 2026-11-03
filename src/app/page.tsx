'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, EvaluatedComplaint, FilterState } from '@/types/complaint';
import { getStoredComplaints, generateNextComplaintId } from '@/utils/storage';
import {
  evaluateComplaint,
  getPriorityQueue,
  getSummaryStats,
} from '@/utils/urgency';
import { Sidebar } from '@/components/Sidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SummaryCards } from '@/components/SummaryCards';
import { ComplaintForm } from '@/components/ComplaintForm';
import { PriorityQueue } from '@/components/PriorityQueue';
import { ComplaintTable } from '@/components/ComplaintTable';
import { PriorityExplanation } from '@/components/PriorityExplanation';
import { ComplaintDetailsModal } from '@/components/ComplaintDetailsModal';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { AdminLoginGuard } from '@/components/AdminLoginGuard';
import { CampResolverLogo } from '@/components/CampResolverLogo';
import { STATUS_TRANSITIONS } from '@/utils/constants';
import {
  subscribeToComplaints,
  addComplaint,
  updateComplaintStatus,
  updateComplaintStatusAndRemarks,
  resetDatabaseToSampleComplaints,
  FirebaseConnectionStatus,
} from '@/services/complaintService';

export default function DashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<FirebaseConnectionStatus>('connecting');
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [selectedComplaint, setSelectedComplaint] = useState<EvaluatedComplaint | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'ALL',
    status: 'ALL',
  });

  // Instant local load + background real-time Firebase sync
  useEffect(() => {
    const cachedComplaints = getStoredComplaints();
    setComplaints(cachedComplaints);
    setIsLoaded(true);
    setCurrentTimestamp(Date.now());

    const unsubscribe = subscribeToComplaints(
      (updatedComplaints) => {
        setComplaints(updatedComplaints);
      },
      (status) => {
        setConnectionStatus(status);
      }
    );

    const interval = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
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
      statusUpdates: [
        {
          status: 'Raised',
          timestamp: nowStr,
          note: 'Ticket registered via Admin Desk',
        },
      ],
    };

    const updatedComplaints = [created, ...complaints];
    setComplaints(updatedComplaints);
    setCurrentTimestamp(Date.now());

    await addComplaint(created);
    return created;
  };

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

  const handleResetSampleData = async () => {
    const samples = await resetDatabaseToSampleComplaints();
    setComplaints(samples);
    setSelectedComplaint(null);
    setCurrentTimestamp(Date.now());
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'ALL',
      status: 'ALL',
    });
  };

  const evaluatedComplaints = useMemo(() => {
    return complaints.map((c) => evaluateComplaint(c, currentTimestamp));
  }, [complaints, currentTimestamp]);

  const summaryStats = useMemo(() => {
    return getSummaryStats(complaints, currentTimestamp);
  }, [complaints, currentTimestamp]);

  const topPriorityComplaints = useMemo(() => {
    return getPriorityQueue(complaints, 3, currentTimestamp);
  }, [complaints, currentTimestamp]);

  const totalUnresolvedCount = useMemo(() => {
    return complaints.filter((c) => c.status === 'Raised' || c.status === 'In Progress').length;
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return evaluatedComplaints.filter((c) => {
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.trim().toLowerCase();
        const matchesId = c.id.toLowerCase().includes(query);
        const matchesDesc = (c.description || '').toLowerCase().includes(query);
        const matchesTitle = (c.title || '').toLowerCase().includes(query);
        if (!matchesId && !matchesDesc && !matchesTitle) {
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center max-w-xs w-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-center">
            <CampResolverLogo className="w-12 h-12 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Camp Resolver</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Campus Complaint Management System</p>
          </div>
          <div className="w-44 h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div className="h-full bg-[#007A78] rounded-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLoginGuard>
      <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full">
            {/* Header */}
            <DashboardHeader
              onResetSampleData={handleResetSampleData}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              connectionStatus={connectionStatus}
            />

            {/* Section 1: 4 Metric Cards */}
            <section aria-label="Metric Overview">
              <SummaryCards
                stats={summaryStats}
                currentStatusFilter={filters.status}
                onFilterByStatus={(newStatus) =>
                  setFilters((prev) => ({ ...prev, status: newStatus }))
                }
              />
            </section>

            {/* Section 2: Submit a Complaint (Left) & Unresolved Priority Queue (Right) */}
            <section
              aria-label="Submission and Priority Queue"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
            >
              {/* Left: Submit a Complaint */}
              <div id="section-submit-form" className="h-full">
                <ComplaintForm onSubmitComplaint={handleCreateComplaint} />
              </div>

              {/* Right: Unresolved Priority Queue */}
              <div id="section-priority-queue" className="h-full">
                <PriorityQueue
                  topComplaints={topPriorityComplaints}
                  totalUnresolvedCount={totalUnresolvedCount}
                  onAdvanceStatus={handleAdvanceStatus}
                  onViewDetails={(c) => setSelectedComplaint(c)}
                />
              </div>
            </section>

            {/* Section 3: All Complaints Table with Search & Filters */}
            <section id="section-complaints-table" aria-label="All Complaints Table">
              <ComplaintTable
                complaints={filteredComplaints}
                totalComplaintsCount={complaints.length}
                filters={filters}
                onFilterChange={setFilters}
                onAdvanceStatus={handleAdvanceStatus}
                onViewDetails={(c) => setSelectedComplaint(c)}
                onResetFilters={handleResetFilters}
                onOpenNewComplaintModal={() => {
                  const el = document.getElementById('section-submit-form');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
                  textarea?.focus();
                }}
              />
            </section>

            {/* Section 4: Urgency & Tie-Breaking Info Card */}
            <section id="section-urgency-info" aria-label="Urgency Scoring Reference">
              <PriorityExplanation />
            </section>
          </main>
        </div>

        {/* Details Inspection Modal */}
        {selectedComplaint && (
          <ComplaintDetailsModal
            complaint={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
            onAdvanceStatus={handleAdvanceStatus}
            onUpdateStatusAndRemarks={handleUpdateStatusAndRemarks}
          />
        )}

        {/* Camp Resolver AI Assistant Floating Widget */}
        <ChatbotWidget />
      </div>
    </AdminLoginGuard>
  );
}
