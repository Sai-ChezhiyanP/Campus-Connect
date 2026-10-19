import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_BTECH_PROGRAMMES,
  calculateEventAffinityScore,
  isAnnouncementRelevantForStudent,
  generateIcsCalendar,
  buildGoogleCalendarUrl,
} from '../packages/shared/src/index.ts';

test('18 SRM Ramapuram B.Tech specializations are initialized', () => {
  assert.equal(INITIAL_BTECH_PROGRAMMES.length, 18);
  const names = INITIAL_BTECH_PROGRAMMES.map((p) => p.name);
  assert.equal(names.includes('Artificial Intelligence'), true);
  assert.equal(names.includes('Biomedical Engineering'), true);
  assert.equal(names.includes('Biotechnology'), true);
  assert.equal(names.includes('Civil Engineering'), true);
  assert.equal(names.includes('Computer Science and Business Systems'), true);
  assert.equal(names.includes('Computer Science and Engineering'), true);
  assert.equal(names.includes('CSE — Artificial Intelligence and Machine Learning'), true);
  assert.equal(names.includes('CSE — Big Data Analytics'), true);
  assert.equal(names.includes('CSE — Cloud Computing'), true);
  assert.equal(names.includes('CSE — Cyber Security'), true);
  assert.equal(names.includes('CSE — Data Science'), true);
  assert.equal(names.includes('CSE — Gaming Technology'), true);
  assert.equal(names.includes('CSE — Internet of Things'), true);
  assert.equal(names.includes('Electrical and Electronics Engineering'), true);
  assert.equal(names.includes('Electronics and Communication Engineering'), true);
  assert.equal(names.includes('ECE — Data Science'), true);
  assert.equal(names.includes('Information Technology'), true);
  assert.equal(names.includes('Mechanical Engineering'), true);
});

test('Smart Feed scoring engine scores events according to user affinity and followed clubs', () => {
  const profile = {
    id: 'student-1',
    full_name: 'Test Student',
    registration_number: 'RA2411003010001',
    college_email: 'student@srmist.edu.in',
    mobile_number: '+919876543210',
    department_id: 'dept-cse',
    programme_id: 'prog-cse-aiml',
    admission_year: 2024,
    current_year_of_study: 2,
    section: 'A',
    verification_status: 'active',
    roles: ['student'],
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  };

  const followedClubs = new Set(['club-devs']);

  const event1 = {
    id: 'evt-1',
    title: 'Code Jam 2026',
    description: 'Hackathon description',
    category: 'Hackathon',
    club_id: 'club-devs',
    department_id: 'dept-cse',
    venue: 'TP Auditorium',
    start_date: '2026-11-20T10:00:00Z',
    end_date: '2026-11-20T18:00:00Z',
    registration_deadline: '2026-11-19T23:59:59Z',
    max_participants: 50,
    current_registrations_count: 10,
    eligibility_criteria: { allowed_years: [1, 2, 3, 4] },
    contact_info: { name: 'Lead', phone: '+919876543210', email: 'lead@srmist.edu.in' },
    status: 'published',
    approval_status: 'approved',
    created_by: 'user-coord',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  };

  const prefs = {
    id: 'pref-1',
    user_id: 'student-1',
    mode: 'hybrid',
    selected_categories: ['Hackathon'],
    muted_categories: ['Cultural'],
    followed_clubs: ['club-devs'],
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  };

  const score = calculateEventAffinityScore(event1, profile, prefs, followedClubs);
  // Club match (+50) + Selected category (+40) + Dept match (+30) + Year match (+20) = 140
  assert.equal(score >= 140, true);

  // Muted category should receive negative score in hybrid mode
  const mutedEvent = { ...event1, category: 'Cultural' };
  const mutedScore = calculateEventAffinityScore(mutedEvent, profile, prefs, followedClubs);
  assert.equal(mutedScore, -1000);
});

test('Mandatory and urgent notices cannot be suppressed', () => {
  const profile = {
    id: 'student-1',
    department_id: 'dept-cse',
    programme_id: 'prog-cse',
    admission_year: 2024,
    current_year_of_study: 2,
    section: 'A',
  };

  const mandatoryNotice = {
    id: 'ann-1',
    title: 'Mandatory Fire Drill',
    content: 'All campus members must assemble at Ground at 11 AM.',
    category: 'Urgent',
    priority: 'urgent',
    is_mandatory: true,
    target_scope: 'department',
    target_department_id: 'dept-mech', // different department
  };

  // Even though department is different, mandatory/urgent flag forces delivery
  assert.equal(isAnnouncementRelevantForStudent(mandatoryNotice, profile), true);
});

test('Universal RFC 5545 iCalendar generation produces valid VCALENDAR payload', () => {
  const event = {
    id: 'test-event-123',
    title: 'Tech Symposium',
    description: 'Annual technical symposium',
    venue: 'Auditorium 1',
    start_date: '2026-11-10T09:00:00Z',
    end_date: '2026-11-10T17:00:00Z',
  };

  const ics = generateIcsCalendar(event);
  assert.equal(ics.includes('BEGIN:VCALENDAR'), true);
  assert.equal(ics.includes('VERSION:2.0'), true);
  assert.equal(ics.includes('BEGIN:VEVENT'), true);
  assert.equal(ics.includes('SUMMARY:Tech Symposium'), true);
  assert.equal(ics.includes('LOCATION:Auditorium 1'), true);
  assert.equal(ics.includes('END:VCALENDAR'), true);
});

test('Google Calendar URL builder generates proper URL', () => {
  const event = {
    id: 'test-event-456',
    title: 'SRM Hackathon',
    description: 'Hackathon description',
    venue: 'Tech Park',
    start_date: '2026-11-10T09:00:00Z',
    end_date: '2026-11-10T17:00:00Z',
  };

  const url = buildGoogleCalendarUrl(event);
  assert.equal(url.startsWith('https://calendar.google.com/calendar/render?'), true);
  assert.equal(url.includes('action=TEMPLATE'), true);
  assert.equal(url.includes('SRM+Hackathon') || url.includes('SRM%20Hackathon'), true);
});
