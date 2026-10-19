import { z } from 'zod';

// Allowed College Email Domain
export const ALLOWED_EMAIL_DOMAIN = 'srmist.edu.in';

// SRM Registration Number Regex pattern: e.g. RA2411003010123
export const SRM_REG_NO_REGEX = /^RA\d{13}$/i;

// Indian Mobile Number Regex: 10 digits starting with 6, 7, 8, or 9 (with optional +91 prefix)
export const INDIAN_PHONE_REGEX = /^(?:\+91)?[6-9]\d{9}$/;

/**
 * Normalizes an SRM registration number (trims whitespace, converts to uppercase)
 */
export function normalizeRegistrationNumber(val: string): string {
  return val.trim().toUpperCase();
}

/**
 * Normalizes Indian phone number to international E.164 format (+91XXXXXXXXXX)
 */
export function normalizeIndianPhoneNumber(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return val.trim();
}

// Student Registration Schema
export const StudentRegistrationSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name is too long')
    .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain alphabets, spaces, and periods'),

  registrationNumber: z
    .string()
    .transform(normalizeRegistrationNumber)
    .refine((val) => SRM_REG_NO_REGEX.test(val), {
      message: 'Invalid SRM registration number format (e.g., RA2411003010001)',
    }),

  mobileNumber: z
    .string()
    .transform(normalizeIndianPhoneNumber)
    .refine((val) => /^\+91[6-9]\d{9}$/.test(val), {
      message: 'Please enter a valid 10-digit Indian mobile number',
    }),

  collegeEmail: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim()
    .refine((email) => email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`), {
      message: `Must be an official institutional email ending with @${ALLOWED_EMAIL_DOMAIN}`,
    }),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),

  departmentId: z.string().uuid('Please select a valid department'),
  programmeId: z.string().uuid('Please select your B.Tech programme'),
  admissionYear: z
    .number()
    .int()
    .min(2020, 'Invalid admission year')
    .max(2027, 'Invalid admission year'),

  currentYearOfStudy: z
    .number()
    .int()
    .min(1, 'Year of study must be between 1 and 4')
    .max(4, 'Year of study must be between 1 and 4'),

  section: z
    .string()
    .min(1, 'Section is required')
    .max(10, 'Section must be at most 10 characters')
    .transform((s) => s.trim().toUpperCase()),
});

export type StudentRegistrationInput = z.infer<typeof StudentRegistrationSchema>;

// User Login Schema
export const LoginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim()
    .refine((email) => email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`), {
      message: `Must use your official @${ALLOWED_EMAIL_DOMAIN} account`,
    }),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Event Creation Schema
export const EventFormSchema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(150),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    category: z.enum([
      'Hackathon',
      'Workshop',
      'Symposium',
      'Webinar',
      'Cultural',
      'Sports',
      'Orientation',
      'Technical',
    ]),
    organizingType: z.enum(['club', 'department', 'central']),
    clubId: z.string().uuid().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
    posterUrl: z.string().min(1, 'An official event poster is mandatory for all campus events'),
    venue: z.string().min(3, 'Venue location is required'),
    startDate: z.string().datetime({ message: 'Invalid start date format' }),
    endDate: z.string().datetime({ message: 'Invalid end date format' }),
    registrationDeadline: z.string().datetime({ message: 'Invalid registration deadline format' }),
    maxParticipants: z.coerce.number().int().positive('Max participants must be greater than 0'),
    allowedYears: z.array(z.number().int().min(1).max(4)).default([1, 2, 3, 4]),
    contactName: z.string().min(2, 'Contact person name required'),
    contactPhone: z.string().refine((val) => INDIAN_PHONE_REGEX.test(val), {
      message: 'Valid contact phone number required',
    }),
    contactEmail: z.string().email('Valid contact email required'),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine((data) => new Date(data.registrationDeadline) <= new Date(data.startDate), {
    message: 'Registration deadline cannot be after the event starts',
    path: ['registrationDeadline'],
  });

export type EventFormInput = z.infer<typeof EventFormSchema>;

// Faculty Announcement Schema
export const AnnouncementFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  content: z.string().min(15, 'Content must be at least 15 characters'),
  category: z.enum(['Academic', 'Urgent', 'Examination', 'Placement', 'Club', 'General']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  isMandatory: z.boolean().default(false),
  targetScope: z.enum(['campus', 'department', 'programme', 'batch', 'section']),
  targetDepartmentId: z.string().uuid().optional().nullable(),
  targetProgrammeId: z.string().uuid().optional().nullable(),
  targetAdmissionYear: z.number().int().optional().nullable(),
  targetSection: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type AnnouncementFormInput = z.infer<typeof AnnouncementFormSchema>;

// Smart Feed Preferences Schema
export const FeedPreferencesSchema = z.object({
  mode: z.enum(['smart', 'custom', 'hybrid']),
  selectedCategories: z.array(z.string()).default([]),
  mutedCategories: z.array(z.string()).default([]),
  followedClubs: z.array(z.string().uuid()).default([]),
});

export type FeedPreferencesInput = z.infer<typeof FeedPreferencesSchema>;
