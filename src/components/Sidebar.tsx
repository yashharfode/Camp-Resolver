'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Info,
  X,
  Layers,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSubmitModal?: () => void;
  onOpenChatbot?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  onOpenSubmitModal,
  onOpenChatbot,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'complaints', label: 'All Complaints', icon: ClipboardList },
    { id: 'analytics', label: 'Priority Analytics', icon: BarChart3 },
    { id: 'student-portal', label: 'Student Portal', icon: GraduationCap, isLink: true, href: '/student' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, isAction: true },
    { id: 'about', label: 'How It Works', icon: Info },
  ];

  const handleNavClick = (item: { id: string; label: string; icon: any; isAction?: boolean }) => {
    if (item.isAction) {
      onOpenChatbot?.();
      onCloseMobile();
      return;
    }

    const id = item.id;
    onTabChange(id);
    onCloseMobile();

    if (id === 'complaints') {
      const el = document.getElementById('section-complaints-table');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'analytics') {
      const el = document.getElementById('section-priority-queue');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'about') {
      const el = document.getElementById('section-urgency-info');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-6 px-4 bg-white border-r border-slate-200/80">
      {/* Top: Logo & Nav items */}
      <div>
        {/* Brand Logo: Grivex with 3 Stacked Layers */}
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="flex items-center gap-3">
            {/* 3 Stacked Layers Teal Logo */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#007A78]">
              <Layers className="w-7 h-7" strokeWidth={2.3} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Grivex
            </span>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isLink && item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-[#007A78] hover:bg-[#F0FDFA] transition-all duration-150 group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#007A78]" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E6FFFA] text-[#007A78]">
                    Portal ↗
                  </span>
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#007A78] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Campus Illustration */}
      <div className="pt-6 border-t border-slate-100 px-2 flex flex-col items-center text-center">
        <div className="mb-2 w-28 h-16 relative flex items-center justify-center">
          <svg viewBox="0 0 120 70" fill="none" className="w-full h-full">
            {/* Ground */}
            <path d="M5 65 H115" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Left Tree */}
            <path d="M16 65 V52" stroke="#64748B" strokeWidth="2" />
            <circle cx="16" cy="46" r="8" fill="#A7F3D0" stroke="#059669" strokeWidth="1.5" />
            {/* Right Tree */}
            <path d="M104 65 V52" stroke="#64748B" strokeWidth="2" />
            <circle cx="104" cy="46" r="8" fill="#A7F3D0" stroke="#059669" strokeWidth="1.5" />
            {/* Main Building Base */}
            <rect x="30" y="36" width="60" height="29" rx="2" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
            {/* Columns */}
            <rect x="38" y="44" width="4" height="21" fill="#E2E8F0" />
            <rect x="50" y="44" width="4" height="21" fill="#E2E8F0" />
            <rect x="66" y="44" width="4" height="21" fill="#E2E8F0" />
            <rect x="78" y="44" width="4" height="21" fill="#E2E8F0" />
            {/* Door */}
            <rect x="56" y="51" width="8" height="14" rx="1" fill="#007A78" />
            {/* Roof */}
            <path d="M26 36 L60 16 L94 36 Z" fill="#CCFBF1" stroke="#007A78" strokeWidth="2" />
            {/* Crest */}
            <circle cx="60" cy="28" r="4" fill="#FFFFFF" stroke="#007A78" strokeWidth="1.5" />
            {/* Flag */}
            <path d="M60 16 V8" stroke="#007A78" strokeWidth="1.5" />
            <path d="M60 8 L72 11 L60 14 Z" fill="#007A78" />
          </svg>
        </div>

        <p className="text-xs font-bold text-slate-800 leading-tight">
          Campus Complaint
          <br />
          Management System
        </p>

        {/* Teal underline bar */}
        <div className="w-8 h-1 bg-[#007A78] rounded-full mt-2" />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
