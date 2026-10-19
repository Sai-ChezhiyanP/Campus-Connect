-- ====================================================================
-- CAMPUS CONNECT: SRMIST Ramapuram Core Database Schema & RLS Policies
-- Migration: 20261015000000_init_campus_connect.sql
-- ====================================================================

-- 1. Custom Types and Enums
CREATE TYPE app_role_enum AS ENUM ('student', 'coordinator', 'faculty', 'admin');
CREATE TYPE verification_status_enum AS ENUM ('pending_email', 'pending_phone', 'pending_institutional', 'active', 'suspended');
CREATE TYPE event_status_enum AS ENUM ('draft', 'pending_approval', 'approved', 'published', 'rejected', 'cancelled', 'completed');
CREATE TYPE registration_status_enum AS ENUM ('confirmed', 'waitlisted', 'cancelled', 'attended');
CREATE TYPE announcement_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE target_scope_enum AS ENUM ('campus', 'department', 'programme', 'batch', 'section');
CREATE TYPE feed_mode_enum AS ENUM ('smart', 'custom', 'hybrid');

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Academic Programmes Table
CREATE TABLE IF NOT EXISTS programmes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    degree TEXT NOT NULL DEFAULT 'B.Tech',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    registration_number TEXT NOT NULL UNIQUE,
    mobile_number TEXT NOT NULL,
    college_email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    programme_id UUID REFERENCES programmes(id) ON DELETE SET NULL,
    admission_year INTEGER NOT NULL,
    current_year_of_study INTEGER NOT NULL CHECK (current_year_of_study BETWEEN 1 AND 4),
    section TEXT NOT NULL,
    verification_status verification_status_enum NOT NULL DEFAULT 'pending_email',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. User Roles (Supports multiple roles per user)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role_enum NOT NULL,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role)
);

-- 6. Faculty Department Assignments
CREATE TABLE IF NOT EXISTS faculty_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    designation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT faculty_assignments_unique UNIQUE (user_id, department_id)
);

-- 7. Student Roster (Authorized Enrollment Check)
CREATE TABLE IF NOT EXISTS student_roster (
    registration_number TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    official_email TEXT NOT NULL UNIQUE,
    programme_code TEXT NOT NULL,
    admission_year INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT,
    faculty_adviser_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    contact_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Club Coordinators Mapping
CREATE TABLE IF NOT EXISTS club_coordinators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT club_coordinators_unique UNIQUE (club_id, user_id)
);

-- 10. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    organizing_type TEXT NOT NULL CHECK (organizing_type IN ('club', 'department', 'central')),
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    poster_url TEXT,
    venue TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    max_participants INTEGER NOT NULL CHECK (max_participants > 0),
    current_registrations INTEGER NOT NULL DEFAULT 0 CHECK (current_registrations >= 0),
    eligibility_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    contact_info JSONB NOT NULL,
    status event_status_enum NOT NULL DEFAULT 'draft',
    rejection_reason TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT event_dates_check CHECK (end_date > start_date),
    CONSTRAINT event_deadline_check CHECK (registration_deadline <= start_date)
);

-- 11. Event Registrations Table (Concurrency Safe RSVPs)
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    qr_pass_code UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    status registration_status_enum NOT NULL DEFAULT 'confirmed',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    cancelled_at TIMESTAMPTZ,
    CONSTRAINT event_registration_unique UNIQUE (event_id, user_id)
);

-- 12. Announcements Table (Faculty Bulletin Hub)
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    priority announcement_priority_enum NOT NULL DEFAULT 'medium',
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    target_scope target_scope_enum NOT NULL DEFAULT 'campus',
    target_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    target_programme_id UUID REFERENCES programmes(id) ON DELETE SET NULL,
    target_admission_year INTEGER,
    target_section TEXT,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Feed Preferences
CREATE TABLE IF NOT EXISTS feed_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    mode feed_mode_enum NOT NULL DEFAULT 'hybrid',
    selected_categories TEXT[] NOT NULL DEFAULT '{}',
    muted_categories TEXT[] NOT NULL DEFAULT '{}',
    followed_clubs UUID[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Club Follows
CREATE TABLE IF NOT EXISTS club_follows (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, club_id)
);

-- 15. In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_announcements_scope ON announcements(target_scope);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- ====================================================================
-- Concurrency-Safe Stored Procedures (Registration & Cancellation)
-- ====================================================================

CREATE OR REPLACE FUNCTION register_for_event(p_event_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event RECORD;
    v_existing RECORD;
    v_qr_pass UUID;
BEGIN
    -- 1. Lock the event row for update to ensure concurrency safety
    SELECT * INTO v_event FROM events WHERE id = p_event_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event not found');
    END IF;

    -- 2. Verify publication status
    IF v_event.status != 'published' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event is not open for registration');
    END IF;

    -- 3. Check registration deadline
    IF now() > v_event.registration_deadline THEN
        RETURN jsonb_build_object('success', false, 'error', 'Registration deadline has passed');
    END IF;

    -- 4. Check for duplicate active registration
    SELECT * INTO v_existing FROM event_registrations 
    WHERE event_id = p_event_id AND user_id = p_user_id;

    IF FOUND AND v_existing.status = 'confirmed' THEN
        RETURN jsonb_build_object('success', false, 'error', 'You are already registered for this event');
    END IF;

    -- 5. Check capacity limit
    IF v_event.current_registrations >= v_event.max_participants THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event capacity is full');
    END IF;

    -- 6. Insert or re-activate registration
    v_qr_pass := gen_random_uuid();
    
    IF FOUND AND v_existing.status = 'cancelled' THEN
        UPDATE event_registrations
        SET status = 'confirmed',
            qr_pass_code = v_qr_pass,
            registered_at = now(),
            cancelled_at = NULL
        WHERE id = v_existing.id;
    ELSE
        INSERT INTO event_registrations (event_id, user_id, qr_pass_code, status)
        VALUES (p_event_id, p_user_id, v_qr_pass, 'confirmed');
    END IF;

    -- 7. Atomically increment current count
    UPDATE events
    SET current_registrations = current_registrations + 1,
        updated_at = now()
    WHERE id = p_event_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Registration confirmed', 
        'qr_pass_code', v_qr_pass
    );
END;
$$;

CREATE OR REPLACE FUNCTION cancel_event_registration(p_event_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reg RECORD;
BEGIN
    -- 1. Check existing confirmed registration
    SELECT * INTO v_reg FROM event_registrations 
    WHERE event_id = p_event_id AND user_id = p_user_id AND status = 'confirmed';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'No active confirmed registration found');
    END IF;

    -- 2. Lock event row
    PERFORM 1 FROM events WHERE id = p_event_id FOR UPDATE;

    -- 3. Mark registration as cancelled
    UPDATE event_registrations
    SET status = 'cancelled',
        cancelled_at = now()
    WHERE id = v_reg.id;

    -- 4. Atomically decrement current count
    UPDATE events
    SET current_registrations = GREATEST(0, current_registrations - 1),
        updated_at = now()
    WHERE id = p_event_id;

    RETURN jsonb_build_object('success', true, 'message', 'Registration cancelled successfully');
END;
$$;

-- ====================================================================
-- Row Level Security (RLS) Setup
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_roster ENABLE ROW LEVEL SECURITY;

-- Helper security functions
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = user_uuid AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION is_faculty(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = user_uuid AND role = 'faculty'
    );
$$;

CREATE OR REPLACE FUNCTION is_club_coordinator(user_uuid UUID, check_club_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM club_coordinators 
        WHERE user_id = user_uuid AND club_id = check_club_id
    ) OR is_admin(user_uuid);
$$;

-- Profiles Policies
CREATE POLICY "Public profiles can be viewed by authenticated users"
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own personal profile"
ON profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Departments & Programmes (Read by all authenticated, modified by admin)
CREATE POLICY "Read departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage departments" ON departments FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Read programmes" ON programmes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage programmes" ON programmes FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Events Policies
CREATE POLICY "Read published events" ON events FOR SELECT TO authenticated
USING (status = 'published' OR created_by = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Coordinators and Faculty can create events" ON events FOR INSERT TO authenticated
WITH CHECK (
    is_admin(auth.uid()) OR
    (organizing_type = 'club' AND club_id IS NOT NULL AND is_club_coordinator(auth.uid(), club_id)) OR
    (organizing_type = 'department' AND is_faculty(auth.uid()))
);

CREATE POLICY "Creators and Admins can update events" ON events FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR is_admin(auth.uid()));

-- Event Registrations Policies
CREATE POLICY "Users view own registrations or admin/coordinators view event attendees"
ON event_registrations FOR SELECT TO authenticated
USING (
    user_id = auth.uid() OR 
    is_admin(auth.uid()) OR 
    EXISTS (
        SELECT 1 FROM events e 
        WHERE e.id = event_registrations.event_id 
        AND e.created_by = auth.uid()
    )
);

-- Announcements Policies
CREATE POLICY "View announcements relevant to user" ON announcements FOR SELECT TO authenticated
USING (
    target_scope = 'campus' OR
    is_mandatory = true OR
    author_id = auth.uid() OR
    is_admin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() AND (
            (target_scope = 'department' AND target_department_id = p.department_id) OR
            (target_scope = 'programme' AND target_programme_id = p.programme_id) OR
            (target_scope = 'batch' AND target_admission_year = p.admission_year) OR
            (target_scope = 'section' AND target_section = p.section)
        )
    )
);

CREATE POLICY "Faculty and Admins create announcements" ON announcements FOR INSERT TO authenticated
WITH CHECK (is_faculty(auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Authors and Admins update announcements" ON announcements FOR UPDATE TO authenticated
USING (author_id = auth.uid() OR is_admin(auth.uid()));

-- Clubs Policies
CREATE POLICY "Read clubs" ON clubs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage clubs" ON clubs FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Feed Preferences
CREATE POLICY "Manage own feed preferences" ON feed_preferences FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Notifications
CREATE POLICY "Manage own notifications" ON notifications FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Club Follows
CREATE POLICY "Manage own club follows" ON club_follows FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
