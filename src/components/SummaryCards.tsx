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
      icon: ClipboardList,
      iconBox: 'bg-[#F0FDFA] text-[#007A78]',
      waveColor: 'fill-[#CCFBF1]/60',
      active: currentStatusFilter === 'ALL',
      onClick: () => onFilterByStatus?.('ALL'),
    },
    {
      id: 'pending',
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      iconBox: 'bg-[#FFFBEB] text-[#D97706]',
      waveColor: 'fill-[#FEF3C7]/60',
      active: false,
      onClick: () => onFilterByStatus?.('Raised'),
    },
    {
      id: 'resolved',
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      iconBox: 'bg-[#ECFDF5] text-[#059669]',
      waveColor: 'fill-[#D1FAE5]/60',
      active: currentStatusFilter === 'Resolved',
      onClick: () => onFilterByStatus?.('Resolved'),
    },
    {
      id: 'high-priority',
      title: 'High Priority',
      value: stats.highPriority,
      icon: Flame,
      iconBox: 'bg-[#FEF2F2] text-[#DC2626]',
      waveColor: 'fill-[#FFE4E6]/60',
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
                ? 'ring-2 ring-teal-500/20 border-teal-400 shadow-xs'
                : 'border-slate-200/80 shadow-xs'
            }`}
          >
            {/* Soft decorative bottom-right organic wave */}
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-90 w-32 h-20">
              <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M0 70 C30 45, 60 70, 100 30 L100 70 Z"
                  className={card.waveColor}
                />
              </svg>
            </div>

            {/* Header: Icon in rounded square + Title */}
            <div className="flex items-center gap-3 relative z-10">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.iconBox}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">
                {card.title}
              </span>
            </div>

            {/* Large number */}
            <div className="mt-3 relative z-10 pl-1">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
