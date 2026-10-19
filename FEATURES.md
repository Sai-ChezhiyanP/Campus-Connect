# Campus Connect — Feature Release & Changelog

This document provides a comprehensive overview of all new features, architecture enhancements, security fortifications, and UI/UX refinements introduced to the **Campus Connect** ecosystem since the initial commit.

---

## 1. Security & Role-Based Access Governance

### 🛡️ Faculty Bulletin Hub Protection
* **Strict Role Gating**: Access to `/dashboard/announcements` is now strictly restricted to verified Faculty members and Campus Administrators.
* **UI & Route Shields**: Students and Club Coordinators attempting to navigate to the faculty bulletin board are blocked by an institutional access gate.
* **Backend Authorization**: API endpoints reject bulletin creation requests from unauthorized roles with an explicit HTTP `403 Forbidden`.

### 🚫 Student Event Creation Block
* **Access Restriction**: Students cannot create campus events. Official submissions are reserved for appointed Club Coordinators, Faculty, and Administrators.
* **UI Controls**: "Submit Event" and "Create Event" buttons are hidden when logged in as a student. Direct URL navigation to `/dashboard/events/create` presents a security lock interface explaining institutional policy.
* **API Security**: `POST /api/events` validates the author identity against verified profiles, blocking unprivileged submissions.

### 🎯 Scoped Club Coordinator Permissions
* **Assigned Club Lock**: Appointed Club Coordinators are locked to their specific club. When a coordinator opens the event creation form, the organizing entity is fixed to their assigned club.
* **Scoped Edit & Lifecycle Rights**: Coordinators can only edit, disable, or delete events belonging to their assigned club. Global administrator privileges remain unrestricted.

---

## 2. Institutional Club Management & Data Persistence

### 🏢 Club Coordinator Assignment
* **Persistent Club Allocation**: Fixed coordinator assignment persistence so that linking a student coordinator to a club preserves `assigned_club_id` across database writes without auto-deselection.
* **Bi-Directional Synchronization**: Assigning a coordinator to a club updates both the user's profile and the club's `coordinator_ids` array simultaneously.

### 🗑️ Persistent Club Lifecycle
* **Reliable Deletion**: Addressed server database synchronization so that deleted clubs are persistently purged from `.data/campus_connect_db.json` and do not reappear upon page refresh.

---

## 3. Approval Queue Architecture & Bug Fix

### ⚙️ Server-Side Crash Fix (`db is not defined`)
* **Root Cause Resolution**: Resolved an unhandled 500 error in `POST /api/events` where `db.profiles` was queried without initializing `const db = getDatabase();`.
* **Asynchronous Integrity**: Updated `store.createEvent` to be fully asynchronous (`await fetch('/api/events')`), ensuring events are committed to disk before client navigation, eliminating race conditions that previously caused coordinator submissions to disappear.

### 📬 Admin Approval Queue Enhancements (`/dashboard/approvals`)
* **A4 Portrait Poster Verification**: Each pending submission card displays the vertical A4 portrait poster with an "A4 Portrait (210 × 297 mm)" badge.
* **Click-to-Zoom Inspector**: Added an interactive full-size poster inspection modal so administrators can verify typography, sponsors, dates, and agenda details before approving.
* **Organizer Contact Card**: Direct visibility of the submitting coordinator's name, phone number, and institutional email.
* **Rejection Feedback Loop**: Rejection modal prompts for a mandatory reason, updating the event status to `rejected` with the feedback recorded.

---

## 4. Strict A4 Portrait Poster Standard (210 × 297 mm)

### 📐 Universal A4 Ratio Enforcement
* Standard A4 portrait ratio ($210 \times 297\text{ mm}$, aspect ratio $1 : 1.414$, `aspect-[210/297]`) is now strictly enforced across web and mobile.

### 🎨 Client-Side HTML5 Canvas Resizer & Cropper
* In the event creation form (`/dashboard/events/create`), uploaded images (PNG, JPG, WEBP) are automatically processed by an offscreen canvas.
* Files are scaled, centered, and cropped to exact $840 \times 1188\text{ px}$ dimensions with high-definition JPEG compression ($\sim 180\text{ KB}$), preventing browser `localStorage` quota overflow.

### 🖼️ High-Definition A4 Presets
* All six default poster presets (Hackathon, AI, Robotics, Cultural, Sports, Symposium) have been upgraded to vertical A4 portrait orientation (`fit=crop&w=840&h=1188`).

### 🗂️ Event Directory Thumbnails
* Replaced horizontal thumbnails in `/dashboard/events` with vertical A4 portrait frames.
* Added an amber status indicator (`Clock` **Awaiting Admin Approval**) so coordinators can immediately see that their submission is queued.

---

## 5. Mobile App UI / UX Refinements (Expo SDK 52)

### 📱 Partially Visible Header Hero + Tap-to-View Fit Mode
* **Header Hero Banner**: On the mobile event detail screen, the poster is partially visible as a header hero (`height: 260px`) with a frosted dark gradient overlay and overlapping content sheet.
* **"Tap for Full Poster" Pill**: Prominent glass pill indicator at the bottom-right of the hero banner.
* **Fit Mode Viewer**: Tapping the poster opens a full-screen modal in **Fit Mode** (fits screen width naturally without side black bars, 100% uncropped vertically, native $1 : 1.414$ aspect ratio) with vertical scroll and pinch-to-zoom (`maximumZoomScale={3}`).

### 📦 Glass Box Container for "About This Event"
* Enclosed the event description inside a glass card matching the **Registration Capacity** container:
  * Glass backdrop: `rgba(15, 23, 42, 0.72)`
  * Top highlight border: `borderTopColor: 'rgba(56, 189, 248, 0.5)', borderTopWidth: 1.5`
  * Matching border radius: `18px`, padding: `16px`, soft drop shadow
  * Header row with `Info` icon (`#38BDF8`) and crisp `#CBD5E1` typography with `lineHeight: 22`.

### 📢 Coordinator Bulletin Board Integration
* Created a dedicated Coordinator Bulletin page on the web portal.
* In the mobile app notifications feed, coordinator bulletins are highlighted with distinct purple shield icons, tags, and category filters.

### 🧹 Interface Decluttering
* Removed duplicate filter buttons on the mobile events screen.
* Removed the legacy campus management portal sign-in card from the student home screen.
* Removed the in-dashboard role switcher from the web navbar in favor of clean 1-tap demo logins on `/login`.

---

## 6. Test Suite & Architecture Stability

* **15/15 Automated Unit Tests Passing**:
  1. 18 SRM Ramapuram B.Tech specializations initialized
  2. Smart Feed scoring engine with club affinity weights
  3. Mandatory & urgent notices non-suppression rules
  4. Universal RFC 5545 iCalendar (`.ics`) generation
  5. Google Calendar URL builder
  6. SRM registration number normalization & regex validation
  7. Indian phone number normalization (`+91`)
  8. Student institutional email domain enforcement (`@srmist.edu.in`)
  9. Event form chronological validation and mandatory poster check
  10. Coordinator scoped club permissions
  11. Faculty bulletin board permissions
  12. Event deletion and disabling permissions
  13. Coordinator bulletin permissions
  14. One-tap demo login resolution independent of array ordering
  15. Student event creation restriction
