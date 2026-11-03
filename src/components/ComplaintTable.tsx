'use client';

import React from 'react';
import { EvaluatedComplaint } from '@/types/complaint';
import { CategoryBadge } from './CategoryBadge';
import { StatusBadge } from './StatusBadge';
import { formatAge } from '@/utils/urgency';
import { EmptyState } from './EmptyState';
import { ArrowRight, CheckCircle2, Eye, Flame, Clock } from 'lucide-react';

interface ComplaintTableProps {
  complaints: EvaluatedComplaint[];
  totalComplaintsCount: number;
  onAdvanceStatus: (id: string) => void;
  onViewDetails: (complaint: EvaluatedComplaint) => void;
  onResetFilters?: () => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  totalComplaintsCount,
  onAdvanceStatus,
  onViewDetails,
  onResetFilters,
}) => {
  if (totalComplaintsCount === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <EmptyState type="no-complaints" />
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <EmptyState type="no-matches" onReset={onResetFilters} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Table responsive container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="px-4 py-3 sm:px-6">ID</th>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3 min-w-[220px]">Description</th>
              <th scope="col" className="px-4 py-3">Submitted</th>
              <th scope="col" className="px-4 py-3">Urgency</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {complaints.map((c) => {
              const isResolved = c.status === 'Resolved';

              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(c)}
                >
                  {/* ID */}
                  <td className="px-4 py-3.5 sm:px-6 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {c.id}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <CategoryBadge category={c.category} size="sm" showWeight />
                  </td>

                  {/* Description with truncate & view more */}
                  <td className="px-4 py-3.5">
                    <div className="max-w-md">
                      <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  </td>

                  {/* Submitted (Age) */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{formatAge(c.ageInHours)}</span>
                    </div>
                  </td>

                  {/* Urgency Score */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {isResolved ? (
                      <span className="text-[11px] font-medium text-slate-400 italic">
                        Resolved
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${
                          c.urgencyTier === 'High'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : c.urgencyTier === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title={`Score = ${c.categoryWeight} + floor(${c.ageInHours}/24) = ${c.urgencyScore}`}
                      >
                        <Flame className="w-3 h-3 text-rose-500" />
                        <span>{c.urgencyScore}</span>
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={c.status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td
                    className="px-4 py-3.5 sm:px-6 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(c)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="View Full Complaint Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Status advancement button */}
                      {c.status === 'Raised' && (
                        <button
                          type="button"
                          onClick={() => onAdvanceStatus(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition active:scale-98"
                          title="Advance status from Raised to In Progress"
                        >
                          <span>To In Progress</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {c.status === 'In Progress' && (
                        <button
                          type="button"
                          onClick={() => onAdvanceStatus(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition active:scale-98"
                          title="Advance status from In Progress to Resolved"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      )}

                      {c.status === 'Resolved' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
