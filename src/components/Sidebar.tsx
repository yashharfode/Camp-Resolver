'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Flame,
  BarChart3,
  Settings,
  Layers,
  X,
  Sparkles,
  LogOut,
  GraduationCap,
  XCircle,
} from 'lucide-react';
import { useAdminAuth } from './AdminLoginGuard';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSubmitModal?: () => void;
  onOpenChatbot?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  isOpenMobile,
  onCloseMobile,
  onOpenChatbot,
}) => {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const navItems = [
    { href: '/admin', id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/complaints', id: 'complaints', label: 'Complaints', icon: ClipboardList },
    { href: '/admin/submit', id: 'submit', label: 'Submit Complaint', icon: PlusCircle },
    { href: '/admin/priority-queue', id: 'priority-queue', label: 'Priority Queue', icon: Flame },
    { href: '/admin/analytics', id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', id: 'settings', label: 'Settings', icon: Settings },
  ];

  const isItemActive = (href: string, id: string) => {
    if (activeTab && activeTab === id) return true;
    if (href === '/admin' && (pathname === '/admin' || pathname === '/')) return true;
    return pathname.startsWith(href) && href !== '/admin';
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-6 px-4 bg-white border-r border-slate-200/80">
      {/* Top: Logo & Nav items */}
      <div>
        {/* Brand Logo: Camp Resolver with 3 Stacked Layers */}
        <div className="flex items-center justify-between px-2 mb-8">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#007A78] bg-[#E6FFFA] border border-[#99F6E4]">
              <Layers className="w-6 h-6" strokeWidth={2.3} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                Camp Resolver
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </Link>

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
            const active = isItemActive(item.href, item.id);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-[#007A78] text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 ${
                    active ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: AI Trigger + Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-2 px-1">
        {/* Student Portal Quick Access */}
        <Link
          href="/student"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#007A78] hover:bg-teal-50/50 transition border border-transparent hover:border-teal-200"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <span>Student Portal</span>
          </div>
          <span className="text-[10px] font-bold text-[#007A78]">↗</span>
        </Link>

        {/* AI Assistant Quick Pill */}
        {onOpenChatbot && (
          <button
            onClick={() => {
              onOpenChatbot();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#007A78] hover:bg-teal-50/50 transition"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>AI Assistant</span>
          </button>
        )}

        {/* Close Dashboard Button */}
        <button
          onClick={() => {
            if (window.confirm('Close Admin Dashboard and return to Student Portal?')) {
              logout();
              window.location.href = '/student';
            }
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 transition shadow-2xs cursor-pointer group"
          title="Close Admin Dashboard and Lock Session"
        >
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-500 group-hover:text-white" />
            <span>Close Dashboard</span>
          </div>
          <span className="text-[10px] font-bold text-rose-500 group-hover:text-white">✕</span>
        </button>

        {/* Small Branding Footer */}
        <div className="pt-2 text-center text-[10px] text-slate-400">
          Camp Resolver • CODE CRACK 3.0
        </div>
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
