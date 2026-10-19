// Campus Connect Canonical TypeScript Types

export type AppRole = 'student' | 'coordinator' | 'faculty' | 'admin';

export type VerificationStatus =
  | 'pending_email'
  | 'pending_phone'
  | 'pending_institutional'
  | 'active'
  | 'suspended';

export type EventStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled' | 'attended';

export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TargetScope = 'campus' | 'department' | 'programme' | 'batch' | 'section';

export type FeedMode = 'smart' | 'custom' | 'hybrid';

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by?: string;
  created_at: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface Programme {
  id: string;
  department_id: string;
  code: string;
  name: string;
  degree: string;
  is_active: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  registration_number: string;
  mobile_number: string;
  college_email: string;
  avatar_url?: string | null;
  department_id?: string | null;
  programme_id?: string | null;
  admission_year: number;
  current_year_of_study: number;
  section: string;
  verification_status: VerificationStatus;
  roles?: AppRole[];
  assigned_club_id?: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation fields
  department?: Department;
  programme?: Programme;
}

export interface Club {
  id: string;
  name: string;
  category: string;
  description: string;
  logo_url?: string | null;
  faculty_adviser_id?: string | null;
  contact_email?: string | null;
  coordinator_ids?: string[];
  created_at: string;
}

export interface EventContactInfo {
  name: string;
  phone: string;
  email: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  organizing_type: 'club' | 'department' | 'central';
  club_id?: string | null;
  department_id?: string | null;
  poster_url?: string | null;
  venue: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants: number;
  current_registrations: number;
  eligibility_criteria?: {
    allowed_years?: number[];
    allowed_programmes?: string[];
    allowed_departments?: string[];
  };
  contact_info: EventContactInfo;
  status: EventStatus;
  rejection_reason?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  club?: Club;
  department?: Department;
  organizer_profile?: Profile;
  user_registration?: EventRegistration | null;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  qr_pass_code: string;
  status: RegistrationStatus;
  registered_at: string;
  cancelled_at?: string | null;
  event?: EventItem;
  user?: Profile;
}

export interface AnnouncementAttachment {
  name: string;
  url: string;
  size_bytes?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: AnnouncementPriority;
  is_mandatory: boolean;
  target_scope: TargetScope;
  target_department_id?: string | null;
  target_programme_id?: string | null;
  target_admission_year?: number | null;
  target_section?: string | null;
  attachments?: AnnouncementAttachment[];
  author_id: string;
  expires_at?: string | null;
  created_at: string;
  // Joined relations
  author_profile?: Profile;
  target_department?: Department;
  target_programme?: Programme;
}

export interface FeedPreference {
  user_id: string;
  mode: FeedMode;
  selected_categories: string[];
  muted_categories: string[];
  followed_clubs: string[];
  updated_at: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'announcement' | 'event' | 'registration' | 'reminder' | 'system';
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface StudentRosterRecord {
  registration_number: string;
  full_name: string;
  official_email: string;
  programme_code: string;
  admission_year: number;
}

export interface AuditLogRecord {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
