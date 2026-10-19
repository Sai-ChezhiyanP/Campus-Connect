'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, GraduationCap, LogOut, ShieldCheck, User } from 'lucide-react';
import { store } from '@/lib/store';

export function Navbar({ currentRole, onRoleSwitch }: { currentRole: string; onRoleSwitch?: (role: string) => void }) {
  const router = useRouter();
  const currentUser = store.currentUser;

  const handleSignOut = () => {
    store.logout();
    router.push('/login');
  };

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    admin: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
    faculty: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    coordinator: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
    student: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
  };

  const badgeStyle = roleColors[currentRole] || roleColors.admin;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-6 py-3.5">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-sky-500/25 transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">Campus Connect</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/25 uppercase tracking-wider">
                SRMIST Ramapuram
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Management & Broadcasting Hub</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs">
              {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-white leading-none">{currentUser.full_name}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-extrabold uppercase tracking-wider ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                  {currentRole}
                </span>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out to Login Gateway"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
