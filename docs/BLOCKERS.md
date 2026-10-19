# Campus Connect — External Blockers & Requirements

This document tracks items that require real external third-party service credentials or institution-specific network privileges.

| Item | Service | Impact | Current Handling / Fallback |
| :--- | :--- | :--- | :--- |
| **Android Studio & SDK Setup** | Google Android SDK | Cannot boot Android Emulator until SDK and ARM64 system image finish downloading and installing. | Running automated Homebrew cask installation in background. |
| **Supabase Project Credentials** | Supabase Cloud / Self-hosted | Remote cloud synchronization requires live `SUPABASE_URL` and `ANON_KEY`. | Offline-ready architecture with local fallback client and complete migration files ready for instant deployment. |
| **SMS OTP Gateway** | Twilio / MSG91 / Fast2SMS | SMS OTP requires paid Indian telecommunication DLT registration & SMS gateway API keys. | Flagged as external integration. Registration workflow supports verified email token authentication with OTP interface ready. |
| **SRM Official Student DB** | SRM ERP / Academia Portal | Direct live institutional database connection is protected and strictly proprietary. | Using authorized institutional roster table (`student_roster`) in PostgreSQL for enrollment verification. |
