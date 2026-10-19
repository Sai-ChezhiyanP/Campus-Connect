'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  FileText,
  Home,
  Megaphone,
  PlusCircle,
  Settings,
  Shield,
  Sparkles,
  Users,
  Users2,
} from 'lucide-react';

interface SidebarProps {
  currentRole: string;
}

export function Sidebar({ currentRole }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: Home, roles: ['admin', 'faculty', 'coordinator', 'student'] },
    { label: 'Events Directory', href: '/dashboard/events', icon: Calendar, roles: ['admin', 'faculty', 'coordinator', 'student'] },
    { label: 'Submit Event', href: '/dashboard/events/create', icon: PlusCircle, roles: ['admin', 'faculty', 'coordinator'] },
    { label: 'Approval Queue', href: '/dashboard/approvals', icon: CheckCircle2, roles: ['admin'] },
    { label: 'Faculty Bulletin Hub', href: '/dashboard/announcements', icon: Megaphone, roles: ['admin', 'faculty'] },
    { label: 'User Directory', href: '/dashboard/users', icon: Users, roles: ['admin'] },
    { label: 'Clubs & Societies', href: '/dashboard/clubs', icon: Users2, roles: ['admin', 'coordinator'] },
    { label: 'System Audit Logs', href: '/dashboard/audit', icon: FileText, roles: ['admin'] },
  ];

  const allowedItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-64 border-r border-white/10 bg-slate-900/40 backdrop-blur-xl min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>{currentRole} Navigation</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        </div>

        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-sky-500 text-slate-950 font-extrabold shadow-lg shadow-sky-500/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-3.5 text-xs text-slate-400 shadow-xl shadow-black/20">
        <p className="font-bold text-white mb-1 flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-amber-400" /> SRMIST Enterprise
        </p>
        <p className="text-[11px] text-slate-400">Ramapuram Campus IT Core</p>
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
          <span>Status: Protected</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> RLS Active
          </span>
        </div>
      </div>
    </aside>
  );
}
