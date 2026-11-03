'use client';

import React, { useState } from 'react';
import { Complaint, ComplaintCategory } from '@/types/complaint';
import { CATEGORIES, CATEGORY_WEIGHTS } from '@/utils/constants';
import { PlusCircle, Send, CheckCircle2, AlertCircle, Wifi, Home, BookOpen, FlaskConical, HelpCircle } from 'lucide-react';

interface ComplaintFormProps {
  onSubmitComplaint: (newComplaint: {
    category: ComplaintCategory;
    description: string;
  }) => Complaint;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmitComplaint }) => {
  const [category, setCategory] = useState<ComplaintCategory | ''>('');
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

  const validate = () => {
    const newErrors: { category?: string; description?: string } = {};

    if (!category) {
      newErrors.category = 'Please select a complaint category.';
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      newErrors.description = 'Description is required and cannot be empty or whitespace only.';
    } else if (trimmedDescription.length < 5) {
      newErrors.description = 'Please provide a more detailed description (at least 5 characters).';
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

      // Clear form
      setCategory('');
      setDescription('');
      setErrors({});
      setSubmittedId(created.id);

      // Auto dismiss success toast after 4 seconds
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
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
      {/* Form header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <PlusCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Submit a Campus Complaint
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Student submissions receive initial status 'Raised' and dynamic urgency scoring
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          Auto ID Generated
        </span>
      </div>

      {/* Success banner */}
      {submittedId && (
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Complaint Registered Successfully!</span>
            <p className="mt-0.5 text-emerald-700">
              Your issue was assigned ID <strong className="font-mono font-bold">{submittedId}</strong> with status <span className="font-semibold text-orange-700">Raised</span> and has been queued for campus administrative review.
            </p>
          </div>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Complaint Category <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat);
              const isSelected = category === cat;
              const weight = CATEGORY_WEIGHTS[cat];

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    if (errors.category) {
                      setErrors((prev) => ({ ...prev, category: undefined }));
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{cat}</span>
                  <span
                    className={`mt-1 text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected
                        ? 'bg-indigo-200/60 text-indigo-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    Weight: {weight}
                  </span>
                </button>
              );
            })}
          </div>

          {errors.category && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.category}</span>
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="complaint-description"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Description <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {description.trim().length} characters
            </span>
          </div>

          <textarea
            id="complaint-description"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            placeholder="Describe your issue in detail..."
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
              errors.description
                ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
            }`}
          />

          {errors.description && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.description}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-sm transition active:scale-98"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
