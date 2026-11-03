'use client';

import React from 'react';
import { ComplaintCategory, ComplaintStatus, EvaluatedComplaint, FilterState } from '@/types/complaint';
import { CATEGORIES } from '@/utils/constants';
import { CategoryBadge } from './CategoryBadge';
import { StatusBadge } from './StatusBadge';
import { formatAge } from '@/utils/urgency';
import {
  Search,
  ChevronDown,
  Pencil,
  Plus,
  ArrowRight,
  Check,
  RotateCcw,
} from 'lucide-react';

interface ComplaintTableProps {
  complaints: EvaluatedComplaint[];
  totalComplaintsCount: number;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onAdvanceStatus: (id: string) => void;
  onViewDetails: (complaint: EvaluatedComplaint) => void;
  onResetFilters: () => void;
  onOpenNewComplaintModal: () => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  totalComplaintsCount,
  filters,
  onFilterChange,
  onAdvanceStatus,
  onViewDetails,
  onResetFilters,
  onOpenNewComplaintModal,
}) => {
  const isFiltered =
    filters.searchQuery.trim() !== '' ||
    filters.category !== 'ALL' ||
    filters.status !== 'ALL';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header Row with Title, Search, Filters & + New Complaint Button */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Left: Title */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            All Complaints
          </h3>
        </div>

        {/* Right: Search, Filter Dropdowns, and + New Complaint Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Bar */}
          <div className="relative min-w-[220px] sm:min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                onFilterChange({ ...filters, searchQuery: e.target.value })
              }
              placeholder="Search by ID or description..."
              className="w-full pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78]/20 focus:border-[#007A78] transition shadow-2xs"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  category: e.target.value as ComplaintCategory | 'ALL',
                })
              }
              className="pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#007A78]/20 focus:border-[#007A78] cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  status: e.target.value as ComplaintStatus | 'ALL',
                })
              }
              className="pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#007A78]/20 focus:border-[#007A78] cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Status</option>
              <option value="Raised">Raised</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters button if filters active */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* + New Complaint Solid Teal Button */}
          <button
            type="button"
            onClick={onOpenNewComplaintModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#007A78] hover:bg-[#0b6664] rounded-xl shadow-xs transition active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Complaint</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-600">
              <th scope="col" className="px-6 py-4">ID</th>
              <th scope="col" className="px-4 py-4">Category</th>
              <th scope="col" className="px-4 py-4 min-w-[280px]">Description</th>
              <th scope="col" className="px-4 py-4">Submitted</th>
              <th scope="col" className="px-4 py-4">Status</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 px-4 text-slate-500">
                  <p className="font-semibold text-slate-700 text-sm">
                    {totalComplaintsCount === 0
                      ? 'No complaints recorded yet'
                      : 'No complaints match the selected filters'}
                  </p>
                  {isFiltered && (
                    <button
                      onClick={onResetFilters}
                      className="mt-2 text-xs font-semibold text-[#007A78] hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              complaints.map((c) => {
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 font-mono">
                      {c.id}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <CategoryBadge category={c.category} size="md" />
                    </td>

                    {/* Description */}
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-800 font-normal line-clamp-1 max-w-md">
                        {c.description}
                      </p>
                    </td>

                    {/* Submitted */}
                    <td className="px-4 py-4 whitespace-nowrap text-slate-500 font-normal text-xs">
                      {formatAge(c.ageInHours)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="md" />
                    </td>

                    {/* Actions: Pencil/Inspect button & Quick advance button */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick Status advance */}
                        {c.status === 'Raised' && (
                          <button
                            type="button"
                            onClick={() => onAdvanceStatus(c.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#007A78] hover:bg-[#0b6664] rounded-lg shadow-2xs transition active:scale-98"
                            title="Advance to In Progress"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {c.status === 'In Progress' && (
                          <button
                            type="button"
                            onClick={() => onAdvanceStatus(c.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg shadow-2xs transition active:scale-98"
                            title="Mark as Resolved"
                          >
                            <span>Resolve</span>
                            <Check className="w-3 h-3" />
                          </button>
                        )}

                        {/* Pencil Edit/Details Button */}
                        <button
                          type="button"
                          onClick={() => onViewDetails(c)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition shadow-2xs"
                          title="View / Edit Details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
