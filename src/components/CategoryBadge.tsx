import React from 'react';
import { ComplaintCategory } from '@/types/complaint';
import { Wifi, Home, BookOpen, FlaskConical, HelpCircle, AlertTriangle } from 'lucide-react';

interface CategoryBadgeProps {
  category: ComplaintCategory;
  showWeight?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  className = '',
}) => {
  const getCategoryDetails = () => {
    switch (category) {
      case 'Emergency':
        return {
          icon: AlertTriangle,
          bg: 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse',
        };
      case 'Laboratory':
        return {
          icon: FlaskConical,
          bg: 'bg-[#E6FFFA] text-[#0D9488] border-[#99F6E4]',
        };
      case 'Wi-Fi':
        return {
          icon: Wifi,
          bg: 'bg-[#E6FFFA] text-[#0F766E] border-[#99F6E4]',
        };
      case 'Hostel':
        return {
          icon: Home,
          bg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
        };
      case 'Classroom':
        return {
          icon: BookOpen,
          bg: 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]',
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

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border ${sizeClasses} ${bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{category}</span>
    </span>
  );
};
