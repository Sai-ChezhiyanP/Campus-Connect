# Campus Connect — Testing Procedures & Results

## Testing Matrix

| Test Suite | Scope | Target | Status |
| :--- | :--- | :--- | :--- |
| **Auth & Roster** | Student registration, institutional email validation, phone format | Validation Zod Schema | ✅ Passed (100%) |
| **B.Tech Specializations** | 18 SRM Ramapuram B.Tech programmes verification | Shared Package | ✅ Passed (100%) |
| **Feed Engine** | Hybrid mode ranking algorithm, category weighting, mute filter | Shared / Mobile | ✅ Passed (100%) |
| **Mandatory Notices** | Emergency/mandatory notice suppression bypass | Shared Engine | ✅ Passed (100%) |
| **Event Validation** | Chronological checks (start < end, deadline <= start) | Validation Zod Schema | ✅ Passed (100%) |
| **Calendar Exports** | RFC 5545 iCalendar (.ics) and Google Calendar intent URLs | Shared Package | ✅ Passed (100%) |
| **Web Dashboard** | All 8 routes (Overview, Events, Create, Approvals, Bulletins, Users, Clubs, Audit) | Next.js 15 App Router | ✅ Passed (HTTP 200) |
| **Android Environment** | Android 14 API 34 ARM64 SDK, ADB, Build-tools 34.0.0 | Android Studio CLI | ✅ Verified |
| **Emulator AVD Boot** | Pixel 7 ARM64 AVD created and booted via ADB | Android Emulator | ✅ Boot Completed |

---

## Synthetic Test Accounts (Seeded)

| Role | Email | Reg No |
| :--- | :--- | :--- |
| **Student** | `student.test@srmist.edu.in` | `RA2411003010001` |
| **Coordinator** | `coordinator.test@srmist.edu.in` | `RA2411003010002` |
| **Faculty** | `faculty.test@srmist.edu.in` | `EMP00412` |
| **Administrator** | `admin.test@srmist.edu.in` | `EMP00001` |

*Note: In accordance with project instructions, all test accounts are completely synthetic. No real student data is ever utilized.*
