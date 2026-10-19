import fs from 'fs';
import path from 'path';
import {
  Announcement,
  AppRole,
  Club,
  EventItem,
  EventRegistration,
  Profile,
} from '@campus-connect/types';
import {
  INITIAL_AUDIT_LOGS,
  SEED_ANNOUNCEMENTS,
  SEED_CLUBS,
  SEED_DEPARTMENTS,
  SEED_PROFILES,
  SEED_PROGRAMMES,
  AuditLogItem,
} from './store';

export interface DatabaseState {
  profiles: Profile[];
  events: EventItem[];
  announcements: Announcement[];
  registrations: EventRegistration[];
  auditLogs: AuditLogItem[];
  clubs: Club[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'campus_connect_db.json');

function ensureInitialized(): DatabaseState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content) as Partial<DatabaseState>;
      return {
        profiles: parsed.profiles && parsed.profiles.length > 0 ? parsed.profiles : [...SEED_PROFILES],
        events: parsed.events || [],
        announcements: parsed.announcements && parsed.announcements.length > 0 ? parsed.announcements : [...SEED_ANNOUNCEMENTS],
        registrations: parsed.registrations || [],
        auditLogs: parsed.auditLogs || [...INITIAL_AUDIT_LOGS],
        clubs: parsed.clubs && parsed.clubs.length > 0 ? parsed.clubs : [...SEED_CLUBS],
      };
    }
  } catch (err) {
    console.error('Failed to read database file, initializing defaults:', err);
  }

  const initialState: DatabaseState = {
    profiles: [...SEED_PROFILES],
    events: [],
    announcements: [...SEED_ANNOUNCEMENTS],
    registrations: [],
    auditLogs: [...INITIAL_AUDIT_LOGS],
    clubs: [...SEED_CLUBS],
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to initialize database file:', err);
  }

  return initialState;
}

export function getDatabase(): DatabaseState {
  return ensureInitialized();
}

export function saveDatabase(state: DatabaseState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

export function upsertEvent(event: EventItem): EventItem {
  const db = getDatabase();
  const index = db.events.findIndex((e) => e.id === event.id);

  if (index >= 0) {
    db.events[index] = { ...db.events[index], ...event, updated_at: new Date().toISOString() };
  } else {
    db.events.unshift({
      ...event,
      created_at: event.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: index >= 0 ? 'EVENT_UPDATE' : 'EVENT_CREATE',
    entity: event.title,
    actor: event.contact_info?.name || 'Authorized User',
    timestamp: new Date().toLocaleString(),
    details: `Event ${event.title} [Status: ${event.status}]`,
  });

  saveDatabase(db);
  return index >= 0 ? db.events[index] : db.events[0];
}

export function upsertUser(profile: Profile): Profile {
  const db = getDatabase();
  const index = db.profiles.findIndex(
    (p) =>
      p.id === profile.id ||
      (profile.registration_number && p.registration_number.toUpperCase() === profile.registration_number.toUpperCase()) ||
      (profile.college_email && p.college_email.toLowerCase() === profile.college_email.toLowerCase())
  );

  if (index >= 0) {
    db.profiles[index] = {
      ...db.profiles[index],
      ...profile,
      updated_at: new Date().toISOString(),
    };
  } else {
    const newProfile: Profile = {
      ...profile,
      id: profile.id || 'u-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      verification_status: profile.verification_status || 'active',
      roles: profile.roles && profile.roles.length > 0 ? profile.roles : ['student'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.profiles.unshift(newProfile);
  }

  const saved = index >= 0 ? db.profiles[index] : db.profiles[0];

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: index >= 0 ? 'USER_UPDATE' : 'USER_REGISTER',
    entity: saved.full_name,
    actor: saved.full_name,
    timestamp: new Date().toLocaleString(),
    details: `Profile ${saved.full_name} (${saved.registration_number}) [Roles: ${saved.roles?.join(', ')}]`,
  });

  saveDatabase(db);
  return saved;
}

export function updateEventStatus(id: string, status: EventItem['status'], rejectionReason?: string): EventItem | null {
  const db = getDatabase();
  const event = db.events.find((e) => e.id === id);
  if (!event) return null;

  event.status = status;
  event.updated_at = new Date().toISOString();
  if (rejectionReason) {
    (event as any).rejection_reason = rejectionReason;
  }

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: `EVENT_${status.toUpperCase()}`,
    entity: event.title,
    actor: 'Administrator',
    timestamp: new Date().toLocaleString(),
    details: `Event ${event.title} status updated to ${status}${rejectionReason ? ` • Reason: ${rejectionReason}` : ''}`,
  });

  saveDatabase(db);
  return event;
}

export function upsertAnnouncement(announcement: Announcement): Announcement {
  const db = getDatabase();
  const index = db.announcements.findIndex((a) => a.id === announcement.id);

  if (index >= 0) {
    db.announcements[index] = { ...db.announcements[index], ...announcement };
  } else {
    db.announcements.unshift({
      ...announcement,
      created_at: announcement.created_at || new Date().toISOString(),
    });
  }

  saveDatabase(db);
  return index >= 0 ? db.announcements[index] : db.announcements[0];
}

export function addRegistration(reg: EventRegistration): { success: boolean; error?: string; registration?: EventRegistration } {
  const db = getDatabase();
  const event = db.events.find((e) => e.id === reg.event_id);

  if (!event) {
    return { success: false, error: 'Event not found.' };
  }

  // Check if already registered
  const existing = db.registrations.find(
    (r) => r.event_id === reg.event_id && r.user_id === reg.user_id && r.status === 'confirmed'
  );
  if (existing) {
    return { success: false, error: 'User already registered for this event.' };
  }

  // Check capacity
  if (event.current_registrations >= event.max_participants) {
    return { success: false, error: 'Event capacity reached.' };
  }

  event.current_registrations += 1;
  const newReg: EventRegistration = {
    ...reg,
    id: reg.id || 'r-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    status: 'confirmed',
    registered_at: new Date().toISOString(),
  };

  db.registrations.unshift(newReg);
  saveDatabase(db);

  return { success: true, registration: newReg };
}

export function cancelRegistration(eventId: string, userId: string): { success: boolean; error?: string } {
  const db = getDatabase();
  const regIndex = db.registrations.findIndex(
    (r) => r.event_id === eventId && r.user_id === userId && r.status === 'confirmed'
  );

  if (regIndex === -1) {
    return { success: false, error: 'No active registration found.' };
  }

  db.registrations.splice(regIndex, 1);
  const event = db.events.find((e) => e.id === eventId);
  if (event && event.current_registrations > 0) {
    event.current_registrations -= 1;
  }

  saveDatabase(db);
  return { success: true };
}

export function upsertClub(clubData: Partial<Club> & { name: string }): Club {
  const db = getDatabase();
  const index = clubData.id ? db.clubs.findIndex((c) => c.id === clubData.id) : -1;

  if (index >= 0) {
    db.clubs[index] = {
      ...db.clubs[index],
      ...clubData,
    };
  } else {
    const newClub: Club = {
      id: clubData.id || 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: clubData.name,
      category: clubData.category || 'Technical',
      description: clubData.description || '',
      logo_url: clubData.logo_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300',
      contact_email: clubData.contact_email || 'club@srmist.edu.in',
      faculty_adviser_id: clubData.faculty_adviser_id || null,
      coordinator_ids: clubData.coordinator_ids || [],
      created_at: new Date().toISOString(),
    };
    db.clubs.unshift(newClub);
  }

  const saved = index >= 0 ? db.clubs[index] : db.clubs[0];

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: index >= 0 ? 'CLUB_UPDATE' : 'CLUB_CREATE',
    entity: saved.name,
    actor: 'Administrator',
    timestamp: new Date().toLocaleString(),
    details: `${index >= 0 ? 'Updated' : 'Created'} club: ${saved.name} [Category: ${saved.category}]`,
  });

  saveDatabase(db);
  return saved;
}

export function deleteClub(clubId: string): boolean {
  const db = getDatabase();
  const index = db.clubs.findIndex((c) => c.id === clubId);
  if (index === -1) return false;

  const removed = db.clubs.splice(index, 1)[0];

  // Also remove assignment from any coordinators assigned to this club
  db.profiles.forEach((p) => {
    if (p.assigned_club_id === clubId) {
      p.assigned_club_id = null;
    }
  });

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'CLUB_DELETE',
    entity: removed.name,
    actor: 'Administrator',
    timestamp: new Date().toLocaleString(),
    details: `Deleted recognized club: ${removed.name}`,
  });

  saveDatabase(db);
  return true;
}

export function updateEvent(eventId: string, updates: Partial<EventItem>, actorName: string = 'Authorized Coordinator'): EventItem | null {
  const db = getDatabase();
  const event = db.events.find((e) => e.id === eventId);
  if (!event) return null;

  Object.assign(event, updates, {
    updated_at: new Date().toISOString(),
  });

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'EVENT_EDIT',
    entity: event.title,
    actor: actorName,
    timestamp: new Date().toLocaleString(),
    details: `Event ${event.title} details updated by ${actorName}`,
  });

  saveDatabase(db);
  return event;
}
