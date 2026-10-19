'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Megaphone,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
  Users2,
} from 'lucide-react';
import { store } from '@/lib/store';

export default function DashboardOverviewPage() {
  const [events, setEvents] = useState(store.events);
  const [announcements, setAnnouncements] = useState(store.announcements);
  const [clubs, setClubs] = useState(store.clubs);
  const [user, setUser] = useState(store.currentUser);

  useEffect(() => {
    const sync = () => {
      setEvents([...store.events]);
      setAnnouncements([...store.announcements]);
      setClubs([...store.clubs]);
      setUser({ ...store.currentUser });
    };

    sync();
    const unsub = store.subscribe(sync);
    return () => unsub();
  }, []);

  const publishedEvents = events.filter((e) => e.status === 'published');
  const pendingApprovals = events.filter((e) => e.status === 'pending_approval');
  const urgentAnnouncements = announcements.filter((a) => a.priority === 'urgent' || a.is_mandatory);

  return (
    <div className="space-y-8">
      {/* Welcome Glass Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950/80 via-slate-900/90 to-indigo-950/80 border border-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/15 backdrop-blur-md text-xs font-bold text-sky-400 mb-3 border border-sky-500/25">
            <GraduationCap className="h-4 w-4" /> SRMIST Ramapuram Centralized Management Hub
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome, {user.full_name}
          </h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Monitor real-time student engagement, review club event submissions, broadcast authorized departmental notices, and manage campus opportunities.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/events/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 px-4 py-2 text-sm font-extrabold shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Submit Event
            </Link>
            <Link
              href="/dashboard/announcements"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900/80 border border-white/15 text-white px-4 py-2 text-sm font-bold hover:bg-slate-800 transition-colors backdrop-blur-md"
            >
              <Megaphone className="h-4 w-4 text-sky-400" /> Faculty Bulletin Hub
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Events</span>
            <div className="h-9 w-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{publishedEvents.length}</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Published across campus
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Approvals</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{pendingApprovals.length}</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" /> Awaiting administrator review
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Bulletins</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{announcements.length}</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-rose-400 font-bold">{urgentAnnouncements.length} urgent</span> / mandatory
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Clubs</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Users2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{clubs.length}</div>
            <p className="text-xs text-slate-400 mt-1">Official student societies</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Events & Bulletins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white">Campus Events</h2>
              <p className="text-xs text-slate-400">Recent workshops, hackathons, and symposiums</p>
            </div>
            <Link
              href="/dashboard/events"
              className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
            >
              View All Events <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-4 transition-all hover:border-sky-500/30 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-white/10">
                    <img
                      src={event.poster_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300'}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                        {event.category}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          event.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {event.status === 'published' ? 'Published' : 'Pending Review'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">{event.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {event.venue} • {new Date(event.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right pl-4">
                  <div className="text-xs font-bold text-white">
                    {event.current_registrations} / {event.max_participants}
                  </div>
                  <div className="text-[10px] text-slate-400">Registered</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bulletins Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white">Faculty Bulletins</h2>
              <p className="text-xs text-slate-400">Official department notices</p>
            </div>
            <Link
              href="/dashboard/announcements"
              className="text-xs font-bold text-sky-400 hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`rounded-2xl border p-4 transition-all backdrop-blur-xl ${
                  ann.is_mandatory || ann.priority === 'urgent'
                    ? 'border-rose-500/30 bg-rose-500/5'
                    : 'border-white/10 bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                    {ann.category}
                  </span>
                  {ann.is_mandatory && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      MANDATORY
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">{ann.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
