'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { store } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please provide your official college email or institutional ID.');
      return;
    }

    setLoading(true);
    const result = store.login(identifier, password);
    setLoading(false);

    if (result.success) {
      router.push(result.redirectTo);
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = (role: 'admin' | 'faculty' | 'coordinator' | 'student') => {
    const roleEmails = {
      admin: 'admin.test@srmist.edu.in',
      faculty: 'faculty.test@srmist.edu.in',
      coordinator: 'coordinator.test@srmist.edu.in',
      student: 'student.test@srmist.edu.in',
    };
    const result = store.login(roleEmails[role]);
    if (result.success) {
      router.push(result.redirectTo);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-slate-950 overflow-hidden">
      {/* Dynamic Cosmic Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-md backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-sky-500/10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-sky-400/30 to-indigo-500/30 border border-sky-400/40 shadow-lg shadow-sky-500/20 mb-4">
            <div className="h-14 w-14 rounded-xl bg-slate-950/80 flex items-center justify-center text-sky-400">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" /> SRMIST Ramapuram
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Campus Connect Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Single institutional authentication gateway for Faculty, Coordinators, and Administrators
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Institutional Email / ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400/70" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin.test@srmist.edu.in"
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400/70" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* 1-Click Role Direct Route Choosers */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Instant Role Demo Logins
            </span>
            <span className="text-[11px] text-slate-500">Auto-routes to role hub</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Admin */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-white/5 hover:border-sky-500/40 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">
                  AD
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                    Administrator (Campus IT Core)
                  </p>
                  <p className="text-[11px] text-slate-400">Routes to: Approval Queue & Governance</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Faculty */}
            <button
              type="button"
              onClick={() => handleQuickLogin('faculty')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-white/5 hover:border-emerald-500/40 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                  FA
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Faculty Member (Dr. K. Venkatesh)
                  </p>
                  <p className="text-[11px] text-slate-400">Routes to: Faculty Bulletin Hub</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Coordinator */}
            <button
              type="button"
              onClick={() => handleQuickLogin('coordinator')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-white/5 hover:border-purple-500/40 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                  CO
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    Club Coordinator (Priya Raman - C3)
                  </p>
                  <p className="text-[11px] text-slate-400">Routes to: Event Submissions & Registry</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-slate-400 hover:text-sky-400 transition-colors inline-flex items-center gap-1"
          >
            ← Return to Public Campus Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
