'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Filter,
  Image as ImageIcon,
  Lock,
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { EventItem } from '@campus-connect/types';
import { EVENT_CATEGORIES } from '@campus-connect/shared';
import { store } from '@/lib/store';

const POSTER_PRESETS = [
  { name: 'Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?fit=crop&w=840&h=1188&q=80' },
  { name: 'AI & Data', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?fit=crop&w=840&h=1188&q=80' },
  { name: 'Robotics', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?fit=crop&w=840&h=1188&q=80' },
  { name: 'Cultural Fest', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?fit=crop&w=840&h=1188&q=80' },
  { name: 'Sports Meet', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?fit=crop&w=840&h=1188&q=80' },
];

export default function EventsManagementPage() {
  const [events, setEvents] = useState<EventItem[]>(store.events);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCoordinator, setIsCoordinator] = useState(false);

  // Edit Modal State
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_participants: 100,
    poster_url: '',
    club_id: '',
  });
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');

  // Delete & Disable Action States
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<EventItem | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleToggleDisable = (event: EventItem) => {
    try {
      const res = store.toggleDisableEvent(event.id);
      if (res.success) {
        setEvents([...store.events]);
        setActionFeedback({
          type: 'success',
          message: `Event "${event.title}" has been ${res.newStatus === 'cancelled' ? 'disabled / cancelled' : 'enabled / published'}.`,
        });
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update event status.' });
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    try {
      const event = events.find((e) => e.id === eventId);
      store.deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setDeleteConfirmEvent(null);
      setActionFeedback({
        type: 'success',
        message: `Event "${event?.title || 'Event'}" has been permanently removed.`,
      });
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to delete event.' });
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  useEffect(() => {
    store.syncFromServer();
    const sync = () => {
      setEvents([...store.events]);
      const user = store.currentUser;
      setCurrentUser(user);
      setIsAdmin(Boolean(user.roles?.includes('admin')));
      setIsCoordinator(Boolean(user.roles?.includes('coordinator')));
    };
    sync();
    const unsub = store.subscribe(sync);
    return () => unsub();
  }, []);

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canEditEvent = (event: EventItem) => {
    if (isAdmin) return true;
    if (isCoordinator && currentUser.assigned_club_id && event.club_id === currentUser.assigned_club_id) {
      return true;
    }
    return false;
  };

  const toInputDatetime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      return '';
    }
  };

  const handleOpenEdit = (event: EventItem) => {
    if (!canEditEvent(event)) return;
    setEditingEvent(event);
    setEditError('');
    setEditSuccess('');
    setEditFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      venue: event.venue,
      start_date: toInputDatetime(event.start_date),
      end_date: toInputDatetime(event.end_date),
      registration_deadline: toInputDatetime(event.registration_deadline),
      max_participants: event.max_participants,
      poster_url: event.poster_url || '',
      club_id: event.club_id || '',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEditError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setEditError('File size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const TARGET_WIDTH = 840;
        const TARGET_HEIGHT = 1188; // 840 * (297/210) = 1188 exact A4 portrait ratio
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imgRatio = img.width / img.height;
          const targetRatio = TARGET_WIDTH / TARGET_HEIGHT;
          let renderW = TARGET_WIDTH;
          let renderH = TARGET_HEIGHT;
          let offsetX = 0;
          let offsetY = 0;

          if (imgRatio > targetRatio) {
            renderW = TARGET_HEIGHT * imgRatio;
            offsetX = -(renderW - TARGET_WIDTH) / 2;
          } else {
            renderH = TARGET_WIDTH / imgRatio;
            offsetY = -(renderH - TARGET_HEIGHT) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setEditFormData((prev) => ({ ...prev, poster_url: compressedDataUrl }));
          setEditError('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setEditError('');

    if (!editFormData.title || !editFormData.description || !editFormData.venue) {
      setEditError('Please fill in all mandatory fields.');
      return;
    }

    if (!editFormData.poster_url || !editFormData.poster_url.trim()) {
      setEditError('Event poster is mandatory. Please upload an image or choose a preset.');
      return;
    }

    if (new Date(editFormData.end_date) <= new Date(editFormData.start_date)) {
      setEditError('End date must be after start date.');
      return;
    }

    setEditSaving(true);
    try {
      store.updateEvent(editingEvent.id, {
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category,
        venue: editFormData.venue,
        poster_url: editFormData.poster_url,
        start_date: new Date(editFormData.start_date).toISOString(),
        end_date: new Date(editFormData.end_date).toISOString(),
        registration_deadline: new Date(editFormData.registration_deadline).toISOString(),
        max_participants: Number(editFormData.max_participants),
        ...(isAdmin && editFormData.club_id ? { club_id: editFormData.club_id } : {}),
      });

      setEditSaving(false);
      setEditSuccess('Event updated successfully!');
      setTimeout(() => {
        setEditingEvent(null);
        setEditSuccess('');
      }, 1000);
    } catch (err: any) {
      setEditSaving(false);
      setEditError(err.message || 'Failed to update event.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
            Events Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isCoordinator && !isAdmin
              ? `Coordinator Portal • Scoped to ${store.clubs.find((c) => c.id === currentUser.assigned_club_id)?.name || 'Your Assigned Club'}`
              : 'Campus-wide event directory • Manage, review, and edit university events'}
          </p>
        </div>

        {(isAdmin || isCoordinator || currentUser?.roles?.includes('faculty')) && (
          <Link
            href="/dashboard/events/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/25 transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Create New Event
          </Link>
        )}
      </div>

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-lg backdrop-blur-xl animate-in fade-in slide-in-from-top-2 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            )}
            <span className="text-sm font-semibold">{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, category, or venue..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 text-sm backdrop-blur-xl focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-white text-sm backdrop-blur-xl focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled / Disabled</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Events Glass Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-slate-900/30 backdrop-blur-md">
            <Calendar className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">No events found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search or status filter</p>
          </div>
        ) : (
          filtered.map((event) => {
            const capacityPct = Math.min(
              100,
              Math.round((event.current_registrations / event.max_participants) * 100)
            );
            const userCanEdit = canEditEvent(event);
            const eventClub = store.clubs.find((c) => c.id === event.club_id);

            return (
              <div
                key={event.id}
                className="relative p-5 sm:p-6 rounded-2xl border border-white/10 border-t-white/20 bg-slate-900/60 backdrop-blur-2xl hover:border-sky-500/40 hover:shadow-[0_12px_40px_rgba(14,165,233,0.15)] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group overflow-hidden"
              >
                {/* Specular Top Sheen */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {/* Event Poster Thumbnail (Strict A4 Portrait Ratio) */}
                <div className="relative w-24 sm:w-28 md:w-32 aspect-[210/297] rounded-xl overflow-hidden border border-white/15 bg-slate-950 flex-shrink-0 shadow-lg group mx-auto md:mx-0">
                  {event.poster_url ? (
                    <img
                      src={event.poster_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-2 text-center">
                      <ImageIcon className="h-6 w-6 mb-1 opacity-60" />
                      <span className="text-[9px]">No Poster</span>
                    </div>
                  )}
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[8px] font-black text-sky-400 uppercase tracking-wider border border-white/10">
                    {event.category}
                  </span>
                </div>

                {/* Event Info */}
                <div className="space-y-2 max-w-xl flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-extrabold px-3 py-1 rounded-full capitalize border flex items-center gap-1.5 ${
                        event.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : event.status === 'cancelled'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : event.status === 'pending_approval'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800/80 text-slate-400 border-white/10'
                      }`}
                    >
                      {event.status === 'cancelled' ? (
                        'Disabled / Cancelled'
                      ) : event.status === 'pending_approval' ? (
                        <>
                          <Clock className="h-3 w-3 text-amber-400 animate-pulse" />
                          Awaiting Admin Approval
                        </>
                      ) : (
                        event.status.replace('_', ' ')
                      )}
                    </span>
                    {eventClub && (
                      <span className="text-[11px] text-slate-300 border border-white/10 bg-white/5 px-2.5 py-1 rounded-lg">
                        {eventClub.name}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-white group-hover:text-sky-300 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-5 text-xs text-slate-400 pt-1 flex-wrap">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-sky-400" /> {event.venue}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-sky-400" />{' '}
                      {new Date(event.start_date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Right Column: Capacity & Action Buttons */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10 gap-3 min-w-[150px]">
                  <div className="text-left md:text-right">
                    <div className="text-base font-black text-white">
                      <span className="text-sky-400">{event.current_registrations}</span> / {event.max_participants}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">Registered</div>
                    {/* Capacity Indicator */}
                    <div className="w-28 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full"
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Action Buttons (Scoped by permission) */}
                    {userCanEdit ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(event)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-sm shadow-sky-500/10"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-sky-400" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleDisable(event)}
                          title={event.status === 'cancelled' ? 'Enable event registrations' : 'Disable and pause registrations'}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-sm ${
                            event.status === 'cancelled'
                              ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 shadow-emerald-500/10'
                              : 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 shadow-amber-500/10'
                          }`}
                        >
                          {event.status === 'cancelled' ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              Enable
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-amber-400" />
                              Disable
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmEvent(event)}
                          title="Permanently remove event"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-sm shadow-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                          Delete
                        </button>
                      </>
                    ) : isCoordinator ? (
                      <span
                        title="You can only manage events belonging to your assigned club"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/5 bg-slate-800/40 text-[10px] text-slate-500 cursor-not-allowed"
                      >
                        <Lock className="h-3 w-3 text-slate-600" />
                        Different Club
                      </span>
                    ) : null}

                    {isAdmin && event.status === 'pending_approval' && (
                      <Link
                        href="/dashboard/approvals"
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        Review
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-3xl border border-white/10 border-t-white/20 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">Edit Event Details</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update event details and poster image for student view
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-semibold">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-5">
              {/* Mandatory Poster Section (A4 Portrait) */}
              <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-black uppercase tracking-wider text-sky-400">
                      Event Poster *
                    </label>
                    <span className="px-2 py-0.5 rounded-full bg-sky-400/10 border border-sky-400/30 text-sky-300 text-[9px] font-extrabold uppercase">
                      A4 Portrait (210×297mm)
                    </span>
                  </div>
                  {editFormData.poster_url && (
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, poster_url: '' })}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Clear Poster
                    </button>
                  )}
                </div>

                {editFormData.poster_url ? (
                  <div className="relative w-40 sm:w-48 aspect-[210/297] mx-auto rounded-xl overflow-hidden border border-white/20 bg-slate-950 shadow-xl group">
                    <img
                      src={editFormData.poster_url}
                      alt="Event Poster Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[8px] font-bold text-sky-400 border border-white/10 uppercase">
                      A4 Portrait
                    </div>
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold shadow-lg hover:bg-sky-400 transition-colors">
                        Replace Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <label className="border-2 border-dashed border-white/20 hover:border-sky-400/60 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 transition-all aspect-[210/297] max-w-[160px] mx-auto w-full">
                      <Upload className="h-6 w-6 text-sky-400 mb-1" />
                      <span className="text-xs font-bold text-white">Upload A4 Poster</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Vertical 210×297mm</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-300">Choose A4 Preset:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {POSTER_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => setEditFormData({ ...editFormData, poster_url: p.url })}
                            className="relative aspect-[210/297] rounded-lg overflow-hidden border border-white/10 hover:border-sky-400 group shadow-sm"
                          >
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end justify-center p-0.5">
                              <span className="text-[7.5px] font-bold text-white text-center leading-tight">{p.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.venue}
                    onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editFormData.start_date}
                    onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950/60 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editFormData.end_date}
                    onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950/60 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Registration Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editFormData.registration_deadline}
                    onChange={(e) => setEditFormData({ ...editFormData, registration_deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950/60 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Capacity (Seats) *
                  </label>
                  <input
                    type="number"
                    min={editingEvent.current_registrations}
                    required
                    value={editFormData.max_participants}
                    onChange={(e) => setEditFormData({ ...editFormData, max_participants: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Assigned Club
                  </label>
                  {isAdmin ? (
                    <select
                      value={editFormData.club_id}
                      onChange={(e) => setEditFormData({ ...editFormData, club_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="">No Club (Central / Dept)</option>
                      {store.clubs.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={store.clubs.find((c) => c.id === editFormData.club_id)?.name || 'Club Locked'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/30 text-slate-400 text-sm cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal */}
      {deleteConfirmEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Delete Campus Event?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-white/5">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">"{deleteConfirmEvent.title}"</strong>? All attendee registrations and access tokens for this event will be immediately purged.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmEvent(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Keep Event
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEvent(deleteConfirmEvent.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
