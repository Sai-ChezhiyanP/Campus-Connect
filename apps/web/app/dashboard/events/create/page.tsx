'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  MapPin,
  Send,
  Upload,
  Users,
  X,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { EVENT_CATEGORIES } from '@campus-connect/shared';
import { store } from '@/lib/store';

const POSTER_PRESETS = [
  {
    name: 'Hackathon & Coding',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&q=80',
  },
  {
    name: 'AI & Data Science',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&q=80',
  },
  {
    name: 'Robotics & Hardware',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000&q=80',
  },
  {
    name: 'Cultural & Music Fest',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&q=80',
  },
  {
    name: 'Sports & Athletics',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&q=80',
  },
  {
    name: 'Campus Symposium',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&q=80',
  },
];

export default function CreateEventPage() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [assignedClubId, setAssignedClubId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: EVENT_CATEGORIES[0] as string,
    organizing_type: 'club' as 'club' | 'department' | 'central',
    club_id: '',
    department_id: store.departments[0]?.id || '',
    venue: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_participants: 100,
    poster_url: '',
    contact_name: '',
    contact_phone: '+919876543210',
    contact_email: '',
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    store.syncFromServer();
    const updateRoles = () => {
      const user = store.currentUser;
      const adminRole = Boolean(user.roles?.includes('admin'));
      const coordRole = Boolean(user.roles?.includes('coordinator'));
      const clubId = user.assigned_club_id || null;

      setIsAdmin(adminRole);
      setIsCoordinator(coordRole);
      setAssignedClubId(clubId);

      setFormData((prev) => ({
        ...prev,
        contact_name: user?.full_name || '',
        contact_email: user?.college_email || '',
        organizing_type: !adminRole && coordRole ? 'club' : prev.organizing_type,
        club_id: !adminRole && coordRole ? clubId || '' : prev.club_id || store.clubs[0]?.id || '',
      }));
    };

    updateRoles();
    const unsub = store.subscribe(updateRoles);
    return () => unsub();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({ ...prev, poster_url: result }));
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const coordinatorClub = store.clubs.find((c) => c.id === assignedClubId);
  const isCoordinatorUnassigned = !isAdmin && isCoordinator && !assignedClubId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isCoordinatorUnassigned) {
      setErrorMessage('Your coordinator account is not assigned to a club. Contact an Admin to link your club.');
      return;
    }

    if (!formData.title || !formData.description || !formData.venue) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (!formData.poster_url || !formData.poster_url.trim()) {
      setErrorMessage('Event poster is mandatory. Please upload an image or pick a preset poster.');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setErrorMessage('End date must be after start date.');
      return;
    }

    if (new Date(formData.registration_deadline) > new Date(formData.start_date)) {
      setErrorMessage('Registration deadline cannot be after event start date.');
      return;
    }

    setIsSubmitting(true);

    try {
      store.createEvent({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        organizing_type: formData.organizing_type,
        club_id: formData.organizing_type === 'club' ? formData.club_id : null,
        department_id: formData.organizing_type === 'department' ? formData.department_id : null,
        venue: formData.venue,
        poster_url: formData.poster_url,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        registration_deadline: new Date(formData.registration_deadline).toISOString(),
        max_participants: Number(formData.max_participants),
        contact_info: {
          name: formData.contact_name,
          phone: formData.contact_phone,
          email: formData.contact_email,
        },
        status: isAdmin ? 'published' : 'pending_approval',
        created_by: store.currentUser.id,
      });

      setIsSubmitting(false);
      router.push('/dashboard/events');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit event.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
            Submit Campus Event
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create an official campus event with mandatory poster for student discovery and registration
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors"
        >
          <Eye className="h-4 w-4 text-sky-400" />
          {previewMode ? 'Back to Editor' : 'Live Preview'}
        </button>
      </div>

      {/* Coordinator Club Scope Notice */}
      {!isAdmin && isCoordinator && (
        <div
          className={`p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3 ${
            isCoordinatorUnassigned
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-sky-500/10 border-sky-500/30 text-sky-200'
          }`}
        >
          {isCoordinatorUnassigned ? (
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          ) : (
            <Building className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            {isCoordinatorUnassigned ? (
              <>
                <span className="font-extrabold text-amber-300 block text-sm">Action Required: Unassigned Coordinator</span>
                Your account has the Coordinator role, but you have not yet been linked to an official student club by an Administrator. You cannot submit events until assigned to a club.
              </>
            ) : (
              <>
                <span className="font-extrabold text-sky-300 block text-sm">Designated Club Coordinator</span>
                You are submitting this event on behalf of{' '}
                <strong className="text-white underline underline-offset-2">{coordinatorClub?.name || 'Your Assigned Club'}</strong>.
                As a coordinator, you have permission to manage and edit events for this club only.
              </>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm font-semibold">
          {errorMessage}
        </div>
      )}

      {previewMode ? (
        /* Preview Card */
        <div className="rounded-2xl border border-white/10 border-t-white/20 bg-slate-900/60 backdrop-blur-2xl p-6 shadow-xl space-y-6 text-white overflow-hidden">
          {/* Hero Poster in Preview */}
          {formData.poster_url ? (
            <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
              <img
                src={formData.poster_url}
                alt="Event Poster Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-sky-500/80 backdrop-blur-md text-slate-950 text-xs font-black uppercase tracking-wider">
                  {formData.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-white/20 backdrop-blur-md text-white text-xs font-bold">
                  {formData.organizing_type === 'club'
                    ? store.clubs.find((c) => c.id === formData.club_id)?.name || 'Student Club'
                    : 'Institutional'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-40 rounded-xl border border-dashed border-white/15 flex flex-col items-center justify-center text-slate-500 bg-slate-950/40">
              <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs font-semibold">No poster uploaded yet</p>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-2xl font-black text-white">{formData.title || 'Untitled Event'}</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {formData.description || 'No description provided yet.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <MapPin className="h-4 w-4 text-sky-400" />
              <span>{formData.venue || 'Venue TBD'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Calendar className="h-4 w-4 text-sky-400" />
              <span>{formData.start_date ? new Date(formData.start_date).toLocaleString() : 'Date TBD'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Users className="h-4 w-4 text-sky-400" />
              <span>Capacity: {formData.max_participants} seats</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Clock className="h-4 w-4 text-sky-400" />
              <span>Deadline: {formData.registration_deadline ? new Date(formData.registration_deadline).toLocaleString() : 'TBD'}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/60 backdrop-blur-2xl border border-white/10 border-t-white/20 rounded-2xl p-6 shadow-xl text-white">
          <div className="space-y-5">
            {/* Event Poster Section (MANDATORY) */}
            <div className="space-y-3 p-5 rounded-xl border border-sky-500/20 bg-sky-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-sky-400">
                    Event Poster * <span className="text-[10px] text-slate-400 font-normal lowercase">(mandatory)</span>
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Coordinators must upload a high-resolution banner or choose an official preset
                  </p>
                </div>
                {formData.poster_url && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, poster_url: '' })}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>

              {formData.poster_url ? (
                <div className="relative rounded-xl overflow-hidden border border-white/15 h-48 bg-slate-950 group">
                  <img
                    src={formData.poster_url}
                    alt="Uploaded Poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold shadow-lg hover:bg-sky-400 transition-colors">
                      Change Image
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upload Box */}
                  <label className="border-2 border-dashed border-white/20 hover:border-sky-400/60 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 transition-all group">
                    <Upload className="h-7 w-7 text-sky-400 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-white">Click to Upload Custom Poster</span>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WEBP (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Preset Quick Selection */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300">Or Pick a Standard Preset:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {POSTER_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, poster_url: preset.url })}
                          className="relative h-14 rounded-lg overflow-hidden border border-white/10 hover:border-sky-400 group text-left transition-all"
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-950/70 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center p-1 text-center">
                            <span className="text-[9px] font-bold text-white line-clamp-2 leading-tight">
                              {preset.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., HackRamapuram 2026: 24-Hour National Hackathon"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Description & Detailed Agenda *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide comprehensive details about eligibility, rounds, prizes, and requirements..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Organizing Entity
                </label>
                {/* If coordinator, locked to club */}
                {!isAdmin && isCoordinator ? (
                  <input
                    type="text"
                    disabled
                    value={`Student Club: ${coordinatorClub?.name || 'Assigned Club'}`}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/50 text-slate-400 text-sm cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={formData.organizing_type}
                    onChange={(e) =>
                      setFormData({ ...formData, organizing_type: e.target.value as 'club' | 'department' | 'central' })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="club">Student Club / Society</option>
                    <option value="department">Academic Department</option>
                    <option value="central">Central SRMIST Institution</option>
                  </select>
                )}
              </div>
            </div>

            {formData.organizing_type === 'club' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Selected Club *
                </label>
                {!isAdmin && isCoordinator ? (
                  <input
                    type="text"
                    disabled
                    value={coordinatorClub?.name || 'No Club Assigned'}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-200 text-sm font-bold cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={formData.club_id}
                    onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {store.clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Venue Location *
              </label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g., Main Auditorium, Block 3 / AI Labs"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Max Participants *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCoordinatorUnassigned}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>{isAdmin ? 'Publish Immediately' : 'Submit for Approval'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
