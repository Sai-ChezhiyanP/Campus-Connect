'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  GraduationCap,
  Mail,
  Phone,
  Search,
  Shield,
  UserCheck,
  Building,
} from 'lucide-react';
import { AppRole, Club, Profile } from '@campus-connect/types';
import { store } from '@/lib/store';

export default function UserManagementPage() {
  const [profiles, setProfiles] = useState<Profile[]>(store.profiles);
  const [clubs, setClubs] = useState<Club[]>(store.clubs);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    store.syncFromServer();
    const sync = () => {
      setProfiles([...store.profiles]);
      setClubs([...store.clubs]);
    };
    sync();
    const unsub = store.subscribe(sync);
    return () => unsub();
  }, []);

  const filtered = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.registration_number.toLowerCase().includes(search.toLowerCase()) ||
      p.college_email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleToggle = (userId: string, targetRole: AppRole) => {
    const user = store.profiles.find((p) => p.id === userId);
    if (!user) return;

    const currentRoles: AppRole[] = user.roles ? [...user.roles] : ['student'];
    let newRoles: AppRole[];

    if (currentRoles.includes(targetRole)) {
      if (currentRoles.length > 1) {
        newRoles = currentRoles.filter((r): r is AppRole => r !== targetRole);
      } else {
        newRoles = currentRoles;
      }
    } else {
      newRoles = [...currentRoles, targetRole];
    }

    store.updateUserRoles(userId, newRoles, store.currentUser?.full_name || 'Campus Administrator');
    setProfiles([...store.profiles]);
    setFeedback(`Roles for ${user.full_name} updated to [${newRoles.join(', ')}]`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleClubAssignment = (userId: string, clubId: string) => {
    const assignedId = clubId === '' ? null : clubId;
    store.assignCoordinatorToClub(userId, assignedId);
    setProfiles([...store.profiles]);
    setClubs([...store.clubs]);

    const targetUser = store.profiles.find((p) => p.id === userId);
    const clubName = clubs.find((c) => c.id === assignedId)?.name || 'None';
    setFeedback(`Assigned ${targetUser?.full_name} to club: ${clubName}`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
          User & Coordinator Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Assign institutional roles, link coordinators to specific clubs, and manage student verifications
        </p>
      </div>

      {feedback && (
        <div className="px-4 py-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-sky-400" />
          {feedback}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, reg number, or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 text-sm backdrop-blur-xl focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4">Student / Staff Profile</th>
              <th className="py-3.5 px-4">Registration No</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Roles & Club Assignment</th>
              <th className="py-3.5 px-4 text-right">Role Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-slate-300">
            {filtered.map((profile) => {
              const isCoord = profile.roles?.includes('coordinator');
              const assignedClub = clubs.find((c) => c.id === profile.assigned_club_id);

              return (
                <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-white text-sm">{profile.full_name}</div>
                    <div className="text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3 w-3 text-sky-400" /> {profile.college_email}
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono font-semibold text-slate-300">
                    {profile.registration_number}
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold capitalize text-[11px]">
                      {profile.verification_status}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {profile.roles?.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded-md font-bold capitalize border text-[10px] ${
                              r === 'admin'
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                : r === 'coordinator'
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : r === 'faculty'
                                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                : 'bg-slate-800 text-slate-400 border-white/10'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>

                      {/* Coordinator Club Assignment Selector */}
                      {isCoord && (
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                          <select
                            value={profile.assigned_club_id || ''}
                            onChange={(e) => handleClubAssignment(profile.id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-sky-500/30 bg-slate-950/80 text-sky-200 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                          >
                            <option value="">No Club (Unassigned)</option>
                            {clubs.map((club) => (
                              <option key={club.id} value={club.id} className="bg-slate-900 text-white">
                                {club.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(['coordinator', 'faculty', 'admin'] as const).map((r) => {
                        const hasRole = profile.roles?.includes(r);
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => handleRoleToggle(profile.id, r)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all capitalize cursor-pointer ${
                              hasRole
                                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sm shadow-sky-500/20'
                                : 'bg-slate-800/80 text-slate-400 border-white/10 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
