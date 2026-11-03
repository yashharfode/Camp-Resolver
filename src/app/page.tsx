'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, EvaluatedComplaint, FilterState } from '@/types/complaint';
import {
  getStoredComplaints,
  saveComplaints,
  resetToSampleComplaints,
  generateNextComplaintId,
} from '@/utils/storage';
import {
  evaluateComplaint,
  getPriorityQueue,
  getSummaryStats,
} from '@/utils/urgency';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SummaryCards } from '@/components/SummaryCards';
import { ComplaintForm } from '@/components/ComplaintForm';
import { PriorityQueue } from '@/components/PriorityQueue';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { ComplaintTable } from '@/components/ComplaintTable';
import { ComplaintDetailsModal } from '@/components/ComplaintDetailsModal';
import { STATUS_TRANSITIONS } from '@/utils/constants';

export default function DashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [selectedComplaint, setSelectedComplaint] = useState<EvaluatedComplaint | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'ALL',
    status: 'ALL',
  });

  // Load complaints from localStorage once on client mount
  useEffect(() => {
    const now = Date.now();
    setCurrentTimestamp(now);
    const loaded = getStoredComplaints();
    setComplaints(loaded);
    setIsLoaded(true);

    // Refresh timestamp every minute so age and urgency score stay live
    const interval = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Update selectedComplaint reference if complaints array updates
  useEffect(() => {
    if (selectedComplaint) {
      const updated = complaints.find((c) => c.id === selectedComplaint.id);
      if (updated) {
        setSelectedComplaint(evaluateComplaint(updated, currentTimestamp));
      }
    }
  }, [complaints, currentTimestamp]);

  // Handle complaint creation
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

    const updatedComplaints = [created, ...complaints];
    setComplaints(updatedComplaints);
    saveComplaints(updatedComplaints);
    setCurrentTimestamp(Date.now());

    return created;
  };

  // Handle status advancement (Raised -> In Progress -> Resolved)
  const handleAdvanceStatus = (id: string) => {
    setComplaints((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;

      const nextStatus = STATUS_TRANSITIONS[target.status];
      if (!nextStatus) return prev; // Already resolved, no further transition

      const updated = prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: nextStatus,
            resolvedAt: nextStatus === 'Resolved' ? new Date().toISOString() : c.resolvedAt,
          };
        }
        return c;
      });

      saveComplaints(updated);
      return updated;
    });

    setCurrentTimestamp(Date.now());
  };

  // Handle reset to initial sample records (C01 - C04)
  const handleResetSampleData = () => {
    const samples = resetToSampleComplaints();
    setComplaints(samples);
    setSelectedComplaint(null);
    setFilters({ searchQuery: '', category: 'ALL', status: 'ALL' });
    setCurrentTimestamp(Date.now());
  };

  // Handle reset of search/filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'ALL',
      status: 'ALL',
    });
  };

  // Evaluate all complaints with live age and urgency
  const evaluatedComplaints = useMemo(() => {
    return complaints.map((c) => evaluateComplaint(c, currentTimestamp));
  }, [complaints, currentTimestamp]);

  // Compute Summary Statistics
  const summaryStats = useMemo(() => {
    return getSummaryStats(complaints, currentTimestamp);
  }, [complaints, currentTimestamp]);

  // Compute Priority Queue (Top 3 highest-priority unresolved complaints)
  const topPriorityComplaints = useMemo(() => {
    return getPriorityQueue(complaints, 3, currentTimestamp);
  }, [complaints, currentTimestamp]);

  const totalUnresolvedCount = useMemo(() => {
    return complaints.filter((c) => c.status === 'Raised' || c.status === 'In Progress').length;
  }, [complaints]);

  // Apply search query and filters to complaints table
  const filteredComplaints = useMemo(() => {
    return evaluatedComplaints.filter((c) => {
      // Search matching (ID or Description)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.trim().toLowerCase();
        const matchesId = c.id.toLowerCase().includes(query);
        const matchesDesc = c.description.toLowerCase().includes(query);
        if (!matchesId && !matchesDesc) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'ALL' && c.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status !== 'ALL' && c.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [evaluatedComplaints, filters]);

  // Render a clean loading shell during client hydration
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Initializing Campus Complaint System...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Application Header */}
      <DashboardHeader
        onResetSampleData={handleResetSampleData}
        complaintCount={complaints.length}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Section 1: Summary Statistics Cards */}
        <section aria-label="Dashboard Overview Metrics">
          <SummaryCards
            stats={summaryStats}
            currentStatusFilter={filters.status}
            onFilterByStatus={(newStatus) =>
              setFilters((prev) => ({ ...prev, status: newStatus }))
            }
          />
        </section>

        {/* Section 2: Priority Queue & Urgency Analytical Highlight */}
        <PriorityQueue
          topComplaints={topPriorityComplaints}
          totalUnresolvedCount={totalUnresolvedCount}
          onAdvanceStatus={handleAdvanceStatus}
          onViewDetails={(c) => setSelectedComplaint(c)}
        />

        {/* Section 3: Submit New Complaint Form */}
        <section aria-label="Complaint Submission">
          <ComplaintForm onSubmitComplaint={handleCreateComplaint} />
        </section>

        {/* Section 4: Search & Filtering Controls */}
        <section aria-label="Search and Filter Complaints">
          <SearchAndFilters
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={handleResetFilters}
            totalCount={complaints.length}
            filteredCount={filteredComplaints.length}
          />
        </section>

        {/* Section 5: Complaint Management Table */}
        <section aria-label="Complaints Management Table" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              All Campus Complaints
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Click any row to inspect complete audit details
            </span>
          </div>

          <ComplaintTable
            complaints={filteredComplaints}
            totalComplaintsCount={complaints.length}
            onAdvanceStatus={handleAdvanceStatus}
            onViewDetails={(c) => setSelectedComplaint(c)}
            onResetFilters={handleResetFilters}
          />
        </section>
      </main>

      {/* Footer Note */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>
            Campus Complaint Management System • CODE CRACK 3.0 Final Submission
          </p>
          <p className="text-[11px] text-slate-400">
            Note: All complaint records are stored locally in the current browser via HTML5 LocalStorage.
          </p>
        </div>
      </footer>

      {/* Details Modal */}
      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onAdvanceStatus={handleAdvanceStatus}
        />
      )}
    </div>
  );
}
