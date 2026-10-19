# Campus Connect — Database Architecture

## 1. Relational Model & Schema Design

The backend uses a normalized PostgreSQL database managed through Supabase with strict Row Level Security (RLS) policies.

### Core Tables

1. **`profiles`**
   - `id`: UUID (Primary Key, references `auth.users.id` on delete cascade)
   - `full_name`: TEXT NOT NULL
   - `registration_number`: TEXT UNIQUE (Normalized uppercase format)
   - `mobile_number`: TEXT NOT NULL (E.164 international format)
   - `college_email`: TEXT NOT NULL UNIQUE (Must end with `@srmist.edu.in`)
   - `avatar_url`: TEXT
   - `department_id`: UUID (FK to `departments`)
   - `programme_id`: UUID (FK to `programmes`)
   - `admission_year`: INTEGER NOT NULL
   - `current_year_of_study`: INTEGER NOT NULL (1 to 4)
   - `section`: TEXT NOT NULL
   - `verification_status`: `verification_status_enum` ('pending_email', 'pending_phone', 'pending_institutional', 'active', 'suspended')
   - `created_at`: TIMESTAMPTZ DEFAULT now()
   - `updated_at`: TIMESTAMPTZ DEFAULT now()

2. **`departments`**
   - `id`: UUID PK
   - `code`: TEXT UNIQUE (e.g., 'CSE', 'ECE', 'MECH')
   - `name`: TEXT NOT NULL
   - `created_at`: TIMESTAMPTZ DEFAULT now()

3. **`programmes`**
   - `id`: UUID PK
   - `department_id`: UUID FK
   - `code`: TEXT UNIQUE
   - `name`: TEXT NOT NULL (e.g., 'B.Tech - CSE Artificial Intelligence and Machine Learning')
   - `degree`: TEXT DEFAULT 'B.Tech'
   - `is_active`: BOOLEAN DEFAULT true

4. **`user_roles`**
   - `id`: UUID PK
   - `user_id`: UUID FK references `profiles.id`
   - `role`: `app_role_enum` ('student', 'coordinator', 'faculty', 'admin')
   - `assigned_by`: UUID FK references `profiles.id`
   - `created_at`: TIMESTAMPTZ DEFAULT now()
   - Unique constraint: `(user_id, role)`

5. **`faculty_assignments`**
   - `id`: UUID PK
   - `user_id`: UUID FK references `profiles.id`
   - `department_id`: UUID FK references `departments.id`
   - `designation`: TEXT

6. **`clubs`**
   - `id`: UUID PK
   - `name`: TEXT UNIQUE NOT NULL
   - `category`: TEXT NOT NULL (e.g., 'Technical', 'Cultural', 'Social')
   - `description`: TEXT NOT NULL
   - `logo_url`: TEXT
   - `faculty_adviser_id`: UUID FK references `profiles.id`
   - `contact_email`: TEXT
   - `created_at`: TIMESTAMPTZ DEFAULT now()

7. **`club_coordinators`**
   - `id`: UUID PK
   - `club_id`: UUID FK references `clubs.id`
   - `user_id`: UUID FK references `profiles.id`
   - Unique `(club_id, user_id)`

8. **`events`**
   - `id`: UUID PK
   - `title`: TEXT NOT NULL
   - `description`: TEXT NOT NULL
   - `category`: TEXT NOT NULL ('Hackathon', 'Workshop', 'Symposium', 'Webinar', 'Cultural', 'Sports', 'Orientation')
   - `organizing_type`: TEXT NOT NULL ('club', 'department', 'central')
   - `club_id`: UUID FK references `clubs.id` (nullable)
   - `department_id`: UUID FK references `departments.id` (nullable)
   - `poster_url`: TEXT
   - `venue`: TEXT NOT NULL
   - `start_date`: TIMESTAMPTZ NOT NULL
   - `end_date`: TIMESTAMPTZ NOT NULL
   - `registration_deadline`: TIMESTAMPTZ NOT NULL
   - `max_participants`: INTEGER NOT NULL CHECK (max_participants > 0)
   - `current_registrations`: INTEGER DEFAULT 0 CHECK (current_registrations >= 0)
   - `eligibility_criteria`: JSONB DEFAULT '{}'::jsonb
   - `contact_info`: JSONB NOT NULL
   - `status`: `event_status_enum` ('draft', 'pending_approval', 'approved', 'published', 'rejected', 'cancelled', 'completed')
   - `rejection_reason`: TEXT
   - `created_by`: UUID FK references `profiles.id`
   - `created_at`: TIMESTAMPTZ DEFAULT now()
   - `updated_at`: TIMESTAMPTZ DEFAULT now()

9. **`event_registrations`**
   - `id`: UUID PK
   - `event_id`: UUID FK references `events.id`
   - `user_id`: UUID FK references `profiles.id`
   - `qr_pass_code`: UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL
   - `status`: `registration_status_enum` ('confirmed', 'waitlisted', 'cancelled', 'attended')
   - `registered_at`: TIMESTAMPTZ DEFAULT now()
   - `cancelled_at`: TIMESTAMPTZ
   - Unique `(event_id, user_id)`

10. **`announcements`**
    - `id`: UUID PK
    - `title`: TEXT NOT NULL
    - `content`: TEXT NOT NULL
    - `category`: TEXT NOT NULL ('Academic', 'Urgent', 'Examination', 'Placement', 'Club', 'General')
    - `priority`: `announcement_priority_enum` ('low', 'medium', 'high', 'urgent')
    - `is_mandatory`: BOOLEAN DEFAULT false
    - `target_scope`: `target_scope_enum` ('campus', 'department', 'programme', 'batch', 'section')
    - `target_department_id`: UUID FK references `departments.id`
    - `target_programme_id`: UUID FK references `programmes.id`
    - `target_admission_year`: INTEGER
    - `target_section`: TEXT
    - `attachments`: JSONB DEFAULT '[]'::jsonb
    - `author_id`: UUID FK references `profiles.id`
    - `expires_at`: TIMESTAMPTZ
    - `created_at`: TIMESTAMPTZ DEFAULT now()

11. **`feed_preferences`**
    - `user_id`: UUID PK references `profiles.id`
    - `mode`: `feed_mode_enum` ('smart', 'custom', 'hybrid') DEFAULT 'hybrid'
    - `selected_categories`: TEXT[] DEFAULT '{}'
    - `muted_categories`: TEXT[] DEFAULT '{}'
    - `followed_clubs`: UUID[] DEFAULT '{}'
    - `updated_at`: TIMESTAMPTZ DEFAULT now()

12. **`club_follows`**
    - `user_id`: UUID FK references `profiles.id`
    - `club_id`: UUID FK references `clubs.id`
    - PK `(user_id, club_id)`

13. **`notifications`**
    - `id`: UUID PK
    - `user_id`: UUID FK references `profiles.id`
    - `title`: TEXT NOT NULL
    - `body`: TEXT NOT NULL
    - `type`: TEXT NOT NULL
    - `data`: JSONB DEFAULT '{}'::jsonb
    - `is_read`: BOOLEAN DEFAULT false
    - `created_at`: TIMESTAMPTZ DEFAULT now()

14. **`student_roster`** (Authorized enrollment verification database)
    - `registration_number`: TEXT PK
    - `full_name`: TEXT NOT NULL
    - `official_email`: TEXT NOT NULL UNIQUE
    - `programme_code`: TEXT NOT NULL
    - `admission_year`: INTEGER NOT NULL

15. **`audit_logs`**
    - `id`: UUID PK
    - `actor_id`: UUID FK references `profiles.id`
    - `action`: TEXT NOT NULL
    - `entity_type`: TEXT NOT NULL
    - `entity_id`: TEXT NOT NULL
    - `metadata`: JSONB DEFAULT '{}'::jsonb
    - `created_at`: TIMESTAMPTZ DEFAULT now()
