# Campus Connect — Roles and Permissions Specification

## 1. User Roles Matrix

Campus Connect supports 4 distinct user roles. Multiple roles may be assigned to a single profile (e.g. a Student who is also a Club Coordinator).

| Role | Mobile App Access | Web Management Access | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | Yes | No | View feeds, register/cancel RSVP, explore clubs, follow clubs, calendar export, receive notifications, customize Smart Feed. |
| **Club Coordinator** | Yes | Yes | All student privileges + Create & edit events for assigned clubs, manage registrations, publish authorized club notices. |
| **Faculty** | Yes | Yes | Academic announcements, targeted bulletins (department, programme, year, section), workshops/academic events, view academic registrations. |
| **Administrator** | Yes | Yes | User & role management, event approval queue, club management, programme/department settings, platform-wide bulletins, audit logs. |

---

## 2. Row Level Security (RLS) Rules

1. **Profiles**:
   - `SELECT`: Authenticated users can view public profile details.
   - `UPDATE`: Users can update their own personal info (avatar, phone, feed prefs). Registration number and role cannot be altered by self.
2. **Events**:
   - `SELECT`: Anyone authenticated can read `approved` & `published` events. Coordinators/Faculty can read their own draft/pending events. Admins read all.
   - `INSERT`: Only Coordinators (for assigned clubs), Faculty (for their department), and Admins.
   - `UPDATE`: Event creator (while in draft or pending), or Admin at any time.
3. **Event Registrations**:
   - `INSERT`: Verified students can insert for active published events with open capacity. Enforced by stored procedure `register_for_event`.
   - `SELECT`: Students view their own registrations. Coordinators and Admins view registrations for their respective events.
4. **Announcements**:
   - `SELECT`: Verified users view notices matching their target scope (campus, department, programme, batch, or section).
   - `INSERT`: Faculty (scoped to their assigned department/programmes) and Administrators (campus-wide).
5. **Clubs**:
   - `SELECT`: Publicly readable by all authenticated users.
   - `UPDATE`: Club coordinators assigned to that specific club, or Admins.
   - `INSERT`/`DELETE`: Admins only.
