'use client';

import React, { useState } from 'react';
import { Complaint, ComplaintCategory } from '@/types/complaint';
import { CATEGORIES } from '@/utils/constants';
import { PenSquare, Send, CheckCircle2, AlertCircle, Wifi, Home, BookOpen, FlaskConical, HelpCircle, ChevronDown } from 'lucide-react';

interface ComplaintFormProps {
  onSubmitComplaint: (newComplaint: {
    category: ComplaintCategory;
    description: string;
  }) => Complaint;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmitComplaint }) => {
  const [category, setCategory] = useState<ComplaintCategory | 'Wi-Fi'>('Wi-Fi');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ category?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const getCategoryIcon = (cat: ComplaintCategory) => {
    switch (cat) {
      case 'Laboratory':
        return FlaskConical;
      case 'Wi-Fi':
        return Wifi;
      case 'Hostel':
        return Home;
      case 'Classroom':
        return BookOpen;
      case 'Other':
      default:
        return HelpCircle;
    }
  };

  const SelectedIcon = getCategoryIcon(category as ComplaintCategory);

  const validate = () => {
    const newErrors: { category?: string; description?: string } = {};

    if (!category) {
      newErrors.category = 'Please select a complaint category.';
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      newErrors.description = 'Description is required and cannot be empty.';
    } else if (trimmedDescription.length < 5) {
      newErrors.description = 'Please provide at least 5 characters.';
    } else if (trimmedDescription.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const created = onSubmitComplaint({
        category: category as ComplaintCategory,
        description: description.trim(),
      });

      setDescription('');
      setErrors({});
      setSubmittedId(created.id);

      setTimeout(() => {
        setSubmittedId(null);
      }, 4000);
    } catch (error) {
      console.error('Failed to submit complaint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#ECE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
            <PenSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Submit a Complaint
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Report any campus issue (All fields are required)
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {submittedId && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Complaint Registered!</span> Assigned ID{' '}
              <strong className="font-mono">{submittedId}</strong> with status{' '}
              <span className="font-semibold text-orange-700">Raised</span>.
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Complaint Category <span className="text-rose-500">*</span>
            </label>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <SelectedIcon className="w-4 h-4" />
              </div>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as ComplaintCategory);
                  if (errors.category) {
                    setErrors((prev) => ({ ...prev, category: undefined }));
                  }
                }}
                className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition shadow-2xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {errors.category && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.category}</span>
              </p>
            )}
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>

            <div className="relative">
              <textarea
                rows={4}
                value={description}
                maxLength={500}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                placeholder="Describe your issue in detail..."
                className={`w-full rounded-xl border p-3 pb-7 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition shadow-2xs resize-none ${
                  errors.description
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />

              {/* Character counter in bottom right */}
              <div className="absolute right-3 bottom-2 text-[10px] font-medium text-slate-400 pointer-events-none">
                {description.length} / 500
              </div>
            </div>

            {errors.description && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all active:scale-[0.99]"
            >
              <Send className="w-4 h-4 -rotate-45" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
