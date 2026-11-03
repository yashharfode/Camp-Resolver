'use client';

import React from 'react';
import { SummaryStats, ComplaintStatus } from '@/types/complaint';
import { ClipboardList, Clock, CheckCircle2, Flame } from 'lucide-react';

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
      iconBox: 'bg-[#ECE9FE] text-[#6366F1]',
      waveColor: 'fill-[#ECE9FE]/50',
      active: currentStatusFilter === 'ALL',
      onClick: () => onFilterByStatus?.('ALL'),
    },
    {
      id: 'pending',
      title: 'Pending Complaints',
      value: stats.pending,
      description: 'Raised & In Progress',
      icon: Clock,
      iconBox: 'bg-[#FFF7ED] text-[#F97316]',
      waveColor: 'fill-[#FFEDD5]/50',
      active: false,
      onClick: () => onFilterByStatus?.('Raised'),
    },
    {
      id: 'resolved',
      title: 'Resolved Complaints',
      value: stats.resolved,
      description: 'Successfully addressed',
      icon: CheckCircle2,
      iconBox: 'bg-[#F0FDF4] text-[#16A34A]',
      waveColor: 'fill-[#DCFCE7]/50',
      active: currentStatusFilter === 'Resolved',
      onClick: () => onFilterByStatus?.('Resolved'),
    },
    {
      id: 'high-priority',
      title: 'High Priority',
      value: stats.highPriority,
      description: 'Urgency Score ≥ 4 (Unresolved)',
      icon: Flame,
      iconBox: 'bg-[#FFF1F2] text-[#E11D48]',
      waveColor: 'fill-[#FFE4E6]/50',
      active: false,
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
            className={`relative bg-white rounded-2xl border p-5 transition-all duration-200 overflow-hidden ${
              card.onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md' : ''
            } ${
              card.active
                ? 'ring-2 ring-indigo-500/20 border-indigo-400 shadow-xs'
                : 'border-slate-200/80 shadow-xs'
            }`}
          >
            {/* Soft decorative bottom-right organic wave */}
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-80 w-28 h-20">
              <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M0 70 C30 50, 60 70, 100 35 L100 70 Z"
                  className={card.waveColor}
                />
              </svg>
            </div>

            {/* Header: Icon in rounded square + Title */}
            <div className="flex items-center gap-2.5 relative z-10">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBox}`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {card.title}
              </span>
            </div>

            {/* Large number */}
            <div className="mt-3 relative z-10">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {card.value}
              </span>
            </div>

            {/* Description */}
            <div className="mt-1 relative z-10">
              <p className="text-xs text-slate-500 font-medium">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
