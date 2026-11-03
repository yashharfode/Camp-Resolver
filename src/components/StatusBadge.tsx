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
          container: 'bg-orange-50 text-orange-700 border-orange-200/80',
          dot: 'bg-orange-500',
        };
      case 'In Progress':
        return {
          container: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500',
        };
      case 'Resolved':
        return {
          container: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
      case 'High Priority':
        return {
          container: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dot: 'bg-rose-500',
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
      ? 'px-2 py-0.5 text-xs font-medium'
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
