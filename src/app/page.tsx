'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Complaint, ComplaintCategory, EvaluatedComplaint, FilterState } from '@/types/complaint';
import { generateNextComplaintId } from '@/utils/storage';
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
import { STATUS_TRANSITIONS } from '@/utils/constants';
import {
  subscribeToComplaints,
  addComplaint,
  updateComplaintStatus,
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

  // Connect to Firebase and listen for real-time updates
  useEffect(() => {
    setCurrentTimestamp(Date.now());

    // Subscribe to Firebase Firestore complaints collection
    // If documents already exist, they are preserved and never disturbed
    const unsubscribe = subscribeToComplaints(
      (updatedComplaints) => {
        setComplaints(updatedComplaints);
        setIsLoaded(true);
      },
      (status) => {
        setConnectionStatus(status);
      }
    );

    // Refresh timestamp every minute so age and urgency score stay dynamic
    const interval = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Sync selectedComplaint reference when complaints array updates
  useEffect(() => {
    if (selectedComplaint) {
      const updated = complaints.find((c) => c.id === selectedComplaint.id);
      if (updated) {
        setSelectedComplaint(evaluateComplaint(updated, currentTimestamp));
      }
    }
  }, [complaints, currentTimestamp]);

  // Handle new complaint registration
  const handleCreateComplaint = (newEntry: {
    category: ComplaintCategory;
    description: string;
  }): Complaint => {
    const newId = generateNextComplaintId(complaints);
    const nowIso = new Date().toISOString();

    const created: Complaint = {
      id: newId,
      category: newEntry.category,
      description: newEntry.description,
      submittedAt: nowIso,
      status: 'Raised',
      createdAt: nowIso,
    };

    // Optimistic local update
    const updatedComplaints = [created, ...complaints];
    setComplaints(updatedComplaints);
    setCurrentTimestamp(Date.now());

    // Asynchronously persist to Firebase Firestore
    addComplaint(created);

    return created;
  };

  // Handle status progression (Raised -> In Progress -> Resolved)
  const handleAdvanceStatus = (id: string) => {
    const target = complaints.find((c) => c.id === id);
    if (!target) return;

    const nextStatus = STATUS_TRANSITIONS[target.status];
    if (!nextStatus) return; // Already resolved

    const resolvedAt = nextStatus === 'Resolved' ? new Date().toISOString() : target.resolvedAt;

    // Optimistic local update
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: nextStatus,
            resolvedAt,
          };
        }
        return c;
      })
    );
    setCurrentTimestamp(Date.now());

    // Persist status change to Firebase Firestore
    updateComplaintStatus(id, nextStatus, resolvedAt);
  };

  // Handle reset to initial sample records (C01 - C04)
  const handleResetSampleData = async () => {
    const samples = await resetDatabaseToSampleComplaints();
    setComplaints(samples);
    setSelectedComplaint(null);
    setFilters({ searchQuery: '', category: 'ALL', status: 'ALL' });
    setCurrentTimestamp(Date.now());
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'ALL',
      status: 'ALL',
    });
  };

  // Evaluate all complaints with live age & urgency scores
  const evaluatedComplaints = useMemo(() => {
    return complaints.map((c) => evaluateComplaint(c, currentTimestamp));
  }, [complaints, currentTimestamp]);

  // Summary statistics for 4 top cards
  const summaryStats = useMemo(() => {
    return getSummaryStats(complaints, currentTimestamp);
  }, [complaints, currentTimestamp]);

  // Priority Queue: top 3 highest-priority unresolved complaints
  const topPriorityComplaints = useMemo(() => {
    return getPriorityQueue(complaints, 3, currentTimestamp);
  }, [complaints, currentTimestamp]);

  const totalUnresolvedCount = useMemo(() => {
    return complaints.filter((c) => c.status === 'Raised' || c.status === 'In Progress').length;
  }, [complaints]);

  // Filter complaints for the management table
  const filteredComplaints = useMemo(() => {
    return evaluatedComplaints.filter((c) => {
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.trim().toLowerCase();
        const matchesId = c.id.toLowerCase().includes(query);
        const matchesDesc = c.description.toLowerCase().includes(query);
        if (!matchesId && !matchesDesc) {
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Connecting to Firebase & Initializing System...
          </span>
        </div>
      </div>
    );
  }

  return (
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
        />
      )}

      {/* Grivex AI Assistant Floating Widget */}
      <ChatbotWidget />
    </div>
  );
}
