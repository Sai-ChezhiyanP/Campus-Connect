# Campus Connect 🎓

> **A Unified Digital Campus & Event Operations Platform for SRM Institute of Science and Technology, Ramapuram Campus, Chennai**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-51-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-10%2F10%20Passing-brightgreen)](#testing--verification)

Campus Connect replaces fragmented WhatsApp groups, paper noticeboards, and disconnected forms with a unified, role-based mobile and web ecosystem. It gives students personalized event discovery with algorithmic feed ranking, empowers club coordinators with scoped event management and mandatory poster uploads, and arms administrators with centralized club operations, role permissions, and audit logs.

---

## 🌟 Core Features

### 🏛️ Club Management & Operations (Admin)
- **Full Club Lifecycle**: Administrators can create, edit, and delete student clubs, technical societies, and cultural organizations.
- **Visual Branding**: Supports custom club logo uploads via FileReader with live preview and preset badge configurations.
- **Coordinator Linkage**: Seamlessly link coordinator student accounts to specific clubs from either the Club Management console or the User Directory.

### 🎯 Scoped Coordinator Permissions
- **Club-Specific Event Scoping**: Coordinators can **only submit and edit events belonging to their assigned club**. Other clubs' events are locked.
- **Unassigned Coordinator Safeguards**: Coordinators not yet linked to an official club receive guidance and are prevented from publishing until an administrator assigns them.
- **Full Administrative Override**: Campus Administrators retain university-wide authority to review, approve, edit, and publish events for any department or club.

### 🖼️ Mandatory Event Posters
- **Quality Standard**: All events require an official event poster before publication or updating.
- **Upload Flexibility**:
  - **Custom Image Upload**: Drag-and-drop or file selector supporting PNG, JPG, and WEBP up to 5MB with automated base64 generation.
  - **Curated Theme Presets**: Instant selection from curated high-res posters (Hackathons, AI/Data Science, Robotics, Cultural Fests, Sports Meets, Symposiums).
- **Cross-Platform Visibility**: Posters automatically populate event hero cards across the web portal, live preview mode, mobile feeds, and registration passes.

### 📱 Student Mobile Experience (Expo & React Native)
- **Smart Feed Engine**: Algorithmic event ranking tailored to student degree (`B.Tech`), academic department (CSE, ECE, IT, etc.), admission year, section, and followed clubs.
- **Feed Customization**: Switch between **Smart** (algorithmic affinity), **Custom** (filtered by selected categories), and **All** feeds.
- **QR Entry Pass**: One-touch event registration generates a cryptographically unique `CC-PASS-XXXX` QR ticket with live attendee check-in.
- **Universal Calendar Export**: Export registered events directly into Google Calendar or standard `.ics` (RFC 5545) format.

### 📢 Targeted Faculty Bulletins
- **Scoped Announcements**: Filter broadcasts by campus, department, degree programme, graduating batch, or section.
- **Urgent Priority Banner**: High-priority notices cannot be dismissed or muted, ensuring critical academic circulars reach students immediately.

### 🔄 Real-Time Bidirectional Sync & Offline-First Resilience
- Built-in REST API sync engine with automatic background polling.
- Mobile app auto-discovers host IP from Expo Go (`Constants.expoConfig.hostUri`), enabling seamless testing between physical phones and local dev servers on the same Wi-Fi.

---

## 🏗️ Architecture & Monorepo Structure

```text
CampusConnect/
├── apps/
│   ├── web/                     # Next.js 15 Management Portal (App Router, Tailwind CSS, Lucide Icons)
│   │   ├── app/
│   │   │   ├── api/             # REST Endpoints (clubs, events, registrations, announcements, state)
│   │   │   ├── dashboard/       # Role-protected management interfaces
│   │   │   │   ├── clubs/       # Admin club CRUD & coordinator assignment
│   │   │   │   ├── events/      # Event directory, edit modal & creator
│   │   │   │   ├── approvals/   # Admin review & approval queue
│   │   │   │   ├── users/       # User directory & role management
│   │   │   │   └── audit/       # Immutable security audit logs
│   │   │   └── login/           # Fast role-switching & institutional auth
│   │   └── lib/
│   │       ├── store.ts         # Client-side reactive singleton store
│   │       └── server-db.ts     # Persistent server-side state engine
│   │
│   └── mobile/                  # React Native Mobile App (Expo Router v3)
│       ├── app/
│       │   ├── (tabs)/          # Bottom tabs: Feed, Discover, Passes, Profile
│       │   ├── events/[id].tsx  # Event detail, poster hero & registration
│       │   └── login.tsx        # Student authentication & registration
│       └── services/
│           ├── store.ts         # Mobile state manager & background sync
│           └── storage.ts       # Cross-platform AsyncStorage / LocalStorage wrapper
│
├── packages/
│   ├── types/                   # Canonical TypeScript data contracts
│   ├── validation/              # Zod schemas (SRM reg no, mandatory posters, dates)
│   └── shared/                  # SRM departments, 18 B.Tech programmes, calendar helpers
│
├── supabase/
│   └── migrations/              # Production PostgreSQL schema with RLS & concurrency locks
└── test/                        # Node.js native test suite
```

---

## 👥 User Roles & Access Matrix

| Capability | Student | Club Coordinator | Faculty | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Smart Feed & Categories** | ✅ | ✅ | ✅ | ✅ |
| **Event Registration & QR Pass** | ✅ | ✅ | ✅ | ✅ |
| **Follow & Unfollow Clubs** | ✅ | ✅ | ✅ | ✅ |
| **Add / Edit / Remove Clubs** | ❌ | ❌ | ❌ | ✅ |
| **Submit New Events** | ❌ | ✅ (Assigned club) | ❌ | ✅ (All entities) |
| **Edit Existing Events** | ❌ | ✅ (Assigned club) | ❌ | ✅ (All events) |
| **Mandatory Poster Enforcement** | — | ✅ Required | — | ✅ Required |
| **Publish Faculty Bulletins** | ❌ | ❌ | ✅ | ✅ |
| **Approve / Reject Event Queue** | ❌ | ❌ | ❌ | ✅ |
| **Assign Roles & Link Coordinators**| ❌ | ❌ | ❌ | ✅ |
| **View Institutional Audit Logs** | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (recommended: Node v20 LTS / v22 LTS)
- **Package Manager**: npm v9+

### 2. Clone & Install
```bash
git clone https://github.com/Sai-ChezhiyanP/Campus-Connect.git
cd Campus-Connect
npm install
```

### 3. Launch the Web Management Portal
```bash
# Starts Next.js dev server on http://localhost:3000
npm --workspace=@campus-connect/web run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. You can click on any pre-seeded persona on the login screen (Admin, Coordinator, Faculty, Student) for instant testing.

### 4. Launch the Mobile Application (Expo)
```bash
# Starts Expo development server on http://localhost:8081
npm --workspace=@campus-connect/mobile run dev
```
- **Web Preview**: Press `w` in the terminal to open the mobile web view.
- **Physical Device**: Scan the terminal QR code using **Expo Go** on Android or iOS. Both devices should be connected to the same Wi-Fi network.

---

## 🧪 Testing & Verification

The repository includes comprehensive tests verifying institutional validation schemas, chronological constraints, coordinator-scoped permissions, and calendar generation:

```bash
npm test
```

### Test Suite Coverage:
- ✔ 18 SRM Ramapuram B.Tech specializations initialized
- ✔ Smart Feed scoring engine with user affinity and followed clubs
- ✔ Mandatory notices cannot be suppressed or muted
- ✔ RFC 5545 iCalendar (`.ics`) generation and Google Calendar URL formatting
- ✔ SRM Registration Number normalization & validation (`RA2411003010001`)
- ✔ Student email validation enforcing `@srmist.edu.in` institutional domain
- ✔ Mandatory event poster validation
- ✔ Event chronological validation (start date, end date, deadline)
- ✔ Coordinator-scoped club permissions (coordinators restricted to their assigned club, admins unrestricted)

---

## 🔒 Security & Data Integrity

- **Strict Scoping**: Backend and state methods verify user credentials before granting write access to club events.
- **Domain Verification**: Enforces SRMIST institutional emails across student onboarding.
- **Audit Trail**: Administrative actions (club modifications, coordinator assignments, role changes, event approvals) generate timestamped audit records.
- **Race Condition Prevention**: Database stored procedures implement `FOR UPDATE` row locks to prevent event oversubscription.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
Designed and developed for **SRM Institute of Science and Technology, Ramapuram Campus**.
