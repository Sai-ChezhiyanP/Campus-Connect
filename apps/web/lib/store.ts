import {
  Announcement,
  AppRole,
  Club,
  Department,
  EventItem,
  EventRegistration,
  Profile,
  Programme,
} from '@campus-connect/types';
import { INITIAL_BTECH_PROGRAMMES, INITIAL_DEPARTMENTS } from '@campus-connect/shared';

// Pre-seeded Departments
export const SEED_DEPARTMENTS: Department[] = INITIAL_DEPARTMENTS.map((d, index) => ({
  id: `d1000000-0000-0000-0000-00000000000${index + 1}`,
  code: d.code,
  name: d.name,
  created_at: new Date().toISOString(),
}));

// Pre-seeded Programmes
export const SEED_PROGRAMMES: Programme[] = INITIAL_BTECH_PROGRAMMES.map((p, index) => {
  const dept = SEED_DEPARTMENTS.find((d) => d.code === p.deptCode) || SEED_DEPARTMENTS[0];
  const hex = (index + 1).toString(16).padStart(12, '0');
  return {
    id: `p1000000-0000-0000-0000-${hex}`,
    department_id: dept.id,
    code: p.code,
    name: p.name,
    degree: 'B.Tech',
    is_active: true,
  };
});

// Pre-seeded Clubs
export const SEED_CLUBS: Club[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Computing & Coding Club (C3)',
    category: 'Technical',
    description: 'Official computer science and programming community organizing hackathons, open source initiatives, and tech talks.',
    logo_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300',
    contact_email: 'c3club@srmist.edu.in',
    coordinator_ids: ['u1000000-0000-0000-0000-000000000002'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    name: 'Robotics and Automation Society',
    category: 'Technical',
    description: 'Designing autonomous rovers, competitive combat bots, and IoT hardware projects for national competitions.',
    logo_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300',
    contact_email: 'robotics@srmist.edu.in',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    name: 'SRM Ramapuram Literary & Debating Society',
    category: 'Cultural',
    description: 'Fostering public speaking, parliamentary debates, creative writing, and model United Nations.',
    logo_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300',
    contact_email: 'litdeb@srmist.edu.in',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    name: 'Google Developer Student Club (GDSC)',
    category: 'Technical',
    description: 'Peer-to-peer learning environment for students interested in Google developer technologies, mobile dev, and cloud.',
    logo_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300',
    contact_email: 'gdsc@srmist.edu.in',
    created_at: new Date().toISOString(),
  },
];

// Pre-seeded Synthetic Profiles (Completely synthetic, strictly complying with testing rules)
export const SEED_PROFILES: Profile[] = [
  {
    id: 'u1000000-0000-0000-0000-000000000001',
    full_name: 'Aarav Sharma (Test Student)',
    registration_number: 'RA2411003010001',
    mobile_number: '+919876543210',
    college_email: 'student.test@srmist.edu.in',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    department_id: SEED_DEPARTMENTS[0].id,
    programme_id: SEED_PROGRAMMES[6].id, // CSE - AIML
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
    department_id: SEED_DEPARTMENTS[0].id,
    programme_id: SEED_PROGRAMMES[5].id, // CSE
    admission_year: 2023,
    current_year_of_study: 2,
    section: 'B',
    verification_status: 'active',
    roles: ['student', 'coordinator'],
    assigned_club_id: 'c1000000-0000-0000-0000-000000000001',
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
    department_id: SEED_DEPARTMENTS[0].id,
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

// Pre-seeded Events - Initialized empty as requested
export const SEED_EVENTS: EventItem[] = [];

// Pre-seeded Announcements
export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    title: 'MANDATORY: Odd Semester End-Term Examination Schedule Released',
    content: 'All B.Tech students across all departments are hereby notified that the final timetable for the upcoming semester examinations has been published. Hall tickets will be issued through the academic ERP portal starting Friday. Attendance minimum of 75% is strictly enforced.',
    category: 'Examination',
    priority: 'urgent',
    is_mandatory: true,
    target_scope: 'campus',
    author_id: SEED_PROFILES[3].id,
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    author_profile: SEED_PROFILES[3],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    title: 'CSE Department: Capstone Project Phase-1 Evaluation Schedule',
    content: 'All final year B.Tech CSE (all specializations) students must submit their Phase-1 GitHub repository link and preliminary documentation by 5:00 PM this Friday. Panel presentations commence next Monday in Lab 402.',
    category: 'Academic',
    priority: 'high',
    is_mandatory: false,
    target_scope: 'department',
    target_department_id: SEED_DEPARTMENTS[0].id,
    author_id: SEED_PROFILES[2].id,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    author_profile: SEED_PROFILES[2],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    title: 'Google Cloud Study Jams: Registrations Open for 2024 Batch',
    content: 'GDSC SRMIST Ramapuram invites 1st and 2nd year students to participate in the Google Cloud Study Jams. Complete 5 quest badges to receive official Google Developer swag and certificates.',
    category: 'Opportunities',
    priority: 'medium',
    is_mandatory: false,
    target_scope: 'campus',
    author_id: SEED_PROFILES[1].id,
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    author_profile: SEED_PROFILES[1],
  },
];

// Pre-seeded registration - Empty as requested
export const SEED_REGISTRATIONS: EventRegistration[] = [];

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  actor: string;
  timestamp: string;
  details: string;
}

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-seed-1',
    action: 'SYSTEM_INIT',
    entity: 'Campus Connect Platform',
    actor: 'System Core Engine',
    timestamp: new Date().toLocaleString(),
    details: 'Database initialized. Institutional security and session tracking active.',
  },
];

const WEB_STORAGE_KEYS = {
  CURRENT_USER: 'cc_web_current_user_v3',
  IS_LOGGED_IN: 'cc_web_is_logged_in_v3',
  REGISTRATIONS: 'cc_web_registrations_v3',
  EVENTS: 'cc_web_events_v3',
  ANNOUNCEMENTS: 'cc_web_announcements_v3',
  PROFILES: 'cc_web_profiles_v3',
  AUDIT_LOGS: 'cc_web_audit_logs_v3',
  CLUBS: 'cc_web_clubs_v4',
};

class CampusConnectStore {
  profiles: Profile[] = [...SEED_PROFILES];
  departments: Department[] = [...SEED_DEPARTMENTS];
  programmes: Programme[] = [...SEED_PROGRAMMES];
  clubs: Club[] = [...SEED_CLUBS];
  events: EventItem[] = [...SEED_EVENTS];
  announcements: Announcement[] = [...SEED_ANNOUNCEMENTS];
  registrations: EventRegistration[] = [...SEED_REGISTRATIONS];
  auditLogs: AuditLogItem[] = [...INITIAL_AUDIT_LOGS];
  currentUser: Profile = SEED_PROFILES[3]; // Default to Admin for management portal
  isLoggedIn: boolean = true;
  listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      this.syncFromServer();
      setInterval(() => {
        this.syncFromServer();
      }, 2500);
      window.addEventListener('focus', () => {
        this.syncFromServer();
      });
    }
  }

  async syncFromServer() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        let changed = false;

        if (Array.isArray(data.events)) {
          if (JSON.stringify(this.events) !== JSON.stringify(data.events)) {
            this.events = data.events;
            changed = true;
          }
        }
        if (Array.isArray(data.clubs)) {
          if (JSON.stringify(this.clubs) !== JSON.stringify(data.clubs)) {
            this.clubs = data.clubs;
            changed = true;
          }
        }
        if (Array.isArray(data.profiles)) {
          if (JSON.stringify(this.profiles) !== JSON.stringify(data.profiles)) {
            this.profiles = data.profiles;
            const updatedCur = this.profiles.find((p) => p.id === this.currentUser.id);
            if (updatedCur) {
              this.currentUser = updatedCur;
            }
            changed = true;
          }
        }
        if (Array.isArray(data.announcements)) {
          if (JSON.stringify(this.announcements) !== JSON.stringify(data.announcements)) {
            this.announcements = data.announcements;
            changed = true;
          }
        }
        if (Array.isArray(data.registrations)) {
          if (JSON.stringify(this.registrations) !== JSON.stringify(data.registrations)) {
            this.registrations = data.registrations;
            changed = true;
          }
        }

        if (changed) {
          this.saveToStorage();
          this.notifyListenersOnly();
        }
      }
    } catch (e) {
      // offline or server restarting
    }
  }

  notifyListenersOnly() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Listener error in WebStore:', err);
      }
    });
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const savedUser = localStorage.getItem(WEB_STORAGE_KEYS.CURRENT_USER);
      const savedLoggedIn = localStorage.getItem(WEB_STORAGE_KEYS.IS_LOGGED_IN);
      const savedRegs = localStorage.getItem(WEB_STORAGE_KEYS.REGISTRATIONS);
      const savedEvents = localStorage.getItem(WEB_STORAGE_KEYS.EVENTS);
      const savedAnns = localStorage.getItem(WEB_STORAGE_KEYS.ANNOUNCEMENTS);
      const savedProfiles = localStorage.getItem(WEB_STORAGE_KEYS.PROFILES);
      const savedAudit = localStorage.getItem(WEB_STORAGE_KEYS.AUDIT_LOGS);
      const savedClubs = localStorage.getItem(WEB_STORAGE_KEYS.CLUBS);

      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
      if (savedLoggedIn !== null) {
        this.isLoggedIn = savedLoggedIn === 'true';
      }
      if (savedRegs) {
        this.registrations = JSON.parse(savedRegs);
      }
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      }
      if (savedAnns) {
        this.announcements = JSON.parse(savedAnns);
      }
      if (savedProfiles) {
        this.profiles = JSON.parse(savedProfiles);
      }
      if (savedAudit) {
        this.auditLogs = JSON.parse(savedAudit);
      }
      if (savedClubs) {
        this.clubs = JSON.parse(savedClubs);
      }
    } catch (e) {
      console.warn('Error loading web store from localStorage:', e);
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(WEB_STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      localStorage.setItem(WEB_STORAGE_KEYS.IS_LOGGED_IN, this.isLoggedIn ? 'true' : 'false');
      localStorage.setItem(WEB_STORAGE_KEYS.REGISTRATIONS, JSON.stringify(this.registrations));
      localStorage.setItem(WEB_STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
      localStorage.setItem(WEB_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(this.announcements));
      localStorage.setItem(WEB_STORAGE_KEYS.PROFILES, JSON.stringify(this.profiles));
      localStorage.setItem(WEB_STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(WEB_STORAGE_KEYS.CLUBS, JSON.stringify(this.clubs));
    } catch (e) {
      console.warn('Error saving web store to localStorage:', e);
    }
  }

  recordAudit(action: string, entity: string, actor: string, details: string) {
    const logItem: AuditLogItem = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      entity,
      actor,
      timestamp: new Date().toLocaleString(),
      details,
    };
    this.auditLogs.unshift(logItem);
    this.notify();
  }

  recordLogin(user: Profile, client: string = 'Web Portal') {
    this.recordAudit(
      'USER_LOGIN',
      user.full_name,
      `${user.full_name} (${user.roles?.join(', ') || 'student'})`,
      `Verified session established via ${client} • Email: ${user.college_email} • Reg No: ${user.registration_number}`
    );
  }

  updateUserRoles(userId: string, newRoles: AppRole[], actor: string = 'Campus Administrator') {
    const user = this.profiles.find((p) => p.id === userId);
    if (!user) return false;

    const previousRoles = user.roles ? [...user.roles] : [];
    user.roles = newRoles.length > 0 ? newRoles : ['student'];
    user.updated_at = new Date().toISOString();

    this.recordAudit(
      'ROLE_ASSIGNMENT',
      user.full_name,
      actor,
      `Privileges updated for ${user.full_name} (${user.registration_number}). Changed from [${previousRoles.join(', ')}] to [${user.roles.join(', ')}]`
    );

    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      }).catch(() => {});
    }

    return true;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Listener error in WebStore:', err);
      }
    });
  }

  /**
   * Unified single login for all roles with intelligent destination routing
   */
  login(emailOrId: string, password?: string): { success: boolean; error?: string; redirectTo: string; user: Profile } {
    const query = emailOrId.trim().toLowerCase();

    // Check Administrator credentials
    if (query === 'admin' || query === 'admin.test@srmist.edu.in' || query === 'emp00001') {
      const adminUser = this.profiles[3];
      this.currentUser = adminUser;
      this.isLoggedIn = true;
      this.recordLogin(adminUser, 'Web Management Portal');
      this.notify();
      return {
        success: true,
        redirectTo: '/dashboard/approvals', // Admins go to approval queue & command center
        user: adminUser,
      };
    }

    // Check Faculty credentials
    if (query === 'faculty' || query === 'faculty.test@srmist.edu.in' || query === 'emp00412') {
      const facultyUser = this.profiles[2];
      this.currentUser = facultyUser;
      this.isLoggedIn = true;
      this.recordLogin(facultyUser, 'Web Management Portal');
      this.notify();
      return {
        success: true,
        redirectTo: '/dashboard/announcements', // Faculty goes to Bulletin Hub
        user: facultyUser,
      };
    }

    // Check Coordinator credentials
    if (query === 'coordinator' || query === 'coordinator.test@srmist.edu.in' || query === 'ra2411003010002') {
      const coordUser = this.profiles[1];
      this.currentUser = coordUser;
      this.isLoggedIn = true;
      this.recordLogin(coordUser, 'Web Management Portal');
      this.notify();
      return {
        success: true,
        redirectTo: '/dashboard/events', // Coordinators go to Events Directory / Submissions
        user: coordUser,
      };
    }

    // Check Student credentials
    if (query === 'student' || query === 'student.test@srmist.edu.in' || query === 'ra2411003010001') {
      const studentUser = this.profiles[0];
      this.currentUser = studentUser;
      this.isLoggedIn = true;
      this.recordLogin(studentUser, 'Web Management Portal');
      this.notify();
      return {
        success: true,
        redirectTo: '/dashboard', // Students view general overview
        user: studentUser,
      };
    }

    // Check any existing profile by email or registration number
    const matched = this.profiles.find(
      (p) =>
        p.college_email.toLowerCase() === query ||
        p.registration_number.toLowerCase() === query
    );

    if (matched) {
      this.currentUser = matched;
      this.isLoggedIn = true;
      this.recordLogin(matched, 'Web Management Portal');
      this.notify();

      let redirectTo = '/dashboard';
      if (matched.roles?.includes('admin')) redirectTo = '/dashboard/approvals';
      else if (matched.roles?.includes('faculty')) redirectTo = '/dashboard/announcements';
      else if (matched.roles?.includes('coordinator')) redirectTo = '/dashboard/events';

      return {
        success: true,
        redirectTo,
        user: matched,
      };
    }

    return {
      success: false,
      error: 'Invalid SRM institutional credentials. Use a demo account or verified @srmist.edu.in ID.',
      redirectTo: '/login',
      user: this.currentUser,
    };
  }

  logout() {
    this.isLoggedIn = false;
    this.notify();
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(WEB_STORAGE_KEYS.IS_LOGGED_IN);
      if (saved !== null) return saved === 'true';
    }
    return this.isLoggedIn;
  }

  getCurrentRole(): AppRole {
    if (this.currentUser.roles?.includes('admin')) return 'admin';
    if (this.currentUser.roles?.includes('faculty')) return 'faculty';
    if (this.currentUser.roles?.includes('coordinator')) return 'coordinator';
    return 'student';
  }

  setCurrentUser(roleOrEmail: string) {
    const found = this.profiles.find(
      (p) => p.college_email === roleOrEmail || p.roles?.includes(roleOrEmail as AppRole)
    );
    if (found) {
      this.currentUser = found;
      this.isLoggedIn = true;
      this.notify();
    }
  }

  registerForEvent(eventId: string, userId: string): { success: boolean; error?: string; registration?: EventRegistration } {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return { success: false, error: 'Event not found' };
    if (event.status !== 'published') return { success: false, error: 'Event is not open for registration' };
    if (new Date() > new Date(event.registration_deadline)) return { success: false, error: 'Registration deadline has passed' };

    const existing = this.registrations.find((r) => r.event_id === eventId && r.user_id === userId && r.status === 'confirmed');
    if (existing) return { success: false, error: 'You are already registered for this event', registration: existing };

    if (event.current_registrations >= event.max_participants) {
      return { success: false, error: 'Event capacity is full' };
    }

    const reg: EventRegistration = {
      id: 'reg-' + Math.random().toString(36).substring(2, 9),
      event_id: eventId,
      user_id: userId,
      qr_pass_code: 'CC-PASS-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      status: 'confirmed',
      registered_at: new Date().toISOString(),
      event,
      user: this.profiles.find((p) => p.id === userId),
    };

    this.registrations.unshift(reg);
    event.current_registrations += 1;
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reg),
      }).catch(() => {});
    }

    return { success: true, registration: reg };
  }

  cancelRegistration(eventId: string, userId: string): { success: boolean; error?: string } {
    const reg = this.registrations.find((r) => r.event_id === eventId && r.user_id === userId && r.status === 'confirmed');
    if (!reg) return { success: false, error: 'Active registration not found' };

    reg.status = 'cancelled';
    reg.cancelled_at = new Date().toISOString();

    const event = this.events.find((e) => e.id === eventId);
    if (event && event.current_registrations > 0) {
      event.current_registrations -= 1;
    }
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', event_id: eventId, user_id: userId }),
      }).catch(() => {});
    }

    return { success: true };
  }

  createEvent(eventData: Omit<EventItem, 'id' | 'current_registrations' | 'created_at' | 'updated_at'>): EventItem {
    const isAdmin = this.currentUser.roles?.includes('admin');
    const isCoordinator = this.currentUser.roles?.includes('coordinator');

    if (!isAdmin && isCoordinator) {
      if (!this.currentUser.assigned_club_id) {
        throw new Error('Unauthorized: You must be assigned to an official club to submit events.');
      }
      if (eventData.organizing_type !== 'club' || eventData.club_id !== this.currentUser.assigned_club_id) {
        throw new Error('Unauthorized: Coordinators can only create events for their assigned club.');
      }
    }

    if (!eventData.poster_url || !eventData.poster_url.trim()) {
      throw new Error('An event poster is mandatory for all campus events.');
    }

    const newEvent: EventItem = {
      ...eventData,
      id: 'e-' + Math.random().toString(36).substring(2, 9),
      current_registrations: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      }).catch(() => {});
    }

    return newEvent;
  }

  updateEventStatus(eventId: string, status: EventItem['status'], reason?: string): boolean {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return false;
    event.status = status;
    if (reason) event.rejection_reason = reason;
    event.updated_at = new Date().toISOString();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', id: eventId, status, rejection_reason: reason }),
      }).catch(() => {});
    }

    return true;
  }

  createAnnouncement(announcementData: Omit<Announcement, 'id' | 'created_at'>): Announcement {
    const isAdmin = this.currentUser.roles?.includes('admin');
    const isFaculty = this.currentUser.roles?.includes('faculty');

    if (!isAdmin && !isFaculty) {
      throw new Error('Unauthorized: The Faculty Bulletin Hub is restricted to faculty members and administrators.');
    }

    const newAnn: Announcement = {
      ...announcementData,
      id: 'a-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      author_profile: this.profiles.find((p) => p.id === announcementData.author_id),
    };
    this.announcements.unshift(newAnn);
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnn),
      }).catch(() => {});
    }

    return newAnn;
  }

  createClub(clubData: Omit<Club, 'id' | 'created_at'>): Club {
    const newClub: Club = {
      ...clubData,
      id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };
    this.clubs.unshift(newClub);
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClub),
      }).catch(() => {});
    }

    return newClub;
  }

  updateClub(clubId: string, updates: Partial<Club>): Club | null {
    const club = this.clubs.find((c) => c.id === clubId);
    if (!club) return null;

    Object.assign(club, updates);
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(club),
      }).catch(() => {});
    }

    return club;
  }

  deleteClub(clubId: string): boolean {
    const index = this.clubs.findIndex((c) => c.id === clubId);
    if (index === -1) return false;

    this.clubs.splice(index, 1);
    this.profiles.forEach((p) => {
      if (p.assigned_club_id === clubId) {
        p.assigned_club_id = null;
      }
    });

    this.notify();

    if (typeof window !== 'undefined') {
      fetch(`/api/clubs?id=${encodeURIComponent(clubId)}`, {
        method: 'DELETE',
      }).catch(() => {});
    }

    return true;
  }

  assignCoordinatorToClub(userId: string, clubId: string | null): boolean {
    const user = this.profiles.find((p) => p.id === userId);
    if (!user) return false;

    user.assigned_club_id = clubId;
    user.updated_at = new Date().toISOString();

    if (this.currentUser.id === userId) {
      this.currentUser.assigned_club_id = clubId;
    }

    // Ensure coordinator_ids on club are updated
    this.clubs.forEach((c) => {
      if (!c.coordinator_ids) c.coordinator_ids = [];
      if (c.id === clubId) {
        if (!c.coordinator_ids.includes(userId)) {
          c.coordinator_ids.push(userId);
        }
      } else {
        c.coordinator_ids = c.coordinator_ids.filter((id) => id !== userId);
      }
    });

    this.recordAudit(
      'COORDINATOR_ASSIGNMENT',
      user.full_name,
      this.currentUser.full_name,
      `Assigned coordinator ${user.full_name} to ${clubId ? (this.clubs.find((c) => c.id === clubId)?.name || 'Club') : 'No Club'}`
    );

    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      }).catch(() => {});

      if (clubId) {
        const targetClub = this.clubs.find((c) => c.id === clubId);
        if (targetClub) {
          fetch('/api/clubs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(targetClub),
          }).catch(() => {});
        }
      }
    }

    return true;
  }

  updateEvent(eventId: string, updates: Partial<EventItem>): EventItem | null {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return null;

    // Check coordinator permission: can only edit events of their assigned club
    const isAdmin = this.currentUser.roles?.includes('admin');
    const isCoordinator = this.currentUser.roles?.includes('coordinator');

    if (!isAdmin && isCoordinator) {
      if (!this.currentUser.assigned_club_id || event.club_id !== this.currentUser.assigned_club_id) {
        throw new Error('Unauthorized: You can only edit events belonging to your assigned club.');
      }
    }

    Object.assign(event, updates, {
      updated_at: new Date().toISOString(),
    });

    this.recordAudit(
      'EVENT_EDIT',
      event.title,
      this.currentUser.full_name,
      `Event details updated: ${event.title}`
    );

    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_event',
          id: eventId,
          updates,
          actor: this.currentUser.full_name,
        }),
      }).catch(() => {});
    }

    return event;
  }
}

// Global Singleton Instance
export const store = new CampusConnectStore();
