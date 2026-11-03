import React from 'react';
import { ComplaintCategory } from '@/types/complaint';
import { CATEGORY_WEIGHTS } from '@/utils/constants';
import { Wifi, Home, BookOpen, FlaskConical, HelpCircle } from 'lucide-react';

interface CategoryBadgeProps {
  category: ComplaintCategory;
  showWeight?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showWeight = false,
  size = 'md',
  className = '',
}) => {
  const getCategoryDetails = () => {
    switch (category) {
      case 'Laboratory':
        return {
          icon: FlaskConical,
          bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
        };
      case 'Wi-Fi':
        return {
          icon: Wifi,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        };
      case 'Hostel':
        return {
          icon: Home,
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
        };
      case 'Classroom':
        return {
          icon: BookOpen,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        };
      case 'Other':
      default:
        return {
          icon: HelpCircle,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const { icon: Icon, bg } = getCategoryDetails();
  const weight = CATEGORY_WEIGHTS[category] ?? 1;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${sizeClasses} ${bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{category}</span>
      {showWeight && (
        <span
          className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white/70 border border-current/20 shadow-2xs"
          title={`Category base weight: ${weight}`}
        >
          W: {weight}
        </span>
      )}
    </span>
  );
};
