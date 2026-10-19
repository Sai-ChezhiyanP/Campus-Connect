import {
  Announcement,
  AppRole,
  Club,
  Department,
  EventItem,
  EventRegistration,
  FeedMode,
  FeedPreference,
  InAppNotification,
  Profile,
  Programme,
} from '@campus-connect/types';
import {
  calculateEventAffinityScore,
  INITIAL_BTECH_PROGRAMMES,
  INITIAL_DEPARTMENTS,
  isAnnouncementRelevantForStudent,
} from '@campus-connect/shared';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from './storage';

// Pre-seeded Initial Data
export const MOBILE_DEPARTMENTS: Department[] = INITIAL_DEPARTMENTS.map((d, i) => ({
  id: `d1000000-0000-0000-0000-00000000000${i + 1}`,
  code: d.code,
  name: d.name,
  created_at: new Date().toISOString(),
}));

export const MOBILE_PROGRAMMES: Programme[] = INITIAL_BTECH_PROGRAMMES.map((p, i) => {
  const dept = MOBILE_DEPARTMENTS.find((d) => d.code === p.deptCode) || MOBILE_DEPARTMENTS[0];
  const hex = (i + 1).toString(16).padStart(12, '0');
  return {
    id: `p1000000-0000-0000-0000-${hex}`,
    department_id: dept.id,
    code: p.code,
    name: p.name,
    degree: 'B.Tech',
    is_active: true,
  };
});

export const MOBILE_CLUBS: Club[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Computing & Coding Club (C3)',
    category: 'Technical',
    description: 'Official computer science and programming community organizing hackathons and tech talks.',
    logo_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300',
    contact_email: 'c3club@srmist.edu.in',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    name: 'Robotics and Automation Society',
    category: 'Technical',
    description: 'Designing autonomous rovers and robotics hardware.',
    logo_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300',
    contact_email: 'robotics@srmist.edu.in',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    name: 'SRM Ramapuram Literary & Debating Society',
    category: 'Cultural',
    description: 'Public speaking, model UN, and debating competitions.',
    logo_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300',
    contact_email: 'litdeb@srmist.edu.in',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    name: 'Google Developer Student Club (GDSC)',
    category: 'Technical',
    description: 'Peer developer community for Android, Web, and Cloud.',
    logo_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300',
    contact_email: 'gdsc@srmist.edu.in',
    created_at: new Date().toISOString(),
  },
];

export const MOBILE_TEST_USERS: Profile[] = [
  {
    id: 'u1000000-0000-0000-0000-000000000001',
    full_name: 'Aarav Sharma (Test Student)',
    registration_number: 'RA2411003010001',
    mobile_number: '+919876543210',
    college_email: 'student.test@srmist.edu.in',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    department_id: MOBILE_DEPARTMENTS[0].id,
    programme_id: MOBILE_PROGRAMMES[6].id, // CSE - AIML
    admission_year: 2024,
    current_year_of_study: 1,
    section: 'A',
    verification_status: 'active',
    roles: ['student'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'u1000000-0000-0000-0000-000000000002',
    full_name: 'Priya Raman (Test Coordinator)',
    registration_number: 'RA2411003010002',
    mobile_number: '+919876543211',
    college_email: 'coordinator.test@srmist.edu.in',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    department_id: MOBILE_DEPARTMENTS[0].id,
    programme_id: MOBILE_PROGRAMMES[5].id,
    admission_year: 2023,
    current_year_of_study: 2,
    section: 'B',
    verification_status: 'active',
    roles: ['student', 'coordinator'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'u1000000-0000-0000-0000-000000000003',
    full_name: 'Dr. K. Venkatesh (Test Faculty)',
    registration_number: 'EMP00412',
    mobile_number: '+919876543212',
    college_email: 'faculty.test@srmist.edu.in',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    department_id: MOBILE_DEPARTMENTS[0].id,
    programme_id: null,
    admission_year: 2018,
    current_year_of_study: 4,
    section: 'FAC',
    verification_status: 'active',
    roles: ['faculty'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'u1000000-0000-0000-0000-000000000004',
    full_name: 'Campus Administrator (Test Admin)',
    registration_number: 'EMP00001',
    mobile_number: '+919876543213',
    college_email: 'admin.test@srmist.edu.in',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department_id: null,
    programme_id: null,
    admission_year: 2015,
    current_year_of_study: 4,
    section: 'ADMIN',
    verification_status: 'active',
    roles: ['admin'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Example Events - Initialized empty as requested
export const INITIAL_EVENTS: EventItem[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    title: 'MANDATORY: Odd Semester End-Term Examination Schedule Released',
    content: 'All B.Tech students across all departments are hereby notified that the final timetable for the upcoming semester examinations has been published. Attendance minimum of 75% is strictly enforced.',
    category: 'Examination',
    priority: 'urgent',
    is_mandatory: true,
    target_scope: 'campus',
    author_id: MOBILE_TEST_USERS[3].id,
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    author_profile: MOBILE_TEST_USERS[3],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    title: 'CSE Department: Capstone Project Phase-1 Evaluation Schedule',
    content: 'All final year B.Tech CSE students must submit their Phase-1 GitHub repository link and preliminary documentation by 5:00 PM this Friday.',
    category: 'Academic',
    priority: 'high',
    is_mandatory: false,
    target_scope: 'department',
    target_department_id: MOBILE_DEPARTMENTS[0].id,
    author_id: MOBILE_TEST_USERS[2].id,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    author_profile: MOBILE_TEST_USERS[2],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    title: 'SRMIST Ramapuram: Innovation & Entrepreneurship Cell Grants',
    content: 'Applications are open for student startup prototype grants up to ₹2,50,000. Submit project proposals before end of month.',
    category: 'Opportunities',
    priority: 'medium',
    is_mandatory: false,
    target_scope: 'campus',
    author_id: MOBILE_TEST_USERS[1].id,
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    author_profile: MOBILE_TEST_USERS[1],
  },
];

// Pre-seeded registration - Initialized empty as requested
export const SEED_REGISTRATIONS: EventRegistration[] = [];

const STORAGE_KEYS = {
  CURRENT_USER: 'cc_mobile_current_user_v4',
  IS_LOGGED_IN: 'cc_mobile_is_logged_in_v4',
  REGISTRATIONS: 'cc_mobile_registrations_v4',
  USERS: 'cc_mobile_users_v4',
  EVENTS: 'cc_mobile_events_v4',
  ANNOUNCEMENTS: 'cc_mobile_announcements_v4',
  FOLLOWED_CLUBS: 'cc_mobile_followed_clubs_v4',
  FEED_PREF: 'cc_mobile_feed_pref_v4',
  READ_NOTIFS: 'cc_mobile_read_notifs_v4',
  AUDIT_LOGS: 'cc_mobile_audit_logs_v4',
  CLUBS: 'cc_mobile_clubs_v4',
};

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // Browser / Expo Web
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }

  // Physical device running Expo Go over Wi-Fi
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:3000`;
    }
  }

  // Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

function getSyncInitialUser(): Profile {
  const raw = storage.getItemSync(STORAGE_KEYS.CURRENT_USER);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }
  return MOBILE_TEST_USERS[0];
}

function getSyncInitialAuth(): boolean {
  const raw = storage.getItemSync(STORAGE_KEYS.IS_LOGGED_IN);
  if (raw !== null) {
    return raw === 'true';
  }
  return false; // Show login screen on initial launch!
}

function getSyncInitialRegistrations(): EventRegistration[] {
  const raw = storage.getItemSync(STORAGE_KEYS.REGISTRATIONS);
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {}
  }
  return [];
}

class MobileStore {
  currentUser: Profile = getSyncInitialUser();
  isLoggedIn: boolean = getSyncInitialAuth();
  users: Profile[] = [...MOBILE_TEST_USERS];
  events: EventItem[] = [...INITIAL_EVENTS];
  announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
  clubs: Club[] = [...MOBILE_CLUBS];
  followedClubIds: Set<string> = new Set([MOBILE_CLUBS[0].id]);
  registrations: EventRegistration[] = getSyncInitialRegistrations();
  auditLogs: Array<{ id: string; action: string; entity: string; actor: string; timestamp: string; details: string; }> = [];
  readNotificationIds: Set<string> = new Set();
  isInitialized: boolean = false;

  feedPreference: FeedPreference = {
    user_id: MOBILE_TEST_USERS[0].id,
    mode: 'custom',
    selected_categories: [],
    muted_categories: [],
    followed_clubs: [MOBILE_CLUBS[0].id],
    updated_at: new Date().toISOString(),
  };

  listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  async init() {
    try {
      const [
        savedUser,
        savedLoggedIn,
        savedRegs,
        savedClubs,
        savedPref,
        savedNotifs,
        savedUsers,
        savedAudit,
        savedEvents,
        savedAnns,
        savedAllClubs,
      ] = await Promise.all([
        storage.getItem(STORAGE_KEYS.CURRENT_USER),
        storage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
        storage.getItem(STORAGE_KEYS.REGISTRATIONS),
        storage.getItem(STORAGE_KEYS.FOLLOWED_CLUBS),
        storage.getItem(STORAGE_KEYS.FEED_PREF),
        storage.getItem(STORAGE_KEYS.READ_NOTIFS),
        storage.getItem(STORAGE_KEYS.USERS),
        storage.getItem(STORAGE_KEYS.AUDIT_LOGS),
        storage.getItem(STORAGE_KEYS.EVENTS),
        storage.getItem(STORAGE_KEYS.ANNOUNCEMENTS),
        storage.getItem(STORAGE_KEYS.CLUBS),
      ]);

      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {}
      }
      if (savedLoggedIn !== null) {
        this.isLoggedIn = savedLoggedIn === 'true';
      }
      if (savedUsers) {
        try {
          this.users = JSON.parse(savedUsers);
        } catch (e) {}
      }
      if (savedEvents) {
        try {
          this.events = JSON.parse(savedEvents);
        } catch (e) {}
      }
      if (savedAnns) {
        try {
          this.announcements = JSON.parse(savedAnns);
        } catch (e) {}
      }
      if (savedAudit) {
        try {
          this.auditLogs = JSON.parse(savedAudit);
        } catch (e) {}
      }
      if (savedAllClubs) {
        try {
          this.clubs = JSON.parse(savedAllClubs);
        } catch (e) {}
      }
      if (savedRegs !== null) {
        try {
          const parsed = JSON.parse(savedRegs);
          if (Array.isArray(parsed)) {
            this.registrations = parsed.map((r: EventRegistration) => ({
              ...r,
              event: this.events.find((e) => e.id === r.event_id) || r.event,
              user: this.currentUser.id === r.user_id ? this.currentUser : r.user,
            }));
          }
        } catch (e) {}
      } else {
        this.saveRegistrations();
      }

      if (savedClubs) {
        try {
          this.followedClubIds = new Set(JSON.parse(savedClubs));
        } catch (e) {}
      }
      if (savedPref) {
        try {
          this.feedPreference = JSON.parse(savedPref);
        } catch (e) {}
      }
      if (savedNotifs) {
        try {
          this.readNotificationIds = new Set(JSON.parse(savedNotifs));
        } catch (e) {}
      }
    } catch (e) {
      console.warn('MobileStore init error:', e);
    } finally {
      this.isInitialized = true;
      this.notify();
      this.syncFromServer();
      setInterval(() => {
        this.syncFromServer();
      }, 3000);
    }
  }

  async syncFromServer() {
    try {
      const baseUrl = getApiBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${baseUrl}/api/state`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        let changed = false;

        if (Array.isArray(data.events)) {
          if (JSON.stringify(this.events) !== JSON.stringify(data.events)) {
            this.events = data.events;
            this.saveEvents();
            changed = true;
          }
        }

        if (Array.isArray(data.profiles)) {
          if (JSON.stringify(this.users) !== JSON.stringify(data.profiles)) {
            this.users = data.profiles;
            this.saveUsers();
            const matchedCurrent = this.users.find((u) => u.id === this.currentUser.id);
            if (matchedCurrent) {
              this.currentUser = matchedCurrent;
            }
            changed = true;
          }
        }

        if (Array.isArray(data.announcements)) {
          if (JSON.stringify(this.announcements) !== JSON.stringify(data.announcements)) {
            this.announcements = data.announcements;
            this.saveAnnouncements();
            changed = true;
          }
        }

        if (Array.isArray(data.registrations)) {
          if (JSON.stringify(this.registrations) !== JSON.stringify(data.registrations)) {
            this.registrations = data.registrations.map((r: EventRegistration) => ({
              ...r,
              event: this.events.find((e) => e.id === r.event_id) || r.event,
              user: this.currentUser.id === r.user_id ? this.currentUser : r.user,
            }));
            this.saveRegistrations();
            changed = true;
          }
        }

        if (Array.isArray(data.clubs)) {
          if (JSON.stringify(this.clubs) !== JSON.stringify(data.clubs)) {
            this.clubs = data.clubs;
            this.saveClubs();
            changed = true;
          }
        }

        if (changed) {
          this.notify();
        }
      }
    } catch (e) {
      // offline fallback
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Listener error in MobileStore:', err);
      }
    });
  }

  saveRegistrations() {
    const serialized = JSON.stringify(this.registrations);
    storage.setItemSync(STORAGE_KEYS.REGISTRATIONS, serialized);
    storage.setItem(STORAGE_KEYS.REGISTRATIONS, serialized).catch(() => {});
  }

  saveUsers() {
    const serialized = JSON.stringify(this.users);
    storage.setItemSync(STORAGE_KEYS.USERS, serialized);
    storage.setItem(STORAGE_KEYS.USERS, serialized).catch(() => {});
  }

  saveEvents() {
    const serialized = JSON.stringify(this.events);
    storage.setItemSync(STORAGE_KEYS.EVENTS, serialized);
    storage.setItem(STORAGE_KEYS.EVENTS, serialized).catch(() => {});
  }

  saveAnnouncements() {
    const serialized = JSON.stringify(this.announcements);
    storage.setItemSync(STORAGE_KEYS.ANNOUNCEMENTS, serialized);
    storage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, serialized).catch(() => {});
  }

  saveClubs() {
    const serialized = JSON.stringify(this.clubs);
    storage.setItemSync(STORAGE_KEYS.CLUBS, serialized);
    storage.setItem(STORAGE_KEYS.CLUBS, serialized).catch(() => {});
  }

  saveAuditLogs() {
    const serialized = JSON.stringify(this.auditLogs);
    storage.setItemSync(STORAGE_KEYS.AUDIT_LOGS, serialized);
    storage.setItem(STORAGE_KEYS.AUDIT_LOGS, serialized).catch(() => {});
  }

  recordAudit(action: string, entity: string, actor: string, details: string) {
    const logItem = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      entity,
      actor,
      timestamp: new Date().toLocaleString(),
      details,
    };
    this.auditLogs.unshift(logItem);
    this.saveAuditLogs();
  }

  recordLogin(user: Profile, client: string = 'Mobile App') {
    this.recordAudit(
      'USER_LOGIN',
      user.full_name,
      `${user.full_name} (${user.roles?.join(', ') || 'student'})`,
      `Mobile session authenticated via ${client} • Email: ${user.college_email} • Reg No: ${user.registration_number}`
    );
  }

  async setCurrentUser(user: Profile) {
    this.currentUser = user;
    this.isLoggedIn = true;
    const serializedUser = JSON.stringify(user);
    storage.setItemSync(STORAGE_KEYS.CURRENT_USER, serializedUser);
    storage.setItemSync(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    this.recordLogin(user, 'Mobile App');
    await Promise.all([
      storage.setItem(STORAGE_KEYS.CURRENT_USER, serializedUser),
      storage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true'),
    ]);
    this.notify();
  }

  async registerStudent(data: {
    full_name: string;
    registration_number: string;
    college_email: string;
    mobile_number: string;
    current_year_of_study: number;
    section: string;
    programme_id?: string;
    department_id?: string;
  }): Promise<{ success: boolean; error?: string; user?: Profile }> {
    const email = data.college_email.trim().toLowerCase();
    const regNo = data.registration_number.trim().toUpperCase();

    // Check duplicate
    const existing = this.users.find(
      (u) => u.college_email.toLowerCase() === email || u.registration_number.toUpperCase() === regNo
    );

    if (existing) {
      return {
        success: false,
        error: 'An account with this email or registration number already exists. Please sign in.',
      };
    }

    const newProfile: Profile = {
      id: 'u-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      full_name: data.full_name.trim(),
      registration_number: regNo,
      mobile_number: data.mobile_number.trim(),
      college_email: email,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      department_id: data.department_id || MOBILE_DEPARTMENTS[0].id,
      programme_id: data.programme_id || MOBILE_PROGRAMMES[6].id,
      admission_year: new Date().getFullYear() - (data.current_year_of_study - 1),
      current_year_of_study: data.current_year_of_study,
      section: (data.section || 'A').toUpperCase(),
      verification_status: 'active',
      roles: ['student'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.users.unshift(newProfile);
    this.saveUsers();
    this.recordAudit(
      'USER_REGISTER',
      newProfile.full_name,
      newProfile.full_name,
      `New student registered: ${newProfile.full_name} (${newProfile.registration_number})`
    );

    // Push new student to the Next.js server API so the Admin's website sees the user immediately!
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      }).catch((e) => console.warn('Failed to sync registered student to server:', e));
    } catch (e) {}

    await this.setCurrentUser(newProfile);
    return { success: true, user: newProfile };
  }

  createEvent(eventData: Omit<EventItem, 'id' | 'current_registrations' | 'created_at' | 'updated_at'>): EventItem {
    const newEvent: EventItem = {
      ...eventData,
      id: 'e-' + Math.random().toString(36).substring(2, 9),
      current_registrations: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    this.saveEvents();
    this.notify();

    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      }).catch((e) => console.warn('Failed to sync new event to server:', e));
    } catch (e) {}

    return newEvent;
  }

  updateEventStatus(eventId: string, status: EventItem['status'], reason?: string): boolean {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return false;
    event.status = status;
    if (reason) (event as any).rejection_reason = reason;
    event.updated_at = new Date().toISOString();
    this.saveEvents();
    this.notify();

    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', id: eventId, status, rejection_reason: reason }),
      }).catch((e) => console.warn('Failed to sync event status to server:', e));
    } catch (e) {}

    return true;
  }

  async logout() {
    this.isLoggedIn = false;
    storage.setItemSync(STORAGE_KEYS.IS_LOGGED_IN, 'false');
    await storage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
    this.notify();
  }

  async setFeedMode(mode: FeedMode) {
    this.feedPreference.mode = mode;
    const prefJson = JSON.stringify(this.feedPreference);
    storage.setItemSync(STORAGE_KEYS.FEED_PREF, prefJson);
    await storage.setItem(STORAGE_KEYS.FEED_PREF, prefJson);
    this.notify();
  }

  async updateFeedPreferences(selectedCats: string[], mutedCats: string[]) {
    this.feedPreference.selected_categories = selectedCats;
    this.feedPreference.muted_categories = mutedCats;
    const prefJson = JSON.stringify(this.feedPreference);
    storage.setItemSync(STORAGE_KEYS.FEED_PREF, prefJson);
    await storage.setItem(STORAGE_KEYS.FEED_PREF, prefJson);
    this.notify();
  }

  async toggleFollowClub(clubId: string) {
    if (this.followedClubIds.has(clubId)) {
      this.followedClubIds.delete(clubId);
    } else {
      this.followedClubIds.add(clubId);
    }
    const clubsJson = JSON.stringify(Array.from(this.followedClubIds));
    storage.setItemSync(STORAGE_KEYS.FOLLOWED_CLUBS, clubsJson);
    await storage.setItem(STORAGE_KEYS.FOLLOWED_CLUBS, clubsJson);
    this.notify();
  }

  registerForEvent(eventId: string): { success: boolean; error?: string; registration?: EventRegistration } {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return { success: false, error: 'Event not found' };
    if (event.status !== 'published') return { success: false, error: 'Event is not open for registration' };
    if (new Date() > new Date(event.registration_deadline)) {
      return { success: false, error: 'Registration deadline has passed' };
    }

    const user = this.currentUser;
    const existing = this.registrations.find(
      (r) =>
        r.event_id === eventId &&
        (r.user_id === user.id ||
          r.user_id === user.registration_number ||
          r.user?.id === user.id ||
          r.user?.registration_number === user.registration_number) &&
        r.status === 'confirmed'
    );
    if (existing) {
      return { success: false, error: 'You are already registered for this event', registration: existing };
    }

    if (event.current_registrations >= event.max_participants) {
      return { success: false, error: 'Event capacity is full' };
    }

    const shortId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const reg: EventRegistration = {
      id: 'reg-' + Date.now() + '-' + shortId,
      event_id: eventId,
      user_id: user.id,
      qr_pass_code: `CC-PASS-${user.registration_number || 'STU'}-${shortId}`,
      status: 'confirmed',
      registered_at: new Date().toISOString(),
      event,
      user,
    };

    // Prepend new confirmed registration (replace any previous cancelled registration)
    this.registrations = [
      reg,
      ...this.registrations.filter(
        (r) =>
          !(
            r.event_id === eventId &&
            (r.user_id === user.id ||
              r.user_id === user.registration_number ||
              r.user?.id === user.id ||
              r.user?.registration_number === user.registration_number)
          )
      ),
    ];
    event.current_registrations += 1;

    // Persist immediately!
    this.saveRegistrations();
    this.recordAudit(
      'EVENT_REGISTRATION',
      event.title,
      `${user.full_name} (${user.registration_number})`,
      `Seat registered at ${event.venue}. Generated Pass: ${reg.qr_pass_code}`
    );
    this.notify();

    // Push registration to server
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reg),
      }).catch(() => {});
    } catch (e) {}

    return { success: true, registration: reg };
  }

  cancelRegistration(eventId: string): { success: boolean; error?: string } {
    const user = this.currentUser;
    const reg = this.registrations.find(
      (r) =>
        r.event_id === eventId &&
        (r.user_id === user.id ||
          r.user_id === user.registration_number ||
          r.user?.id === user.id ||
          r.user?.registration_number === user.registration_number) &&
        r.status === 'confirmed'
    );
    if (!reg) return { success: false, error: 'Registration not found' };

    reg.status = 'cancelled';
    reg.cancelled_at = new Date().toISOString();

    const event = this.events.find((e) => e.id === eventId);
    if (event && event.current_registrations > 0) {
      event.current_registrations -= 1;
    }

    // Persist cancellation immediately!
    this.saveRegistrations();
    this.recordAudit(
      'CANCEL_REGISTRATION',
      event?.title || 'Event',
      `${user.full_name} (${user.registration_number})`,
      `Seat reservation released for event ${eventId}.`
    );
    this.notify();

    // Sync cancellation to server
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', event_id: eventId, user_id: user.id }),
      }).catch(() => {});
    } catch (e) {}

    return { success: true };
  }

  markNotificationRead(id: string) {
    this.readNotificationIds.add(id);
    const notifsJson = JSON.stringify(Array.from(this.readNotificationIds));
    storage.setItemSync(STORAGE_KEYS.READ_NOTIFS, notifsJson);
    storage.setItem(STORAGE_KEYS.READ_NOTIFS, notifsJson);
    this.notify();
  }

  markAllNotificationsRead(ids: string[]) {
    ids.forEach((id) => this.readNotificationIds.add(id));
    const notifsJson = JSON.stringify(Array.from(this.readNotificationIds));
    storage.setItemSync(STORAGE_KEYS.READ_NOTIFS, notifsJson);
    storage.setItem(STORAGE_KEYS.READ_NOTIFS, notifsJson);
    this.notify();
  }

  getRankedEvents(): EventItem[] {
    const published = this.events.filter((e) => e.status === 'published');

    return published.filter((e) => {
      // Exclude muted categories
      if (this.feedPreference.muted_categories?.includes(e.category)) {
        return false;
      }
      // If student selected specific categories, only show those
      if (this.feedPreference.selected_categories && this.feedPreference.selected_categories.length > 0) {
        return this.feedPreference.selected_categories.includes(e.category);
      }
      return true;
    });
  }

  getFilteredAnnouncements(): Announcement[] {
    return this.announcements.filter((a) => isAnnouncementRelevantForStudent(a, this.currentUser));
  }
}

export const mobileStore = new MobileStore();
