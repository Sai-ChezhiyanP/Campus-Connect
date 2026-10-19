'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  XCircle,
} from 'lucide-react';
import { store } from '@/lib/store';

export default function ApprovalQueuePage() {
  const [events, setEvents] = useState(store.events);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  React.useEffect(() => {
    store.syncFromServer();
    const sync = () => setEvents([...store.events]);
    sync();
    const unsub = store.subscribe(sync);
    return () => unsub();
  }, []);

  const pendingEvents = events.filter((e) => e.status === 'pending_approval');

  const handleApprove = (id: string) => {
    store.updateEventStatus(id, 'published');
    setEvents([...store.events]);
  };

  const handleReject = (id: string) => {
    if (!rejectReason) return;
    store.updateEventStatus(id, 'rejected', rejectReason);
    setRejectId(null);
    setRejectReason('');
    setEvents([...store.events]);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Event Approval Queue</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold text-xs">
            {pendingEvents.length} Pending
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Review coordinator submissions before publishing to the student mobile app
        </p>
      </div>

      {pendingEvents.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-base">Approval Queue is Clear</h3>
          <p className="text-xs text-muted-foreground mt-1">
            All submitted events have been reviewed and published.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingEvents.map((event) => (
            <div
              key={event.id}
              className="p-6 rounded-2xl border border-white/10 border-t-white/20 bg-slate-900/60 backdrop-blur-2xl shadow-xl space-y-4 hover:border-sky-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {event.category}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Awaiting Approval
                  </span>
                  {event.club && (
                    <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded-md">
                      {event.club.name}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Submitted: {new Date(event.created_at).toLocaleDateString()}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold">{event.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Venue: {event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Starts: {new Date(event.start_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Capacity: {event.max_participants} seats</span>
                </div>
              </div>

              {rejectId === event.id ? (
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3">
                  <label className="block text-xs font-bold text-destructive">
                    Reason for Rejection *
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Schedule clash with University Convocation, revise venue..."
                    className="w-full px-3 py-2 rounded-lg border border-destructive/30 bg-background text-sm focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectId(null)}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(event.id)}
                      className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRejectId(event.id)}
                    className="px-4 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(event.id)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve & Publish
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
