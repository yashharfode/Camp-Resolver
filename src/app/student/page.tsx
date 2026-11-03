'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Complaint, ComplaintCategory, EvaluatedComplaint } from '@/types/complaint';
import { CATEGORIES, CATEGORY_WEIGHTS } from '@/utils/constants';
import { getStoredComplaints, generateNextComplaintId } from '@/utils/storage';
import { evaluateComplaint, formatAge } from '@/utils/urgency';
import {
  subscribeToComplaints,
  addComplaint,
  FirebaseConnectionStatus,
} from '@/services/complaintService';
import { CategoryBadge } from '@/components/CategoryBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import {
  Layers,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  Clock,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Building2,
  Wifi,
  Home,
  BookOpen,
  FlaskConical,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export default function StudentPortalPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [category, setCategory] = useState<ComplaintCategory>('Wi-Fi');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ category?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Track complaint state
  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<EvaluatedComplaint | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  // Immediate local load + background real-time sync
  useEffect(() => {
    // 1. Instantly load local cache (0ms delay)
    const cached = getStoredComplaints();
    setComplaints(cached);

    // 2. Real-time background sync
    const unsubscribe = subscribeToComplaints((items) => {
      setComplaints(items);
    });
    return () => unsubscribe();
  }, []);

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
    const errs: { category?: string; description?: string } = {};
    if (!category) {
      errs.category = 'Please choose a category.';
    }
    const trimmed = description.trim();
    if (!trimmed) {
      errs.description = 'Please describe your complaint in detail.';
    } else if (trimmed.length < 5) {
      errs.description = 'Description should be at least 5 characters long.';
    } else if (trimmed.length > 500) {
      errs.description = 'Description cannot exceed 500 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    try {
      const nextId = generateNextComplaintId(complaints);
      const nowIso = new Date().toISOString();

      const newComplaint: Complaint = {
        id: nextId,
        category,
        description: description.trim(),
        submittedAt: nowIso,
        status: 'Raised',
        createdAt: nowIso,
      };

      // Persist to Firebase & local storage
      await addComplaint(newComplaint);

      setComplaints((prev) => [newComplaint, ...prev]);
      setSubmittedId(nextId);
      setDescription('');
      setErrors({});
    } catch (err) {
      console.error('Failed to submit complaint:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackIdInput.trim().toUpperCase();
    if (!query) {
      setTrackedComplaint(null);
      setTrackSearched(false);
      return;
    }

    const found = complaints.find((c) => c.id.toUpperCase() === query);
    setTrackSearched(true);
    if (found) {
      setTrackedComplaint(evaluateComplaint(found, Date.now()));
    } else {
      setTrackedComplaint(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const workflowSteps = [
    { title: 'Raised', desc: 'Received & queued' },
    { title: 'In Progress', desc: 'Department assigned' },
    { title: 'Resolved', desc: 'Resolved & verified' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#007A78]">
              <Layers className="w-7 h-7" strokeWidth={2.3} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Camp Resolver
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E6FFFA] text-[#007A78] border border-[#99F6E4]">
                  Student Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Campus Student Grievance & Issue Registration Desk
              </p>
            </div>
          </div>

          {/* Right link to Admin Dashboard */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin Panel</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Have a Campus Issue? We're Here to Help.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Submit your complaint below. Our campus system uses automated urgency scoring to prioritize issues and dispatch them to the right administrative department.
          </p>
        </div>

        {/* Section 1: Submit Form & Quick Tracker Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Complaint Submission Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Register a New Complaint
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Select a category and provide clear details
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#007A78] bg-[#F0FDFA] px-2.5 py-1 rounded-full border border-[#99F6E4]">
                Status: Raised
              </span>
            </div>

            {/* Success Banner if newly submitted */}
            {submittedId && (
              <div className="mb-5 p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs text-[#065F46] animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-[#065F46]">
                        Complaint Successfully Registered!
                      </h4>
                      <p className="mt-1 text-slate-600 leading-relaxed">
                        Your issue has been assigned Reference ID{' '}
                        <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-[#A7F3D0]">
                          {submittedId}
                        </strong>
                        . Keep this ID to track your status.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(submittedId)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 border border-[#A7F3D0] rounded-lg transition"
                    title="Copy Complaint ID"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Complaint Category <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                        className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#F0FDFA] border-[#007A78] text-[#007A78] ring-2 ring-[#007A78]/20 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[#007A78]' : 'text-slate-500'}`} />
                        <span>{cat}</span>
                        <span
                          className={`mt-1 text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected
                              ? 'bg-[#CCFBF1] text-[#0F766E]'
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
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.category}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="student-description"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Describe the Issue <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {description.length} / 500 characters
                  </span>
                </div>

                <textarea
                  id="student-description"
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: undefined }));
                    }
                  }}
                  placeholder="Describe your issue in detail (e.g. Wi-Fi disconnecting frequently on 2nd floor of Block B, or Hostel room 204 tap leakage)..."
                  className={`w-full rounded-xl border p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition shadow-2xs resize-none ${
                    errors.description
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-[#007A78]/20 focus:border-[#007A78]'
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
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold text-white bg-[#007A78] hover:bg-[#0b6664] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-xs transition active:scale-[0.99]"
                >
                  <Send className="w-4 h-4 -rotate-45" />
                  <span>{isSubmitting ? 'Submitting Complaint...' : 'Submit Campus Complaint'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Track Complaint Status & Guidelines (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Track Complaint Box */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#007A78] flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Track Complaint Status
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Enter your Complaint ID (e.g. C01, C02)
                  </p>
                </div>
              </div>

              <form onSubmit={handleTrackSearch} className="flex gap-2">
                <input
                  type="text"
                  value={trackIdInput}
                  onChange={(e) => setTrackIdInput(e.target.value)}
                  placeholder="Enter ID (e.g. C01)..."
                  className="flex-1 px-3.5 py-2 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78]/20 focus:border-[#007A78] uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#007A78] hover:bg-[#0b6664] rounded-xl shadow-2xs transition"
                >
                  Track
                </button>
              </form>

              {/* Tracking Results Card */}
              {trackSearched && trackedComplaint && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {trackedComplaint.id}
                    </span>
                    <StatusBadge status={trackedComplaint.status} size="sm" />
                  </div>

                  <div className="text-xs text-slate-700">
                    <p className="font-medium line-clamp-2">{trackedComplaint.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Submitted {formatAge(trackedComplaint.ageInHours)}</span>
                    </div>
                  </div>

                  {/* Progress Pipeline */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                      {workflowSteps.map((s, idx) => {
                        const currentIdx =
                          trackedComplaint.status === 'Raised'
                            ? 0
                            : trackedComplaint.status === 'In Progress'
                            ? 1
                            : 2;
                        const isDone = idx <= currentIdx;
                        return (
                          <div
                            key={s.title}
                            className={`p-1.5 rounded-lg border ${
                              isDone
                                ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <span>{s.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {trackSearched && !trackedComplaint && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>No complaint found with ID "{trackIdInput}". Please check the ID.</span>
                </div>
              )}
            </div>

            {/* Urgency & Category Weight Info for Students */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    How We Prioritize Your Issues
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Fair, transparent algorithmic resolution
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  Every campus issue receives an <strong>Urgency Score</strong> combining its category base weight and age.
                </p>
                <div className="p-2.5 bg-slate-50 rounded-lg font-mono text-[11px] text-slate-800 border border-slate-200">
                  Urgency = Category Weight + floor(Hours / 24)
                </div>
                <p className="text-[11px] text-slate-500">
                  Laboratory issues (Weight: 3) & Wi-Fi/Hostel (Weight: 2) receive higher dispatch priority. For every 24 hours an issue is pending, urgency increments by +1 point.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Camp Resolver Campus Complaint Management • CODE CRACK 3.0</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold text-[#007A78] hover:underline">
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant for Students */}
      <ChatbotWidget />
    </div>
  );
}

