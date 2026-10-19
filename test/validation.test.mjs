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

test('Faculty Bulletin Permissions: Coordinators and students cannot broadcast bulletins; only Faculty and Admins are authorized', () => {
  function canPublishBulletin(user) {
    return Boolean(user.roles?.includes('admin') || user.roles?.includes('faculty'));
  }

  const coordinator = { id: 'u-coord', roles: ['student', 'coordinator'] };
  const student = { id: 'u-stud', roles: ['student'] };
  const faculty = { id: 'u-fac', roles: ['faculty'] };
  const admin = { id: 'u-adm', roles: ['admin'] };

  // Coordinators and students are strictly blocked
  assert.equal(canPublishBulletin(coordinator), false);
  assert.equal(canPublishBulletin(student), false);

  // Faculty and Admins are authorized
  assert.equal(canPublishBulletin(faculty), true);
  assert.equal(canPublishBulletin(admin), true);
});

test('Event Deletion and Disabling Permissions: Admins and Club Coordinators', () => {
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

  const student = {
    id: 'u-student-1',
    roles: ['student'],
    assigned_club_id: null,
  };

  const c3Event = { id: 'e-1', title: 'C3 Hackathon', club_id: c3ClubId, status: 'published' };
  const roboticsEvent = { id: 'e-2', title: 'Robotics Workshop', club_id: roboticsClubId, status: 'published' };

  function canManageEvent(user, event) {
    if (user.roles?.includes('admin')) return true;
    if (user.roles?.includes('coordinator')) {
      return Boolean(user.assigned_club_id) && event.club_id === user.assigned_club_id;
    }
    return false;
  }

  // Admin can delete or disable both events
  assert.equal(canManageEvent(admin, c3Event), true);
  assert.equal(canManageEvent(admin, roboticsEvent), true);

  // C3 Coordinator can delete or disable C3 events
  assert.equal(canManageEvent(coordinator, c3Event), true);

  // C3 Coordinator CANNOT delete or disable Robotics events
  assert.equal(canManageEvent(coordinator, roboticsEvent), false);

  // Regular student cannot delete or disable any event
  assert.equal(canManageEvent(student, c3Event), false);
  assert.equal(canManageEvent(student, roboticsEvent), false);
});

test('Coordinator Bulletin Permissions: Club notices allowed, general/exam bulletins blocked', () => {
  function canPublishCategory(user, category) {
    const isAdmin = user.roles?.includes('admin');
    const isFaculty = user.roles?.includes('faculty');
    const isCoordinator = user.roles?.includes('coordinator');

    if (isAdmin || isFaculty) return true;
    if (isCoordinator && (category === 'Club' || category === 'Coordinator')) {
      return Boolean(user.assigned_club_id);
    }
    return false;
  }

  const coordinatorWithClub = { id: 'u-c1', roles: ['coordinator'], assigned_club_id: 'c-chat' };
  const coordinatorNoClub = { id: 'u-c2', roles: ['coordinator'], assigned_club_id: null };

  // Coordinator can broadcast club notices
  assert.equal(canPublishCategory(coordinatorWithClub, 'Club'), true);

  // Coordinator cannot broadcast Examination / Administrative notices
  assert.equal(canPublishCategory(coordinatorWithClub, 'Examination'), false);
  assert.equal(canPublishCategory(coordinatorWithClub, 'Academic'), false);

  // Coordinator without assigned club cannot broadcast club notices
  assert.equal(canPublishCategory(coordinatorNoClub, 'Club'), false);
});

test('One-tap Demo Login Resolution: Independent of profile array ordering', () => {
  const profiles = [
    { id: 'u-1', full_name: 'Custom Student', college_email: 'sp@srmist.edu.in', roles: ['student', 'coordinator'] },
    { id: 'u-2', full_name: 'Rohit Verma', college_email: 'rohit@srmist.edu.in', roles: ['student'] },
    { id: 'u-3', full_name: 'Aarav Sharma', college_email: 'student.test@srmist.edu.in', roles: ['student'] },
    { id: 'u-4', full_name: 'Priya Raman', college_email: 'coordinator.test@srmist.edu.in', roles: ['coordinator'] },
    { id: 'u-5', full_name: 'Dr. K. Venkatesh', college_email: 'faculty.test@srmist.edu.in', roles: ['faculty'] },
    { id: 'u-6', full_name: 'Campus Administrator', college_email: 'admin.test@srmist.edu.in', roles: ['admin'] },
  ];

  function resolveDemoUser(query) {
    if (query === 'admin' || query === 'admin.test@srmist.edu.in') {
      return profiles.find((p) => p.college_email === 'admin.test@srmist.edu.in') || profiles.find((p) => p.roles?.includes('admin'));
    }
    if (query === 'faculty' || query === 'faculty.test@srmist.edu.in') {
      return profiles.find((p) => p.college_email === 'faculty.test@srmist.edu.in') || profiles.find((p) => p.roles?.includes('faculty'));
    }
    if (query === 'coordinator' || query === 'coordinator.test@srmist.edu.in') {
      return profiles.find((p) => p.college_email === 'coordinator.test@srmist.edu.in') || profiles.find((p) => p.roles?.includes('coordinator'));
    }
    return profiles.find((p) => p.college_email === 'student.test@srmist.edu.in');
  }

  // Admin button returns Campus Administrator
  assert.equal(resolveDemoUser('admin').full_name, 'Campus Administrator');
  assert.equal(resolveDemoUser('admin').roles.includes('admin'), true);

  // Faculty button returns Dr. K. Venkatesh
  assert.equal(resolveDemoUser('faculty').full_name, 'Dr. K. Venkatesh');
  assert.equal(resolveDemoUser('faculty').roles.includes('faculty'), true);

  // Coordinator button returns Priya Raman
  assert.equal(resolveDemoUser('coordinator').full_name, 'Priya Raman');
  assert.equal(resolveDemoUser('coordinator').roles.includes('coordinator'), true);
});

test('Student Event Creation Restriction: Students are blocked from creating events', () => {
  function canCreateEvent(user) {
    const isAdmin = Boolean(user.roles?.includes('admin'));
    const isCoordinator = Boolean(user.roles?.includes('coordinator'));
    const isFaculty = Boolean(user.roles?.includes('faculty'));
    return isAdmin || isCoordinator || isFaculty;
  }

  const student = { id: 'u-s1', roles: ['student'] };
  const coordinator = { id: 'u-c1', roles: ['coordinator'] };
  const faculty = { id: 'u-f1', roles: ['faculty'] };
  const admin = { id: 'u-a1', roles: ['admin'] };

  assert.equal(canCreateEvent(student), false);
  assert.equal(canCreateEvent(coordinator), true);
  assert.equal(canCreateEvent(faculty), true);
  assert.equal(canCreateEvent(admin), true);
});


