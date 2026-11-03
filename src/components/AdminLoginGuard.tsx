'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, LogOut } from 'lucide-react';
import { CampResolverLogo } from './CampResolverLogo';

const ADMIN_PASSWORD = '123456';
const AUTH_KEY = 'camp_admin_auth_v1';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminLoginGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_KEY);
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      // Ignore
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.trim() === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(AUTH_KEY, 'true');
      } catch (e) {}
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setError('Incorrect administrative password. Access denied.');
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {}
    setIsAuthenticated(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <CampResolverLogo className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <CampResolverLogo className="w-14 h-14" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Camp Resolver</h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Authentication Required</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              Please enter the administrative access key to unlock the campus grievance management desk.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Admin Password</span>
                <span className="text-[11px] text-slate-400 font-normal">Default: 123456</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password (123456)"
                  className="w-full pl-10 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78]/20 focus:border-[#007A78] transition font-medium"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#007A78] hover:bg-[#005C5A] text-white shadow-md shadow-teal-900/15 transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Student Portal Switcher */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2">Are you a student registering an issue?</p>
            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007A78] hover:underline"
            >
              <span>Go to Student Grievance Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

