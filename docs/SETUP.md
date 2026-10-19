# Campus Connect — Local Setup Guide

## Prerequisites
- **macOS** Apple Silicon (M-series)
- **Node.js**: v20+ (Current system: v24.18.0)
- **npm**: 11+
- **Java**: JDK 17 recommended for native Android builds
- **Android Studio & SDK**: Android SDK Platform-Tools 35+, Build-Tools, Google Play ARM64 Emulator Image

---

## 1. Monorepo Installation

```bash
# Clone and navigate to workspace
cd CampusConnect

# Install all workspace dependencies
npm install
```

---

## 2. Environment Configuration

Copy `.env.example` to `.env` in both `apps/mobile` and `apps/web`:

```bash
cp .env.example apps/mobile/.env
cp .env.example apps/web/.env
```

Set the corresponding Supabase keys:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 3. Running Mobile Application (Expo)

```bash
# Start the Expo development server
npm run dev:mobile

# Press 'a' to open in connected Android Emulator
```

---

## 4. Running Web Management Dashboard (Next.js)

```bash
# Start Next.js development server
npm run dev:web

# Open http://localhost:3000
```
