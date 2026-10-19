'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Award,
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  Megaphone,
  Plus,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Announcement } from '@campus-connect/types';
import { store } from '@/lib/store';

export default function CoordinatorBulletinPage() {
  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [announcements, setAnnouncements] = useState<Announcement[]>(store.announcements);
  const [clubs, setClubs] = useState(store.clubs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isMandatory, setIsMandatory] = useState(false);
  const [targetScope, setTargetScope] = useState<'campus' | 'department'>('campus');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    store.syncFromServer();
    const sync = () => {
      setAnnouncements([...store.announcements]);
      setCurrentUser({ ...store.currentUser });
      setClubs([...store.clubs]);
    };
    sync();
    const unsub = store.subscribe(sync);
    return () => unsub();
  }, []);

  const isAdmin = Boolean(currentUser.roles?.includes('admin'));
  const isCoordinator = Boolean(currentUser.roles?.includes('coordinator'));
  const isAllowed = isAdmin || isCoordinator;

  const assignedClub = clubs.find((c) => c.id === currentUser.assigned_club_id);

  if (!isAllowed) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center space-y-6">
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/20">
          <Lock className="h-10 w-10 text-rose-400" />
        </div>

        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider">
            Access Restricted
          </span>
          <h1 className="text-2xl font-black text-white">Coordinators Bulletin Board Restricted</h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            This bulletin board is strictly reserved for appointed Student Club Coordinators and Campus Administrators to broadcast official club notices, registrations, and society announcements.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors"
          >
            Return to Dashboard
          </Link>
          <Link
            href="/dashboard/events"
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-sky-500/20 transition-all hover:scale-105"
          >
            Go to Events Directory
          </Link>
        </div>
      </div>
    );
  }

  // Club announcements only
  const clubBulletins = announcements.filter(
    (a) =>
      a.category === 'Club' ||
      a.category === 'Coordinator' ||
      a.author_profile?.roles?.includes('coordinator')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setNotification({ type: 'error', message: 'Please provide both title and announcement content.' });
      return;
    }

    if (!isAdmin && !currentUser.assigned_club_id) {
      setNotification({
        type: 'error',
        message: 'You must be assigned to an official club to broadcast coordinator bulletins.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const clubPrefix = assignedClub ? `[${assignedClub.name}] ` : '';
      const fullTitle = title.startsWith('[') ? title : `${clubPrefix}${title}`;

      store.createAnnouncement({
        title: fullTitle,
        content: content.trim(),
        category: 'Club',
        priority,
        is_mandatory: isMandatory,
        target_scope: targetScope,
        author_id: currentUser.id,
      });

      setNotification({
        type: 'success',
        message: `Coordinator bulletin broadcast successfully to ${targetScope === 'campus' ? 'entire campus' : 'department'}!`,
      });
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setPriority('medium');
      setIsMandatory(false);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to broadcast bulletin.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-lg backdrop-blur-xl animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            )}
            <span className="text-sm font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 border-t-white/20 bg-gradient-to-br from-purple-950/50 via-slate-900/60 to-slate-950/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-purple-400" /> Coordinator Channel
              </span>
              {assignedClub ? (
                <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-bold">
                  Representing: {assignedClub.name}
                </span>
              ) : isAdmin ? (
                <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-bold">
                  Administrator Super-Access
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> No Assigned Club
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Coordinators Bulletin Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Official dispatch hub for student club leaders. Broadcast announcements, team recruitments, workshop reminders, and hackathon alerts directly to the campus mobile application.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Broadcast Club Notice</span>
          </button>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-purple-400" />
            Active Club Bulletins ({clubBulletins.length})
          </h2>
          <span className="text-xs text-slate-400">Syncs with mobile app alerts</span>
        </div>

        {clubBulletins.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl bg-slate-900/30 backdrop-blur-md">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">No club bulletins published yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click &quot;Broadcast Club Notice&quot; above to publish an official bulletin for your club.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {clubBulletins.map((bulletin) => {
              const priorityColors = {
                urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                medium: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
                low: 'bg-slate-800 text-slate-400 border-white/10',
              };

              return (
                <div
                  key={bulletin.id}
                  className="p-5 sm:p-6 rounded-2xl border border-white/10 border-t-white/20 bg-slate-900/60 backdrop-blur-xl hover:border-purple-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Users className="h-3 w-3 text-purple-400" /> Club Notice
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider ${
                          priorityColors[bulletin.priority] || priorityColors.medium
                        }`}
                      >
                        {bulletin.priority} priority
                      </span>
                      {bulletin.is_mandatory && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                          Mandatory
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[10px] capitalize">
                        Target: {bulletin.target_scope}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {new Date(bulletin.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-white tracking-tight">
                    {bulletin.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {bulletin.content}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[10px] text-purple-300 font-bold">
                        {bulletin.author_profile?.full_name ? bulletin.author_profile.full_name.charAt(0) : 'C'}
                      </div>
                      <span className="text-slate-300 font-semibold">
                        {bulletin.author_profile?.full_name || 'Club Coordinator'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">Live on Mobile Alerts Page</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 rounded-3xl border border-white/10 border-t-white/20 bg-slate-900/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-purple-400" />
                  Broadcast Club Bulletin
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Send official notification to campus students for your club
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl border border-white/10 bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Representing Club Indicator */}
              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-between text-xs">
                <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-purple-400" /> Broadcasting Entity:
                </span>
                <span className="font-extrabold text-white">
                  {assignedClub ? assignedClub.name : isAdmin ? 'Campus Administration' : 'Unassigned Club'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Bulletin Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. HackX Team Registrations Open • Orientation Day"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/50 text-white text-sm focus:outline-none focus:border-purple-500/50 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Target Scope
                  </label>
                  <select
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/50 text-white text-sm focus:outline-none focus:border-purple-500/50 cursor-pointer"
                  >
                    <option value="campus">Entire Campus</option>
                    <option value="department">Single Department</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Bulletin Content / Announcement Notice <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide full details, registration links, schedules, and coordinator contact instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 text-purple-600 focus:ring-purple-500/30"
                />
                <label htmlFor="mandatoryCheck" className="text-xs text-slate-300 cursor-pointer">
                  Mark as High Priority / Important Club Announcement
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-500/25 transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {submitting ? 'Broadcasting...' : 'Broadcast Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
