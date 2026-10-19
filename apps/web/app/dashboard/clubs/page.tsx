'use client';

import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Edit2,
  ExternalLink,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  Users2,
  X,
} from 'lucide-react';
import { Club } from '@campus-connect/types';
import { store } from '@/lib/store';

const CLUB_CATEGORIES = [
  'Technical',
  'Cultural',
  'Sports',
  'Literary',
  'Social Service',
  'Entrepreneurship',
  'Academic',
];

export default function ClubsManagementPage() {
  const [clubs, setClubs] = useState(store.clubs);
  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [profiles, setProfiles] = useState(store.profiles);
  const isAdmin = currentUser.roles?.includes('admin');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CLUB_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<string>('');

  React.useEffect(() => {
    store.syncFromServer();
    const sync = () => {
      setClubs([...store.clubs]);
      setCurrentUser({ ...store.currentUser });
      setProfiles([...store.profiles]);
    };
    const unsub = store.subscribe(sync);
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingClub(null);
    setName('');
    setCategory(CLUB_CATEGORIES[0]);
    setDescription('');
    setContactEmail('');
    setLogoUrl('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300');
    setSelectedCoordinatorId('');
    setIsModalOpen(true);
  };

  const openEditModal = (club: Club) => {
    setEditingClub(club);
    setName(club.name);
    setCategory(club.category);
    setDescription(club.description);
    setContactEmail(club.contact_email || '');
    setLogoUrl(club.logo_url || '');
    // Find coordinator assigned to this club
    const coordinator = profiles.find((p) => p.assigned_club_id === club.id || club.coordinator_ids?.includes(p.id));
    setSelectedCoordinatorId(coordinator?.id || '');
    setIsModalOpen(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNotification({ type: 'error', message: 'Club name is required' });
      return;
    }
    if (!description.trim()) {
      setNotification({ type: 'error', message: 'Club description is required' });
      return;
    }

    if (editingClub) {
      // Update existing club
      store.updateClub(editingClub.id, {
        name: name.trim(),
        category,
        description: description.trim(),
        contact_email: contactEmail.trim() || undefined,
        logo_url: logoUrl || undefined,
        coordinator_ids: selectedCoordinatorId ? [selectedCoordinatorId] : [],
      });

      // Update coordinator assignment
      if (selectedCoordinatorId) {
        store.assignCoordinatorToClub(selectedCoordinatorId, editingClub.id);
      }

      setNotification({ type: 'success', message: `Club "${name}" updated successfully.` });
    } else {
      // Create new club
      const created = store.createClub({
        name: name.trim(),
        category,
        description: description.trim(),
        contact_email: contactEmail.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@srmist.edu.in`,
        logo_url: logoUrl || undefined,
        coordinator_ids: selectedCoordinatorId ? [selectedCoordinatorId] : [],
      });

      if (selectedCoordinatorId) {
        store.assignCoordinatorToClub(selectedCoordinatorId, created.id);
      }

      setNotification({ type: 'success', message: `Club "${name}" created successfully.` });
    }

    setIsModalOpen(false);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDeleteClub = (clubId: string) => {
    const club = clubs.find((c) => c.id === clubId);
    store.deleteClub(clubId);
    setClubs((prev) => prev.filter((c) => c.id !== clubId));
    setDeleteConfirmId(null);
    setNotification({ type: 'success', message: `Club "${club?.name || 'Club'}" removed.` });
    setTimeout(() => setNotification(null), 3500);
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
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-muted-foreground hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            Official Campus Registry
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Clubs & Student Societies</h1>
          <p className="text-sm text-muted-foreground">
            Manage student bodies, coordinator appointments, and recognized campus organizations
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Club</span>
          </button>
        )}
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clubs.map((club) => {
          // Find coordinators assigned to this club
          const assignedCoordinators = profiles.filter(
            (p) => p.assigned_club_id === club.id || club.coordinator_ids?.includes(p.id)
          );

          return (
            <div
              key={club.id}
              className="group relative p-6 rounded-3xl border border-white/10 border-t-white/20 bg-slate-900/60 backdrop-blur-2xl shadow-xl hover:border-sky-500/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {club.logo_url ? (
                    <img
                      src={club.logo_url}
                      alt={club.name}
                      className="h-14 w-14 rounded-2xl object-cover border border-white/10 shadow-md"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <Users2 className="h-7 w-7" />
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {club.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 group-hover:text-sky-300 transition-colors">
                      {club.name}
                    </h3>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1.5 opacity-90">
                    <button
                      onClick={() => openEditModal(club)}
                      title="Edit Club Details"
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-sky-500/20 hover:text-sky-400 text-slate-300 border border-white/5 transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(club.id)}
                      title="Remove Club"
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 border border-white/5 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed min-h-[3rem]">
                {club.description}
              </p>

              {/* Assigned Coordinators Badge */}
              <div className="p-3 rounded-2xl bg-slate-950/50 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-sky-400" />
                    Assigned Student Coordinator
                  </span>
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                    {assignedCoordinators.length > 0 ? `${assignedCoordinators.length} Assigned` : 'Vacant'}
                  </span>
                </div>

                {assignedCoordinators.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {assignedCoordinators.map((c) => (
                      <div
                        key={c.id}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="font-medium">{c.full_name}</span>
                        <span className="text-[10px] text-slate-400">({c.registration_number})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No student coordinator currently assigned.</p>
                )}
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-sky-400" /> {club.contact_email || 'contact@srmist.edu.in'}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" /> Institutional Society
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Club Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingClub ? 'Edit Club Details' : 'Register New Campus Club'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {editingClub ? 'Update club metadata, description, and coordinator lead' : 'Add an official recognized student society'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Club Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computing & Coding Club (C3)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-sky-500 text-sm"
                  >
                    {CLUB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="club@srmist.edu.in"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Official mission, focus areas, and activities of this student body..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>

              {/* Logo Upload & URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Club Logo / Emblem
                </label>
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="h-12 w-12 rounded-xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-500">
                      <Building2 className="h-6 w-6" />
                    </div>
                  )}

                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-sky-500/40 bg-sky-500/5 hover:bg-sky-500/10 cursor-pointer text-xs font-bold text-sky-400 transition-all">
                    <Upload className="h-4 w-4" />
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Assign Coordinator */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Appoint Club Coordinator
                </label>
                <select
                  value={selectedCoordinatorId}
                  onChange={(e) => setSelectedCoordinatorId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-sky-500 text-sm"
                >
                  <option value="">-- No Coordinator Assigned --</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.registration_number}) — {p.roles?.join(', ') || 'student'}
                      {p.assigned_club_id === editingClub?.id ? ' (Currently Assigned)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Coordinators can only submit and edit events belonging to their assigned club.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20"
                >
                  {editingClub ? 'Save Changes' : 'Create Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/30 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-500" />
              Confirm Club Removal
            </h3>
            <p className="text-sm text-slate-300">
              Are you sure you want to remove{' '}
              <span className="font-bold text-white">
                {clubs.find((c) => c.id === deleteConfirmId)?.name}
              </span>
              ? Any assigned coordinators will have their club affiliation unlinked.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteClub(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Delete Club
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
