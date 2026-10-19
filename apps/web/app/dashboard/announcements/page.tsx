'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Eye,
  Megaphone,
  Radio,
  Send,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { ANNOUNCEMENT_CATEGORIES } from '@campus-connect/shared';
import { store } from '@/lib/store';

export default function FacultyBulletinHubPage() {
  const [announcements, setAnnouncements] = useState(store.announcements);
  const [isCreating, setIsCreating] = useState(false);

  React.useEffect(() => {
    const sync = () => setAnnouncements([...store.announcements]);
    sync();
    const unsub = store.subscribe(sync);
    return () => unsub();
  }, []);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>(ANNOUNCEMENT_CATEGORIES[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isMandatory, setIsMandatory] = useState(false);
  const [targetScope, setTargetScope] = useState<'campus' | 'department' | 'programme' | 'batch' | 'section'>('department');
  const [targetDepartmentId, setTargetDepartmentId] = useState(store.departments[0]?.id || '');
  const [targetProgrammeId, setTargetProgrammeId] = useState(store.programmes[0]?.id || '');
  const [targetAdmissionYear, setTargetAdmissionYear] = useState(2024);
  const [targetSection, setTargetSection] = useState('A');
  const [previewOpen, setPreviewOpen] = useState(false);

  const calculateEstimatedRecipients = () => {
    switch (targetScope) {
      case 'campus':
        return '~4,200 Students & Faculty';
      case 'department':
        return '~750 Department Students';
      case 'programme':
        return '~180 Programme Students';
      case 'batch':
        return '~900 Batch Students';
      case 'section':
        return '~65 Section Students';
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newAnn = store.createAnnouncement({
      title,
      content,
      category,
      priority,
      is_mandatory: isMandatory,
      target_scope: targetScope,
      target_department_id: targetScope === 'department' ? targetDepartmentId : null,
      target_programme_id: targetScope === 'programme' ? targetProgrammeId : null,
      target_admission_year: targetScope === 'batch' ? targetAdmissionYear : null,
      target_section: targetScope === 'section' ? targetSection : null,
      author_id: store.currentUser.id,
    });

    setAnnouncements([...store.announcements]);
    setIsCreating(false);
    setTitle('');
    setContent('');
    setPreviewOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faculty Bulletin Hub</h1>
          <p className="text-sm text-muted-foreground">
            Targeted academic broadcasting and institutional notices for SRMIST Ramapuram
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-md shadow-primary/20"
        >
          <Megaphone className="h-4 w-4" />
          <span>{isCreating ? 'Close Broadcast Form' : 'Broadcast Bulletin'}</span>
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleBroadcast}
          className="p-6 rounded-2xl border border-sky-500/30 bg-slate-900/80 backdrop-blur-2xl shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-base flex items-center gap-2 text-white">
              <Radio className="h-5 w-5 text-sky-400" /> Target Broadcast Composer
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 font-semibold text-slate-300 border border-white/10">
              Estimated Reach: {calculateEstimatedRecipients()}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Notice Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Mandatory End-Semester Laboratory Assessment Schedule"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Notice Body / Directive *
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write detailed instructions, venue locations, and compliance dates..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {ANNOUNCEMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Target Scope *
                </label>
                <select
                  value={targetScope}
                  onChange={(e) => setTargetScope(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="campus">Campus-Wide (All)</option>
                  <option value="department">Specific Department</option>
                  <option value="programme">Specific B.Tech Programme</option>
                  <option value="batch">Admission Batch (Year)</option>
                  <option value="section">Specific Section</option>
                </select>
              </div>
            </div>

            {/* Scope Details Selection */}
            {targetScope === 'department' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Department
                </label>
                <select
                  value={targetDepartmentId}
                  onChange={(e) => setTargetDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {store.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetScope === 'programme' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  B.Tech Programme
                </label>
                <select
                  value={targetProgrammeId}
                  onChange={(e) => setTargetProgrammeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {store.programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <input
                type="checkbox"
                id="isMandatory"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="h-4 w-4 rounded text-destructive"
              />
              <label htmlFor="isMandatory" className="text-xs font-semibold text-foreground cursor-pointer">
                Mark as Mandatory Notice (Never suppressed by student custom feed filters)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-2"
            >
              <Send className="h-4 w-4" /> Broadcast Announcement
            </button>
          </div>
        </form>
      )}

      {/* Bulletins Feed */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`p-6 rounded-2xl border backdrop-blur-2xl transition-all shadow-lg ${
              ann.is_mandatory || ann.priority === 'urgent'
                ? 'border-rose-500/30 bg-rose-950/20 shadow-rose-950/20'
                : 'border-white/10 bg-slate-900/60 hover:border-sky-500/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-secondary text-secondary-foreground">
                  {ann.category}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    ann.priority === 'urgent'
                      ? 'bg-destructive text-destructive-foreground'
                      : ann.priority === 'high'
                      ? 'bg-amber-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {ann.priority} Priority
                </span>
                {ann.is_mandatory && (
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> Mandatory
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Broadcasted: {new Date(ann.created_at).toLocaleDateString()}
              </div>
            </div>

            <h3 className="text-base font-bold text-foreground mt-2">{ann.title}</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
              {ann.content}
            </p>

            <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
              <span>Author: {ann.author_profile?.full_name || 'Faculty / Admin'}</span>
              <span className="capitalize">Target Scope: {ann.target_scope}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
