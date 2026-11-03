import React from 'react';
import { ComplaintStatus } from '@/types/complaint';

interface StatusBadgeProps {
  status: ComplaintStatus | 'High Priority';
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const getStyles = () => {
    switch (status) {
      case 'Raised':
        return {
          container: 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]',
          dot: 'bg-[#F97316]',
        };
      case 'In Progress':
        return {
          container: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]',
          dot: 'bg-[#3B82F6]',
        };
      case 'Resolved':
        return {
          container: 'bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]',
          dot: 'bg-[#22C55E]',
        };
      case 'High Priority':
        return {
          container: 'bg-[#FFF1F2] text-[#BE123C] border-[#FFE4E6]',
          dot: 'bg-[#E11D48]',
        };
      default:
        return {
          container: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const styles = getStyles();
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-semibold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${sizeClasses} ${styles.container} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${styles.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{status}</span>
    </span>
  );
};
