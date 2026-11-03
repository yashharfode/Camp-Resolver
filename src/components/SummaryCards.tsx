'use client';

import React from 'react';
import { SummaryStats, ComplaintStatus } from '@/types/complaint';
import { ClipboardList, Clock, CheckCircle2, Flame, ArrowUpRight } from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
  currentStatusFilter: ComplaintStatus | 'ALL';
  onFilterByStatus?: (status: ComplaintStatus | 'ALL') => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  stats,
  currentStatusFilter,
  onFilterByStatus,
}) => {
  const cards = [
    {
      id: 'total',
      title: 'Total Complaints',
      value: stats.total,
      description: 'All recorded campus issues',
      icon: ClipboardList,
      accent: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      activeFilter: currentStatusFilter === 'ALL',
      onClick: () => onFilterByStatus?.('ALL'),
    },
    {
      id: 'pending',
      title: 'Pending Complaints',
      value: stats.pending,
      description: 'Active Raised & In Progress issues',
      icon: Clock,
      accent: 'text-orange-600',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200/80',
      iconBg: 'bg-orange-50 text-orange-600 border-orange-100',
      activeFilter: false,
      onClick: () => {
        // Can filter to Raised
        onFilterByStatus?.('Raised');
      },
    },
    {
      id: 'resolved',
      title: 'Resolved Complaints',
      value: stats.resolved,
      description: 'Successfully addressed issues',
      icon: CheckCircle2,
      accent: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      activeFilter: currentStatusFilter === 'Resolved',
      onClick: () => onFilterByStatus?.('Resolved'),
    },
    {
      id: 'high-priority',
      title: 'High Priority',
      value: stats.highPriority,
      description: 'Urgency Score ≥ 4 (Unresolved)',
      icon: Flame,
      accent: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      activeFilter: false,
      onClick: undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className={`relative bg-white rounded-xl border p-5 transition-all duration-200 ${
              card.onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md' : ''
            } ${
              card.activeFilter
                ? 'ring-2 ring-indigo-500/30 border-indigo-400'
                : 'border-slate-200/80 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center border ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {card.value}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">{card.description}</p>
              {card.onClick && (
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-indigo-600 flex items-center">
                  Filter
                  <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
