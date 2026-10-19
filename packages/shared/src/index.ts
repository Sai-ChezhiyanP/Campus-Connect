import type {
  Announcement,
  EventItem,
  FeedMode,
  FeedPreference,
  Profile,
} from '@campus-connect/types';

// Proposed 18 B.Tech Programmes at SRMIST Ramapuram
export const INITIAL_BTECH_PROGRAMMES = [
  { code: 'BTECH-AI', name: 'Artificial Intelligence', deptCode: 'CSE' },
  { code: 'BTECH-BME', name: 'Biomedical Engineering', deptCode: 'BIO' },
  { code: 'BTECH-BT', name: 'Biotechnology', deptCode: 'BIO' },
  { code: 'BTECH-CIVIL', name: 'Civil Engineering', deptCode: 'CIVIL' },
  { code: 'BTECH-CSBS', name: 'Computer Science and Business Systems', deptCode: 'CSE' },
  { code: 'BTECH-CSE', name: 'Computer Science and Engineering', deptCode: 'CSE' },
  { code: 'BTECH-CSE-AIML', name: 'CSE — Artificial Intelligence and Machine Learning', deptCode: 'CSE' },
  { code: 'BTECH-CSE-BDA', name: 'CSE — Big Data Analytics', deptCode: 'CSE' },
  { code: 'BTECH-CSE-CC', name: 'CSE — Cloud Computing', deptCode: 'CSE' },
  { code: 'BTECH-CSE-CS', name: 'CSE — Cyber Security', deptCode: 'CSE' },
  { code: 'BTECH-CSE-DS', name: 'CSE — Data Science', deptCode: 'CSE' },
  { code: 'BTECH-CSE-GT', name: 'CSE — Gaming Technology', deptCode: 'CSE' },
  { code: 'BTECH-CSE-IOT', name: 'CSE — Internet of Things', deptCode: 'CSE' },
  { code: 'BTECH-EEE', name: 'Electrical and Electronics Engineering', deptCode: 'EEE' },
  { code: 'BTECH-ECE', name: 'Electronics and Communication Engineering', deptCode: 'ECE' },
  { code: 'BTECH-ECE-DS', name: 'ECE — Data Science', deptCode: 'ECE' },
  { code: 'BTECH-IT', name: 'Information Technology', deptCode: 'IT' },
  { code: 'BTECH-MECH', name: 'Mechanical Engineering', deptCode: 'MECH' },
] as const;

export const INITIAL_DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science and Engineering' },
  { code: 'IT', name: 'Information Technology' },
  { code: 'ECE', name: 'Electronics and Communication Engineering' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering' },
  { code: 'BIO', name: 'Biotechnology & Biomedical Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering' },
  { code: 'MECH', name: 'Mechanical Engineering' },
] as const;

export const EVENT_CATEGORIES = [
  'Hackathon',
  'Workshop',
  'Symposium',
  'Webinar',
  'Cultural',
  'Sports',
  'Orientation',
  'Technical',
] as const;

export const ANNOUNCEMENT_CATEGORIES = [
  'Academic',
  'Urgent',
  'Examination',
  'Placement',
  'Club',
  'General',
] as const;

/**
 * Smart Feed Scoring Engine
 * Rule-based ranking calculation based on student profile, followed clubs, and preferences.
 */
export function calculateEventAffinityScore(
  event: EventItem,
  profile: Profile,
  prefs: FeedPreference,
  followedClubIds: Set<string>
): number {
  let score = 0;

  // 1. Check if category is explicitly muted in Custom/Hybrid mode
  if (prefs.muted_categories?.includes(event.category)) {
    if (prefs.mode === 'custom' || prefs.mode === 'hybrid') {
      return -1000; // Deprioritize or hide
    }
  }

  // 2. Followed club bonus (+50 points)
  if (event.club_id && followedClubIds.has(event.club_id)) {
    score += 50;
  }

  // 3. User's explicitly selected category in Custom/Hybrid mode (+40 points)
  if (prefs.selected_categories?.includes(event.category)) {
    score += 40;
  }

  // 4. Same department bonus (+30 points)
  if (event.department_id && profile.department_id && event.department_id === profile.department_id) {
    score += 30;
  }

  // 5. Academic Year eligibility match (+20 points)
  if (
    event.eligibility_criteria?.allowed_years &&
    event.eligibility_criteria.allowed_years.includes(profile.current_year_of_study)
  ) {
    score += 20;
  }

  // 6. Urgency scoring (approaching deadline within 48 hours gets +25 points)
  const deadline = new Date(event.registration_deadline).getTime();
  const now = Date.now();
  const diffHours = (deadline - now) / (1000 * 60 * 60);
  if (diffHours > 0 && diffHours <= 48) {
    score += 25;
  }

  return score;
}

/**
 * Announcement relevance filter and priority check
 */
export function isAnnouncementRelevantForStudent(
  announcement: Announcement,
  profile: Profile
): boolean {
  // Mandatory notices ALWAYS pass through regardless of filters
  if (announcement.is_mandatory || announcement.priority === 'urgent') {
    return true;
  }

  // Campus-wide
  if (announcement.target_scope === 'campus') {
    return true;
  }

  // Department check
  if (
    announcement.target_scope === 'department' &&
    announcement.target_department_id === profile.department_id
  ) {
    return true;
  }

  // Programme check
  if (
    announcement.target_scope === 'programme' &&
    announcement.target_programme_id === profile.programme_id
  ) {
    return true;
  }

  // Batch check
  if (
    announcement.target_scope === 'batch' &&
    announcement.target_admission_year === profile.admission_year
  ) {
    return true;
  }

  // Section check
  if (
    announcement.target_scope === 'section' &&
    announcement.target_section?.toUpperCase() === profile.section.toUpperCase()
  ) {
    return true;
  }

  return false;
}

/**
 * Universal RFC 5545 iCalendar (.ics) String Generator
 */
export function generateIcsCalendar(event: EventItem): string {
  const formatDateToICS = (isoString: string): string => {
    const d = new Date(isoString);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = formatDateToICS(event.start_date);
  const end = formatDateToICS(event.end_date);
  const stamp = formatDateToICS(new Date().toISOString());

  const cleanDescription = (event.description || '')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const cleanSummary = (event.title || '').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const cleanVenue = (event.venue || '').replace(/,/g, '\\,').replace(/;/g, '\\;');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Connect//SRMIST Ramapuram//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@campusconnect.srmist`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanVenue}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Builds Google Calendar web intent URL
 */
export function buildGoogleCalendarUrl(event: EventItem): string {
  const formatUtc = (iso: string) =>
    new Date(iso).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const start = formatUtc(event.start_date);
  const end = formatUtc(event.end_date);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: `${event.description}\n\nOrganized via Campus Connect (SRMIST Ramapuram)`,
    location: event.venue,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
