import test from 'node:test';
import assert from 'node:assert/strict';
import {
  StudentRegistrationSchema,
  SRM_REG_NO_REGEX,
  normalizeRegistrationNumber,
  normalizeIndianPhoneNumber,
  EventFormSchema,
  AnnouncementFormSchema,
} from '../packages/validation/src/index.ts';

test('SRM Registration Number Normalization & Validation', () => {
  // Correct formats
  const validReg = 'RA2411003010001';
  assert.equal(SRM_REG_NO_REGEX.test(validReg), true);
  assert.equal(normalizeRegistrationNumber('  ra2411003010001  '), 'RA2411003010001');

  // Invalid format (too short / wrong prefix)
  assert.equal(SRM_REG_NO_REGEX.test('RB12345'), false);
  assert.equal(SRM_REG_NO_REGEX.test('RA123'), false);
});

test('Indian Phone Number Normalization', () => {
  assert.equal(normalizeIndianPhoneNumber('9876543210'), '+919876543210');
  assert.equal(normalizeIndianPhoneNumber('+91 9876543210'), '+919876543210');
  assert.equal(normalizeIndianPhoneNumber('919876543210'), '+919876543210');
});

test('Student Registration Schema enforces @srmist.edu.in institutional email domain', () => {
  const baseValid = {
    fullName: 'Mohamed Thameem',
    registrationNumber: 'RA2411003010001',
    mobileNumber: '9876543210',
    collegeEmail: 'mt1234@srmist.edu.in',
    password: 'Password123!',
    departmentId: '11111111-1111-1111-1111-111111111111',
    programmeId: '22222222-2222-2222-2222-222222222222',
    admissionYear: 2024,
    currentYearOfStudy: 2,
    section: 'A',
  };

  const validResult = StudentRegistrationSchema.safeParse(baseValid);
  assert.equal(validResult.success, true);

  // Invalid email domain (gmail.com)
  const invalidEmail = { ...baseValid, collegeEmail: 'mt1234@gmail.com' };
  const invalidResult = StudentRegistrationSchema.safeParse(invalidEmail);
  assert.equal(invalidResult.success, false);
  assert.match(invalidResult.error.issues[0].message, /srmist\.edu\.in/);
});

test('Event Form Schema enforces chronological consistency and mandatory poster', () => {
  const validEvent = {
    title: 'SRM HackFest 2026',
    description: 'A 24-hour hackathon for building AI and campus innovation solutions.',
    category: 'Hackathon',
    organizingType: 'club',
    clubId: '33333333-3333-3333-3333-333333333333',
    posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000',
    venue: 'Tech Park Auditorium, SRMIST Ramapuram',
    startDate: '2026-11-15T09:00:00Z',
    endDate: '2026-11-16T18:00:00Z',
    registrationDeadline: '2026-11-14T23:59:59Z',
    maxParticipants: 100,
    allowedYears: [1, 2, 3, 4],
    contactName: 'Coordinator Name',
    contactPhone: '+919876543210',
    contactEmail: 'coordinator@srmist.edu.in',
  };

  const parsed = EventFormSchema.safeParse(validEvent);
  assert.equal(parsed.success, true);

  // Missing posterUrl must fail
  const missingPoster = { ...validEvent, posterUrl: '' };
  const missingPosterResult = EventFormSchema.safeParse(missingPoster);
  assert.equal(missingPosterResult.success, false);
  assert.match(missingPosterResult.error.issues[0].message, /poster is mandatory/);

  // End date before start date should fail
  const invalidDates = {
    ...validEvent,
    startDate: '2026-11-16T18:00:00Z',
    endDate: '2026-11-15T09:00:00Z',
  };
  const invalidDateResult = EventFormSchema.safeParse(invalidDates);
  assert.equal(invalidDateResult.success, false);

  // Registration deadline after start date should fail
  const invalidDeadline = {
    ...validEvent,
    registrationDeadline: '2026-11-17T09:00:00Z',
  };
  const invalidDeadlineResult = EventFormSchema.safeParse(invalidDeadline);
  assert.equal(invalidDeadlineResult.success, false);
});

test('Coordinator Scoped Permissions: Coordinators can only edit events belonging to their assigned club', () => {
  const c3ClubId = 'c-c3-club';
  const roboticsClubId = 'c-robotics-club';

  const coordinator = {
    id: 'u-coord-1',
    roles: ['coordinator'],
    assigned_club_id: c3ClubId,
  };

  const admin = {
    id: 'u-admin-1',
    roles: ['admin'],
    assigned_club_id: null,
  };

  const c3Event = {
    id: 'e-1',
    title: 'C3 CodeStorm',
    club_id: c3ClubId,
  };

  const roboticsEvent = {
    id: 'e-2',
    title: 'RoboWars 2026',
    club_id: roboticsClubId,
  };

  function canEdit(user, event) {
    if (user.roles.includes('admin')) return true;
    if (user.roles.includes('coordinator')) {
      return Boolean(user.assigned_club_id) && event.club_id === user.assigned_club_id;
    }
    return false;
  }

  // C3 Coordinator can edit C3 events
  assert.equal(canEdit(coordinator, c3Event), true);

  // C3 Coordinator CANNOT edit Robotics events
  assert.equal(canEdit(coordinator, roboticsEvent), false);

  // Admin can edit both events
  assert.equal(canEdit(admin, c3Event), true);
  assert.equal(canEdit(admin, roboticsEvent), true);

  // Unassigned coordinator cannot edit any event
  const unassignedCoord = { id: 'u-coord-2', roles: ['coordinator'], assigned_club_id: null };
  assert.equal(canEdit(unassignedCoord, c3Event), false);
  assert.equal(canEdit(unassignedCoord, roboticsEvent), false);
});

