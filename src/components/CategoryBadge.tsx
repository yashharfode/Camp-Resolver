import React from 'react';
import { ComplaintCategory } from '@/types/complaint';
import { Wifi, Home, BookOpen, FlaskConical, HelpCircle } from 'lucide-react';

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
      case 'Laboratory':
        return {
          icon: FlaskConical,
          bg: 'bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]',
        };
      case 'Wi-Fi':
        return {
          icon: Wifi,
          bg: 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]',
        };
      case 'Hostel':
        return {
          icon: Home,
          bg: 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]',
        };
      case 'Classroom':
        return {
          icon: BookOpen,
          bg: 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]',
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
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold ${sizeClasses} ${bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{category}</span>
    </span>
  );
};
