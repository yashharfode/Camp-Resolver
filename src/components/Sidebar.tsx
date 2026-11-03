'use client';

import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  BarChart3,
  Info,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'complaints', label: 'Complaints', icon: ClipboardList },
    { id: 'submit', label: 'Submit Complaint', icon: PlusCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (id: string) => {
    onTabChange(id);
    onCloseMobile();

    // Smooth scroll to corresponding section if on the dashboard
    if (id === 'complaints') {
      const el = document.getElementById('section-complaints-table');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'submit') {
      const el = document.getElementById('section-submit-form');
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
        {/* Brand Logo: Grivex */}
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="flex items-center gap-3">
            {/* 3D Isometric Cube Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
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

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#ECE9FE] text-[#5B21B6] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 ${
                    isActive ? 'text-[#6366F1]' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Illustration & Title */}
      <div className="pt-6 border-t border-slate-100 px-2 flex flex-col items-center text-center">
        {/* Campus Building Graphic SVG */}
        <div className="mb-3 w-28 h-16 relative flex items-center justify-center">
          <svg viewBox="0 0 120 70" fill="none" className="w-full h-full">
            {/* Ground */}
            <path d="M5 65 H115" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Left Tree */}
            <path d="M16 65 V52" stroke="#64748B" strokeWidth="2" />
            <circle cx="16" cy="46" r="8" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.5" />
            {/* Right Tree */}
            <path d="M104 65 V52" stroke="#64748B" strokeWidth="2" />
            <circle cx="104" cy="46" r="8" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.5" />
            {/* Main Building Base */}
            <rect x="30" y="36" width="60" height="29" rx="2" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
            {/* Columns */}
            <rect x="38" y="44" width="4" height="21" fill="#E2E8F0" />
            <rect x="50" y="44" width="4" height="21" fill="#E2E8F0" />
            <rect x="66" y="44" width="4" height="21" fill="#E2E8F0" />
            <rect x="78" y="44" width="4" height="21" fill="#E2E8F0" />
            {/* Door */}
            <rect x="56" y="51" width="8" height="14" rx="1" fill="#6366F1" />
            {/* Triangular Pediment / Roof */}
            <path d="M26 36 L60 16 L94 36 Z" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2" />
            {/* Clock / Crest */}
            <circle cx="60" cy="28" r="4" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.5" />
            {/* Flag on top */}
            <path d="M60 16 V8" stroke="#4F46E5" strokeWidth="1.5" />
            <path d="M60 8 L72 11 L60 14 Z" fill="#6366F1" />
          </svg>
        </div>

        <p className="text-xs font-bold text-slate-800 leading-tight">
          Campus Complaint
          <br />
          Management System
        </p>

        {/* Purple underline bar */}
        <div className="w-8 h-1 bg-[#6366F1] rounded-full mt-2" />
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

