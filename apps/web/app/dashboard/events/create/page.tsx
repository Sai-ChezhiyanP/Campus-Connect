'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  Lock,
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
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?fit=crop&w=840&h=1188&q=80',
  },
  {
    name: 'AI & Data Science',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?fit=crop&w=840&h=1188&q=80',
  },
  {
    name: 'Robotics & Hardware',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?fit=crop&w=840&h=1188&q=80',
  },
  {
    name: 'Cultural & Music Fest',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?fit=crop&w=840&h=1188&q=80',
  },
  {
    name: 'Sports & Athletics',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?fit=crop&w=840&h=1188&q=80',
  },
  {
    name: 'Campus Symposium',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?fit=crop&w=840&h=1188&q=80',
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

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Enforce exact A4 portrait dimensions (840 x 1188 px, aspect ratio 210:297)
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
          setFormData((prev) => ({ ...prev, poster_url: compressedDataUrl }));
          setErrorMessage('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const coordinatorClub = store.clubs.find((c) => c.id === assignedClubId);
  const isCoordinatorUnassigned = !isAdmin && isCoordinator && !assignedClubId;

  const handleSubmit = async (e: React.FormEvent) => {
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
      setErrorMessage('A4 Portrait Event Poster is mandatory. Please upload an image or pick a preset.');
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
      await store.createEvent({
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

  const isAllowed = Boolean(isAdmin || isCoordinator || store.currentUser?.roles?.includes('faculty'));

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
          <h1 className="text-2xl font-black text-white">Event Creation Restricted</h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Students cannot create campus events. Official event submissions are strictly reserved for appointed Club Coordinators, Faculty Members, and Campus Administrators.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
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
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Hero A4 Portrait Poster in Preview */}
            <div className="w-full md:w-64 max-w-[260px] aspect-[210/297] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-950 relative flex-shrink-0 mx-auto md:mx-0">
              {formData.poster_url ? (
                <>
                  <img
                    src={formData.poster_url}
                    alt="Event Poster Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-[10px] font-black text-sky-400 tracking-wider uppercase">
                    A4 Portrait Poster
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                  <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-400">No poster uploaded</p>
                  <span className="text-[10px] text-slate-500 mt-1">210 × 297 mm format</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-black uppercase tracking-wider">
                  {formData.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10 text-xs font-bold">
                  {formData.organizing_type === 'club'
                    ? store.clubs.find((c) => c.id === formData.club_id)?.name || 'Student Club'
                    : 'Institutional'}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Awaiting Approval
                </span>
              </div>

              <h2 className="text-2xl font-black text-white">{formData.title || 'Untitled Event'}</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {formData.description || 'No description provided yet.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-sky-400" />
                  <span>{formData.venue || 'Venue TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-400" />
                  <span>{formData.start_date ? new Date(formData.start_date).toLocaleString() : 'Date TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-sky-400" />
                  <span>Capacity: {formData.max_participants} seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-400" />
                  <span>Deadline: {formData.registration_deadline ? new Date(formData.registration_deadline).toLocaleString() : 'TBD'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/60 backdrop-blur-2xl border border-white/10 border-t-white/20 rounded-2xl p-6 shadow-xl text-white">
          <div className="space-y-5">
            {/* Event Poster Section (MANDATORY A4 PORTRAIT) */}
            <div className="space-y-3 p-5 rounded-2xl border border-sky-500/30 bg-sky-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-sky-400">
                      Event Poster *
                    </label>
                    <span className="px-2 py-0.5 rounded-full bg-sky-400/10 border border-sky-400/30 text-sky-300 text-[10px] font-extrabold uppercase tracking-wide">
                      A4 Portrait (210 × 297 mm)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Event posters must be in standard vertical A4 portrait format (1:1.414 ratio) for campus notice boards and mobile cards.
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
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="relative w-48 sm:w-56 aspect-[210/297] rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-slate-950 flex-shrink-0 group">
                    <img
                      src={formData.poster_url}
                      alt="Uploaded A4 Poster"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[9px] font-black text-sky-400 uppercase tracking-wider border border-white/10">
                      A4 Portrait
                    </div>
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold shadow-lg hover:bg-sky-400 transition-colors">
                        Change Poster
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="h-4 w-4" /> A4 Portrait Poster Attached
                    </div>
                    <p className="leading-relaxed">
                      Your poster has been formatted to the institutional A4 portrait standard (210×297mm). It will be showcased on the campus digital bulletin and mobile application.
                    </p>
                    <label className="inline-block mt-2 cursor-pointer text-sky-400 hover:text-sky-300 underline font-semibold">
                      Upload replacement poster
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Upload Box */}
                  <label className="border-2 border-dashed border-white/20 hover:border-sky-400/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 transition-all group aspect-[210/297] max-w-[210px] mx-auto w-full">
                    <Upload className="h-8 w-8 text-sky-400 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-white">Upload A4 Poster</span>
                    <span className="text-[10px] text-slate-400 mt-1">Vertical A4 format</span>
                    <span className="text-[9px] text-sky-400/80 mt-1">(Auto-formatted to 210×297mm)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Preset Quick Selection */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-300">Or Select an Official A4 Portrait Preset:</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {POSTER_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, poster_url: preset.url })}
                          className="relative aspect-[210/297] rounded-xl overflow-hidden border border-white/10 hover:border-sky-400 group text-left transition-all shadow-md"
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-1.5 text-center">
                            <span className="text-[9px] font-bold text-white leading-tight w-full">
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
