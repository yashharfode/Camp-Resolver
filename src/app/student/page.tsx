'use client';

import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, EvaluatedComplaint } from '@/types/complaint';
import { CATEGORIES } from '@/utils/constants';
import { getStoredComplaints, generateNextComplaintId } from '@/utils/storage';
import { evaluateComplaint, formatAge } from '@/utils/urgency';
import {
  subscribeToComplaints,
  addComplaint,
  updateComplaintAIAnalysis,
} from '@/services/complaintService';
import { createEmergencyNotification } from '@/services/notificationService';
import { CategoryBadge } from '@/components/CategoryBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { CampResolverLogo } from '@/components/CampResolverLogo';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  Clock,
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
  MapPin,
  Compass,
  User,
  Mail,
  GraduationCap,
  FileText,
  AlertTriangle,
  Flame,
  ShieldAlert,
  EyeOff,
  Shield,
} from 'lucide-react';

export default function StudentPortalPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<'register' | 'track'>('register');

  // Form Fields
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [scholarNumber, setScholarNumber] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Wi-Fi');
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string | null>(null);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Form validation & submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Tracking State
  const [searchQuery, setSearchQuery] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<EvaluatedComplaint | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  // Sync complaints on load
  useEffect(() => {
    const cached = getStoredComplaints();
    setComplaints(cached);

    const unsubscribe = subscribeToComplaints((items) => {
      setComplaints(items);
    });
    return () => unsubscribe();
  }, []);

  const getCategoryIcon = (cat: ComplaintCategory) => {
    switch (cat) {
      case 'Emergency':
        return AlertTriangle;
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

  // GPS Geolocation Handler
  const handleFetchGps = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setGpsLocation(`${lat}° N, ${lng}° E`);
        setIsGettingGps(false);
      },
      (err) => {
        setIsGettingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission was denied. You may still submit without GPS.');
        } else {
          setGpsError('Could not determine GPS position. You may proceed without it.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleClearGps = () => {
    setGpsLocation(null);
    setGpsError(null);
  };

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!studentName.trim()) {
      errs.studentName = 'Full Name is required.';
    } else if (studentName.trim().length < 2) {
      errs.studentName = 'Please enter a valid full name.';
    }

    if (!scholarNumber.trim()) {
      errs.scholarNumber = 'Scholar / Enrollment Number is required.';
    }

    if (!email.trim()) {
      errs.email = 'Campus Email address is required.';
    } else if (!/^[a-zA-Z0-9._%+-]+@satinengg\.in$/i.test(email.trim())) {
      errs.email = 'Only official @satinengg.in campus email addresses are allowed (e.g. yourname@satinengg.in).';
    }

    if (!title.trim()) {
      errs.title = 'Issue Subject / Title is required.';
    } else if (title.trim().length < 5) {
      errs.title = 'Title should be at least 5 characters.';
    }

    if (!location.trim()) {
      errs.location = 'Campus Location (Block / Room) is required.';
    }

    if (category === 'Emergency') {
      const trimmedEmerg = emergencyDetails.trim();
      if (!trimmedEmerg) {
        errs.emergencyDetails = 'Please describe the emergency situation.';
      } else if (trimmedEmerg.length < 5) {
        errs.emergencyDetails = 'Emergency description must be at least 5 characters.';
      }
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      errs.description = 'Please describe the problem in detail.';
    } else if (trimmedDesc.length < 10) {
      errs.description = 'Description should be at least 10 characters long.';
    } else if (trimmedDesc.length > 500) {
      errs.description = 'Description cannot exceed 500 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submission (Strictly Non-Blocking for AI)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);

    try {
      const newId = generateNextComplaintId(complaints);
      const nowStr = new Date().toISOString();
      const isEmerg = category === 'Emergency';

      const newComplaint: Complaint = {
        id: newId,
        title: title.trim(),
        studentName: studentName.trim(),
        email: email.trim(),
        scholarNumber: scholarNumber.trim(),
        category,
        location: location.trim(),
        gpsLocation: gpsLocation || undefined,
        description: description.trim(),
        submittedAt: nowStr,
        createdAt: nowStr,
        status: 'Raised',
        isAnonymous,
        isEmergency: isEmerg,
        emergencyDetails: isEmerg ? emergencyDetails.trim() : undefined,
        aiSuggestedPriority: isEmerg ? 'Emergency' : undefined,
        aiSeverity: isEmerg ? 'Critical' : undefined,
        aiRecommendedDepartment: isEmerg ? 'Campus Security & Emergency Response' : undefined,
        aiReviewStatus: 'pending',
        statusUpdates: [
          {
            status: 'Raised',
            timestamp: nowStr,
            note: isEmerg
              ? 'EMERGENCY ALERT: Immediate response dispatched to Campus Security & Emergency Maintenance.'
              : 'Complaint registered via Student Grievance Portal.',
          },
        ],
      };

      // 1. Save immediately in Firebase & local storage (instant response for student)
      await addComplaint(newComplaint);

      // 2. If emergency, immediately create notification in Firestore
      if (isEmerg) {
        createEmergencyNotification(newComplaint).catch((notifErr) =>
          console.warn('Failed to publish emergency notification:', notifErr)
        );
      }

      // 3. Fire-and-forget background AI analysis (never delays submission)
      fetch('/api/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          category: newComplaint.category,
          title: newComplaint.title,
          description: newComplaint.description,
          emergencyDetails: newComplaint.emergencyDetails,
          location: newComplaint.location,
          isEmergency: isEmerg,
        }),
      })
        .then((res) => res.json())
        .then((analysis) => {
          if (analysis && analysis.summary) {
            updateComplaintAIAnalysis(newId, analysis);
          }
        })
        .catch((err) => {
          console.warn('Background AI complaint analysis notice:', err);
        });

      setSubmittedId(newId);
      // Reset fields
      setTitle('');
      setLocation('');
      setDescription('');
      setEmergencyDetails('');
      setIsAnonymous(false);
      setGpsLocation(null);
      setErrors({});
    } catch (err) {
      console.error('Submission failed:', err);
      setErrors({ form: 'Failed to record complaint. Please check connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tracking Search
  const handleTrackSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTrackSearched(true);

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setTrackedComplaint(null);
      return;
    }

    const found = complaints.find(
      (c) =>
        c.id.toLowerCase() === query ||
        (c.scholarNumber && c.scholarNumber.toLowerCase() === query) ||
        (c.email && c.email.toLowerCase() === query)
    );

    if (found) {
      setTrackedComplaint(evaluateComplaint(found, Date.now(), complaints));
    } else {
      setTrackedComplaint(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      {/* Top Navigation Header (Strictly for Students - NO Admin Link) */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & Brand (Without background) */}
          <div className="flex items-center gap-3">
            <CampResolverLogo className="w-8 h-8" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Camp Resolver
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6FFFA] text-[#007A78] border border-[#99F6E4] uppercase tracking-wider">
                  Student Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Centralized Student Grievance & Issue Registration Desk
              </p>
            </div>
          </div>

          {/* Quick Help Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Grievance Desk Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Student Grievance Redressal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Report facility issues across campus hostels, labs, Wi-Fi, or classrooms. Our campus administration actively reviews and resolves your complaints with AI-powered prioritization.
          </p>

          {/* Tab Switcher: Register vs Track */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-[#007A78] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Register Complaint</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'track'
                    ? 'bg-white text-[#007A78] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Track Status</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success Modal / Banner when complaint is submitted */}
        {submittedId && (
          <div className="p-6 bg-white rounded-3xl border border-emerald-200 shadow-lg shadow-emerald-700/5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Grievance Registered Successfully!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your complaint has been queued with intelligent priority routing. Save your tracking ID below:
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-sm font-bold text-[#007A78]">
                    <span>{submittedId}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(submittedId)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      title="Copy Tracking ID"
                    >
                      {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(submittedId);
                      setActiveTab('track');
                      const found = complaints.find((c) => c.id === submittedId);
                      if (found) setTrackedComplaint(evaluateComplaint(found, Date.now(), complaints));
                    }}
                    className="text-xs font-bold text-[#007A78] hover:underline px-2 py-1 cursor-pointer"
                  >
                    Track this complaint →
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmittedId(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 cursor-pointer"
                  >
                    Register Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: REGISTER COMPLAINT */}
        {activeTab === 'register' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  New Complaint Registration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Please provide accurate student details and incident location to expedite dispatch.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section A: Student Identity */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Student Information</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                          errors.studentName
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-slate-200 focus:ring-[#007A78]/20 focus:border-[#007A78]'
                        }`}
                      />
                      {errors.studentName && (
                        <p className="text-[11px] text-rose-500 font-medium">{errors.studentName}</p>
                      )}
                    </div>

                    {/* Scholar Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Scholar / Enrollment No. <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={scholarNumber}
                        onChange={(e) => setScholarNumber(e.target.value)}
                        placeholder="e.g. SCH2024-0891"
                        className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                          errors.scholarNumber
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-slate-200 focus:ring-[#007A78]/20 focus:border-[#007A78]'
                        }`}
                      />
                      {errors.scholarNumber && (
                        <p className="text-[11px] text-rose-500 font-medium">{errors.scholarNumber}</p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Campus Email ID <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                          Requires @satinengg.in
                        </span>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. aarav.sharma@satinengg.in"
                        className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                          errors.email
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-slate-200 focus:ring-[#007A78]/20 focus:border-[#007A78]'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>
                      )}
                    </div>

                    {/* Anonymous Grievance Checkbox Option */}
                    <div
                      className={`sm:col-span-2 p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                        isAnonymous
                          ? 'bg-gradient-to-r from-teal-50/90 to-indigo-50/70 border-teal-300 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-slate-50/90 border-slate-200 hover:bg-slate-100/70'
                      }`}
                      onClick={() => setIsAnonymous(!isAnonymous)}
                    >
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          id="anonymous-toggle"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="w-4 h-4 text-[#007A78] rounded border-slate-300 focus:ring-[#007A78] cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label
                            htmlFor="anonymous-toggle"
                            className="text-xs font-bold text-slate-900 cursor-pointer flex items-center gap-1.5"
                          >
                            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                            <span>Submit as Anonymous Grievance</span>
                          </label>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                            Department Level Privacy Protection
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                          Your Name, Scholar ID, and Email are securely recorded for central admin verification, but strictly <strong>hidden and masked from department technicians and maintenance staff</strong>. Only the head administrator can view your identity.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Complaint Category Selection (Includes Emergency) */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Complaint Category <span className="text-rose-500">*</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const Icon = getCategoryIcon(cat);
                      const isSelected = category === cat;
                      const isCatEmerg = cat === 'Emergency';

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? isCatEmerg
                                ? 'border-rose-600 bg-rose-100/80 ring-2 ring-rose-500/30 shadow-xs'
                                : 'border-[#007A78] bg-[#E6FFFA]/50 shadow-xs ring-2 ring-[#007A78]/20'
                              : isCatEmerg
                              ? 'border-rose-200 bg-rose-50/60 hover:bg-rose-100 hover:border-rose-400 text-rose-700'
                              : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? isCatEmerg
                                  ? 'bg-rose-600 text-white animate-pulse'
                                  : 'bg-[#007A78] text-white'
                                : isCatEmerg
                                ? 'bg-rose-200/70 text-rose-700'
                                : 'bg-slate-200/70 text-slate-600'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected
                                ? isCatEmerg
                                  ? 'text-rose-800'
                                  : 'text-[#007A78]'
                                : isCatEmerg
                                ? 'text-rose-700'
                                : 'text-slate-800'
                            }`}
                          >
                            {cat}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Emergency Description Field (Required when Emergency is selected) */}
                {category === 'Emergency' && (
                  <div className="p-4 sm:p-5 bg-rose-50/90 rounded-2xl border-2 border-rose-300 space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-rose-800">
                      <ShieldAlert className="w-4 h-4 text-rose-600 animate-bounce" />
                      <label className="text-xs font-black uppercase tracking-wider text-rose-900">
                        Describe the Emergency Situation <span className="text-rose-600">*</span>
                      </label>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
                      Immediate campus emergencies include: fire or smoke, electrical sparks / exposed live wiring, serious water flooding, structural collapse hazards, or dangerous physical incidents.
                    </p>
                    <textarea
                      value={emergencyDetails}
                      onChange={(e) => setEmergencyDetails(e.target.value)}
                      placeholder="e.g. Sparks and burning smell emitting from room 302 electrical board..."
                      rows={3}
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 font-medium text-slate-900 transition ${
                        errors.emergencyDetails
                          ? 'border-rose-500 focus:ring-rose-300'
                          : 'border-rose-200 focus:ring-rose-400'
                      }`}
                    />
                    {errors.emergencyDetails && (
                      <p className="text-[11px] text-rose-600 font-bold">{errors.emergencyDetails}</p>
                    )}
                  </div>
                )}

                {/* Section C: Issue Specifics */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Issue Location & Specifics</span>
                  </h3>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Subject / Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Water supply cut off in 2nd floor hostel washroom"
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                        errors.title
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-200 focus:ring-[#007A78]/20 focus:border-[#007A78]'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.title}</p>
                    )}
                  </div>

                  {/* Specific Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Specific Location / Block / Room <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Hostel Block B, Wing 2, Washroom 204 or Main Lab 3"
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                        errors.location
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-200 focus:ring-[#007A78]/20 focus:border-[#007A78]'
                      }`}
                    />
                    {errors.location && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.location}</p>
                    )}
                  </div>

                  {/* Optional GPS Location Capture */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#007A78]" />
                        <div>
                          <span className="text-xs font-bold text-slate-800">
                            GPS Coordinates
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-slate-200/80">
                            Optional
                          </span>
                        </div>
                      </div>

                      {gpsLocation ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>{gpsLocation}</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleClearGps}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleFetchGps}
                          disabled={isGettingGps}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
                        >
                          <Compass className={`w-3.5 h-3.5 ${isGettingGps ? 'animate-spin text-[#007A78]' : 'text-slate-500'}`} />
                          <span>{isGettingGps ? 'Locating...' : 'Share Current GPS'}</span>
                        </button>
                      )}
                    </div>
                    {gpsError && (
                      <p className="text-[11px] text-amber-600 font-medium">{gpsError}</p>
                    )}
                  </div>

                  {/* Full Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        Detailed Description of the Grievance <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {description.length} / 500 characters
                      </span>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please clearly explain the issue, how long it has been ongoing, and how it impacts your academic or residential experience..."
                      rows={4}
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                        errors.description
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-200 focus:ring-[#007A78]/20 focus:border-[#007A78]'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.description}</p>
                    )}
                  </div>
                </div>

                {errors.form && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                    {errors.form}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      category === 'Emergency'
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                        : 'bg-[#007A78] hover:bg-[#005C5A] shadow-[#007A78]/20'
                    } disabled:opacity-60`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Logging Complaint in Real-time...'
                        : category === 'Emergency'
                        ? 'Submit Critical Emergency Complaint'
                        : 'Submit Complaint to Campus Desk'}
                    </span>
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
                    Your grievance is analyzed by AI intelligence and dispatched to responsible campus officers immediately.
                  </p>
                </div>
              </form>
            </div>

            {/* Resolution Workflow - Preserved at the very bottom */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
              <div className="text-center max-w-md mx-auto mb-6">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Transparent Resolution Workflow
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Every campus grievance follows a verified 3-stage progression from initial registration to verified resolution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stage 1 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">1. Raised</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Logged in system and queued for relevant department with initial urgency calculation.
                    </p>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">2. In Progress</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Assigned to campus technician, plumber, electrician, AV, or IT maintenance team.
                    </p>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">3. Resolved</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Work verified and ticket successfully closed by campus administration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRACK STATUS */}
        {activeTab === 'track' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Search Box */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Track Live Complaint Status
              </h2>
              <form onSubmit={handleTrackSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Complaint ID (e.g. C01) or Scholar Number..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78]/20 focus:border-[#007A78] transition font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#007A78] hover:bg-[#005C5A] text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Track
                </button>
              </form>
            </div>

            {/* Tracked Complaint Result Card */}
            {trackedComplaint ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5 animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                      {trackedComplaint.id}
                    </span>
                    <CategoryBadge category={trackedComplaint.category} size="md" />
                    <StatusBadge status={trackedComplaint.status} size="md" />
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    Submitted: {new Date(trackedComplaint.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Emergency banner on tracking if applicable */}
                {trackedComplaint.isEmergency && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Flagged as Critical Campus Emergency:{' '}
                      {trackedComplaint.emergencyDetails || trackedComplaint.description}
                    </span>
                  </div>
                )}

                {/* Anonymous Banner if applicable */}
                {trackedComplaint.isAnonymous && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs font-medium text-indigo-900">
                    <EyeOff className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      <strong>Anonymous Grievance:</strong> Your student identity is shielded from department staff. Only central administration can inspect your profile.
                    </span>
                  </div>
                )}

                {/* AI Summary on Tracking if available */}
                {trackedComplaint.aiSummary && (
                  <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#007A78]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Grievance Assessment</span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      {trackedComplaint.aiSummary}
                    </p>
                    {trackedComplaint.aiRecommendedDepartment && (
                      <p className="text-[11px] text-slate-500">
                        Assigned Desk: <strong>{trackedComplaint.aiRecommendedDepartment}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {trackedComplaint.title || trackedComplaint.description}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {trackedComplaint.description}
                  </p>
                  {trackedComplaint.location && (
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      📍 {trackedComplaint.location}
                    </p>
                  )}
                </div>

                {/* Visual 3-Stage Progress Tracker */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                    Live Stage Progression
                  </span>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    {/* Step 1: Raised */}
                    <div className="space-y-1.5">
                      <div className="h-2 rounded-full bg-emerald-500" />
                      <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Raised</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-medium">Logged in System</span>
                    </div>

                    {/* Step 2: In Progress */}
                    <div className="space-y-1.5">
                      <div
                        className={`h-2 rounded-full ${
                          trackedComplaint.status === 'In Progress' || trackedComplaint.status === 'Resolved'
                            ? 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`flex items-center justify-center gap-1 text-xs font-bold ${
                          trackedComplaint.status === 'In Progress' || trackedComplaint.status === 'Resolved'
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {trackedComplaint.status === 'In Progress' || trackedComplaint.status === 'Resolved' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                        <span>In Progress</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-medium">Staff Assigned</span>
                    </div>

                    {/* Step 3: Resolved */}
                    <div className="space-y-1.5">
                      <div
                        className={`h-2 rounded-full ${
                          trackedComplaint.status === 'Resolved' ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`flex items-center justify-center gap-1 text-xs font-bold ${
                          trackedComplaint.status === 'Resolved' ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {trackedComplaint.status === 'Resolved' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                        <span>Resolved</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-medium">Closed & Verified</span>
                    </div>
                  </div>
                </div>

                {/* Admin Remarks & Updates Box */}
                {trackedComplaint.adminRemarks && (
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#007A78]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Official Campus Administration Remark</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium pl-5">
                      {trackedComplaint.adminRemarks}
                    </p>
                  </div>
                )}

                {/* Details Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[11px] block font-medium">Current Age</span>
                    <strong className="text-slate-800 text-sm mt-0.5 block">
                      {formatAge(trackedComplaint.ageInHours)}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[11px] block font-medium">Priority Level</span>
                    <strong className="text-[#007A78] text-sm mt-0.5 block">
                      {trackedComplaint.effectivePriority} Priority
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[11px] block font-medium">Scholar ID</span>
                    <strong className="text-slate-800 text-xs mt-0.5 block truncate">
                      {trackedComplaint.scholarNumber || 'N/A'}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[11px] block font-medium">GPS Tag</span>
                    <strong className="text-slate-800 text-xs mt-0.5 block truncate">
                      {trackedComplaint.gpsLocation || 'Not Attached'}
                    </strong>
                  </div>
                </div>
              </div>
            ) : trackSearched ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">
                  No Complaint Found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We could not find any grievance matching "{searchQuery}". Please verify your Complaint ID (e.g. C01, C02) or scholar registration number.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
                Enter your Complaint ID or Scholar Number above to inspect live stage progression.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating AI Assistant for Students */}
      <ChatbotWidget />
    </div>
  );
}
