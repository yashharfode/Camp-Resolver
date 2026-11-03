'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  RotateCcw,
  Check,
  GraduationCap,
  ArrowRight,
  XCircle,
  Bell,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
  User,
  ExternalLink,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { FirebaseConnectionStatus } from '@/services/complaintService';
import { useAdminAuth } from './AdminLoginGuard';
import { EmergencyNotification } from '@/types/complaint';
import {
  subscribeToEmergencyNotifications,
  acknowledgeEmergencyNotification,
  requestBrowserNotificationPermission,
} from '@/services/notificationService';
import { formatAge, getAgeInHours } from '@/utils/urgency';

interface DashboardHeaderProps {
  onResetSampleData: () => void;
  onOpenMobileMenu: () => void;
  connectionStatus?: FirebaseConnectionStatus;
  onViewComplaint?: (complaintId: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onResetSampleData,
  onOpenMobileMenu,
  onViewComplaint,
}) => {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [justReset, setJustReset] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<EmergencyNotification[]>([]);
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>('default');
  const [filterMode, setFilterMode] = useState<'unread' | 'all'>('unread');
  const { logout } = useAdminAuth();

  // Real-time emergency notifications listener
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPerm(Notification.permission);
    }

    const unsubscribe = subscribeToEmergencyNotifications((items) => {
      setNotifications(items);
    });

    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.acknowledged).length;

  const displayedNotifications =
    filterMode === 'unread'
      ? notifications.filter((n) => !n.acknowledged)
      : notifications;

  const handleConfirmReset = () => {
    onResetSampleData();
    setResetConfirmOpen(false);
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2500);
  };

  const handleCloseDashboard = () => {
    logout();
    window.location.href = '/student';
  };

  const handleEnableBrowserNotifications = async () => {
    const res = await requestBrowserNotificationPermission();
    setBrowserPerm(res);
  };

  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await acknowledgeEmergencyNotification(id, 'Admin Administrator');
  };

  return (
    <header className="py-2 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Campus Complaint Management System
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Report, track and resolve campus issues
            </p>
          </div>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Emergency Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition cursor-pointer shadow-2xs ${
                unreadCount > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Emergency Notifications"
            >
              <Bell
                className={`w-4 h-4 ${
                  unreadCount > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'
                }`}
              />
              <span className="hidden sm:inline">Emergencies</span>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Dropdown */}
            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-[340px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <div>
                      <h4 className="text-sm font-bold tracking-tight">
                        Emergency Alert Center
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {unreadCount} unacknowledged emergency ticket{unreadCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {browserPerm !== 'granted' && (
                      <button
                        onClick={handleEnableBrowserNotifications}
                        className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                        title="Enable desktop notifications"
                      >
                        <Volume2 className="w-3 h-3 text-amber-300" />
                        <span>Desktop Alerts</span>
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Filter toggle */}
                <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => setFilterMode('unread')}
                    className={`flex-1 py-1 rounded-lg text-center transition ${
                      filterMode === 'unread'
                        ? 'bg-white shadow-2xs text-rose-600 font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Unacknowledged ({unreadCount})
                  </button>
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`flex-1 py-1 rounded-lg text-center transition ${
                      filterMode === 'all'
                        ? 'bg-white shadow-2xs text-[#007A78] font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    All History ({notifications.length})
                  </button>
                </div>

                {/* Notification Items List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
                  {displayedNotifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="font-semibold text-slate-700">No active emergency alerts</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {filterMode === 'unread'
                          ? 'All emergencies have been acknowledged.'
                          : 'No emergency reports registered yet.'}
                      </p>
                    </div>
                  ) : (
                    displayedNotifications.map((notif) => {
                      const ageHours = getAgeInHours(notif.submittedAt);
                      return (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border transition ${
                            notif.acknowledged
                              ? 'bg-slate-50/60 border-slate-200/60 opacity-80'
                              : 'bg-rose-50/50 border-rose-200 shadow-2xs ring-1 ring-rose-300/40'
                          }`}
                        >
                          {/* Alert Top */}
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                              <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                                {notif.complaintId}
                              </span>
                              <span className="text-[10px] font-bold text-rose-700 bg-white border border-rose-200 px-1.5 py-0.5 rounded">
                                {notif.severity} Severity
                              </span>
                            </div>

                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatAge(ageHours)}
                            </span>
                          </div>

                          {/* Student & Location */}
                          <div className="text-xs text-slate-700 mb-1 flex items-center gap-2 flex-wrap font-medium">
                            <span className="flex items-center gap-1 text-slate-800">
                              <User className="w-3 h-3 text-slate-400" />
                              {notif.studentName}
                            </span>
                            {notif.scholarNumber && (
                              <span className="text-slate-500">
                                ({notif.scholarNumber})
                              </span>
                            )}
                            {notif.location && (
                              <span className="text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                                {notif.location}
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs font-semibold text-slate-900 leading-snug mb-2 line-clamp-2">
                            {notif.emergencyDetails || notif.description}
                          </p>

                          {/* Department */}
                          <div className="text-[11px] text-slate-600 mb-2.5 flex items-center justify-between">
                            <span>
                              Assigned:{' '}
                              <strong className="text-slate-800 font-semibold">
                                {notif.department}
                              </strong>
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-rose-100/60 justify-end">
                            {onViewComplaint && (
                              <button
                                onClick={() => {
                                  onViewComplaint(notif.complaintId);
                                  setNotificationsOpen(false);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer"
                              >
                                <span>View Ticket</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </button>
                            )}

                            {!notif.acknowledged ? (
                              <button
                                onClick={(e) => handleAcknowledge(notif.id, e)}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-2xs cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Acknowledge</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Acknowledged</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student Portal Switcher Link */}
          <Link
            href="/student"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#007A78] hover:text-white bg-[#F0FDFA] hover:bg-[#007A78] border border-[#99F6E4] rounded-full transition shadow-2xs"
            title="Open Student Complaint Portal"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Portal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {/* Reset Sample Records Button */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow-2xs transition"
            title="Reset to sample dataset C01 - C04"
          >
            {justReset ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-700 font-semibold">Reset Done</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Data</span>
              </>
            )}
          </button>

          {/* Close Dashboard Button */}
          <button
            onClick={() => setCloseConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-full shadow-2xs transition cursor-pointer"
            title="Close Dashboard and Exit"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Close Dashboard</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset Sample Data */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Reset Complaints Database?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              This will reset the system to the initial 4 standard complaints (C01–C04).
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs"
              >
                Yes, Reset Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Close Dashboard */}
      {closeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Close Admin Dashboard?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              You will be signed out from the administrative session and redirected to the public Student Grievance Portal.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCloseConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              >
                Stay on Dashboard
              </button>
              <button
                onClick={handleCloseDashboard}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
              >
                Yes, Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
