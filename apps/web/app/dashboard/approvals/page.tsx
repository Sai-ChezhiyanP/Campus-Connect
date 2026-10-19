'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { store } from '@/lib/store';
import { EventItem } from '@campus-connect/types';

export default function ApprovalQueuePage() {
  const [events, setEvents] = useState(store.events);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [inspectPosterUrl, setInspectPosterUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    store.syncFromServer();
    const sync = () => setEvents([...store.events]);
    sync();
    const unsub = store.subscribe(sync);
    return () => unsub();
  }, []);

  const pendingEvents = events.filter((e) => e.status === 'pending_approval');

  const handleApprove = (id: string) => {
    const event = events.find((e) => e.id === id);
    const success = store.updateEventStatus(id, 'published');
    if (success) {
      setFeedback({
        type: 'success',
        message: `Event "${event?.title || 'Event'}" has been approved and published to the student mobile app.`,
      });
      setTimeout(() => setFeedback(null), 4000);
      setEvents([...store.events]);
    }
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) return;
    const event = events.find((e) => e.id === id);
    const success = store.updateEventStatus(id, 'rejected', rejectReason.trim());
    if (success) {
      setFeedback({
        type: 'success',
        message: `Event "${event?.title || 'Event'}" has been rejected. Notification dispatched to coordinator.`,
      });
      setTimeout(() => setFeedback(null), 4000);
      setRejectId(null);
      setRejectReason('');
      setEvents([...store.events]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-white">Event Approval Queue</h1>
          <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs">
            {pendingEvents.length} Pending Approval
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Review club coordinator event submissions and verify official A4 portrait posters before publishing to students
        </p>
      </div>

      {/* Action Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400" />
            )}
            <span className="text-xs font-bold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Full Poster Modal */}
      {inspectPosterUrl && (
        <div
          onClick={() => setInspectPosterUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center bg-slate-900 border border-white/20 rounded-2xl p-4 shadow-2xl overflow-hidden"
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <span className="font-bold text-sky-400 uppercase tracking-wider">
                A4 Portrait Poster Verification (210 × 297 mm)
              </span>
              <button
                onClick={() => setInspectPosterUrl(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 w-full max-w-[360px] aspect-[210/297] rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-slate-950">
              <img
                src={inspectPosterUrl}
                alt="A4 Poster Inspection"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Queue Items */}
      {pendingEvents.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-extrabold text-white text-lg">Approval Queue is Clear</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            All coordinator event proposals have been reviewed and published. New submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingEvents.map((event) => {
            const club = store.clubs.find((c) => c.id === event.club_id);
            return (
              <div
                key={event.id}
                className="p-6 rounded-2xl border border-white/10 border-t-white/20 bg-slate-900/70 backdrop-blur-2xl shadow-2xl space-y-5 hover:border-sky-500/40 transition-all text-white overflow-hidden relative"
              >
                {/* Specular Sheen */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Left Column: A4 Portrait Poster */}
                  <div
                    onClick={() => event.poster_url && setInspectPosterUrl(event.poster_url)}
                    className="relative w-full sm:w-44 md:w-48 aspect-[210/297] rounded-xl overflow-hidden border border-white/20 bg-slate-950 flex-shrink-0 shadow-2xl group cursor-pointer mx-auto sm:mx-0"
                  >
                    {event.poster_url ? (
                      <>
                        <img
                          src={event.poster_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[9px] font-black text-sky-400 uppercase tracking-wider border border-white/10">
                          A4 Portrait
                        </div>
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                          <Eye className="h-6 w-6 text-sky-400" />
                          <span className="text-[10px] font-bold text-white">Click to Inspect Full A4 Poster</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-3 text-center">
                        <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-[10px] font-bold">No Poster Attached</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Event Details & Metadata */}
                  <div className="flex-1 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
                          {event.category}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Awaiting Approval
                        </span>
                        {club ? (
                          <span className="text-xs text-slate-300 border border-white/10 bg-white/5 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-sky-400" />
                            {club.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 border border-white/10 px-2 py-0.5 rounded-md">
                            Central / Departmental
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Submitted: {new Date(event.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white">{event.title}</h3>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-sky-400 flex-shrink-0" />
                        <span>Venue: <strong>{event.venue}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-sky-400 flex-shrink-0" />
                        <span>Starts: <strong>{new Date(event.start_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-sky-400 flex-shrink-0" />
                        <span>Seats: <strong>{event.max_participants} max</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-sky-400 flex-shrink-0" />
                        <span>Deadline: <strong>{new Date(event.registration_deadline).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    {/* Organizer Contact Info */}
                    {event.contact_info && (
                      <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400 flex-wrap">
                        {event.contact_info.name && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <User className="h-3.5 w-3.5 text-sky-400" /> {event.contact_info.name}
                          </span>
                        )}
                        {event.contact_info.email && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Mail className="h-3.5 w-3.5 text-sky-400" /> {event.contact_info.email}
                          </span>
                        )}
                        {event.contact_info.phone && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Phone className="h-3.5 w-3.5 text-sky-400" /> {event.contact_info.phone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reject Reason Form or Actions */}
                {rejectId === event.id ? (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                    <label className="block text-xs font-bold text-rose-300">
                      Reason for Rejection * (Coordinator will receive this feedback)
                    </label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Venue scheduling conflict, revise poster dimensions, update agenda..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-rose-500/40 bg-slate-950 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setRejectId(null);
                          setRejectReason('');
                        }}
                        className="px-3.5 py-1.5 rounded-lg border border-white/20 text-slate-300 hover:bg-white/10 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(event.id)}
                        disabled={!rejectReason.trim()}
                        className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setRejectId(event.id)}
                      className="px-4 py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/15 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="h-4 w-4" /> Reject Submission
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(event.id)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve & Publish to App
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
