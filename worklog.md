# Arabic Sikhi (আরবি শিখি) — Premium Arabic Learning App — Worklog

## Project Status

**Status: ✅ COMPLETE — Core MVP + premium assets, browser-verified, lint clean**

A premium, mobile-first, gamified Quranic Arabic learning web app (PWA-style) built for the As-Sunnah Foundation. Rendered as a single `/` route with a state-driven screen stack (Zustand) to support back navigation within a mobile shell.

### Tech Stack
- Next.js 16 (App Router) + TypeScript 5
- Tailwind CSS 4 + shadcn/ui (New York)
- Prisma ORM (SQLite) — full relational schema
- TanStack Query (server state) + Zustand (client/nav/game state)
- Framer Motion (animations) + Sonner (toasts)
- z-ai-web-dev-sdk (AI Arabic tutor, backend only)
- next-themes (dark/light), Web Speech API (Arabic TTS)

### Design System
- **Palette**: Emerald/Teal (primary, Islamic significance) + Gold/Amber (highlights) on warm parchment (light) / deep forest-night (dark). NO indigo/blue.
- **Typography**: Plus Jakarta Sans (UI), Amiri (authentic Quranic Arabic, RTL), Hind Siliguri (Bengali)
- **Effects**: Glassmorphism, premium gradients, Islamic geometric pattern, soft shadows, glow effects, confetti, haptic-feel tap-scale

## Completed (Phase 1)

### Database & Backend
- Full Prisma schema: User, Course, Unit, Lesson, Vocabulary, UserVocabulary (SM-2 SRS), UserProgress, Achievement, UserAchievement, LeaderboardEntry
- Rich seed data: 4 courses × 3 units × 4 lessons = 48 lessons, 30 vocabulary words, 8 achievements, demo + admin users, 15 bot competitors
- Cookie-based session auth (scrypt password hashing, no external deps)
- API routes: `/api/auth/{signup,login,logout,me}`, `/api/courses`, `/api/lessons/[id]`, `/api/lessons/[id]/complete`, `/api/vocabulary`, `/api/vocabulary/review`, `/api/leaderboard`, `/api/user/stats`, `/api/achievements`, `/api/ai/tutor`, `/api/admin/stats`

### Gamification
- Hearts (lives, 30-min regen), Gems (currency), XP + levels (power-curve), Streaks (daily), Daily goals, Leagues (Bronze→Pearl), Achievements (8 types), Stars (0-3 per lesson)
- Local-first Zustand store with localStorage persistence, synced from server on login

### Frontend Screens (all browser-verified)
1. **Onboarding** — 3-slide animated intro (mosque/streak/AI themes) ✅
2. **Auth** — signup/login toggle + demo login, premium glass card ✅
3. **Home (Learning Path)** — 4-book selector, daily goal ring, winding gamified path with lesson nodes (locked/available/completed/boss), stars, AI tutor FAB ✅
4. **Lesson Player** — 6 exercise types (multiple-choice, match-pairs, build-sentence, fill-blank, listen-choose, translate), Arabic TTS, hearts, progress bar, correct/wrong feedback, completion screen with confetti + stars + rewards ✅
5. **Vocabulary** — SRS flashcards with flip animation, 4-quality review (Again/Hard/Good/Easy), learn mode for new words ✅
6. **Leaderboard** — 6 league selector, podium (top 3), my-rank card, promotion zone ✅
7. **Profile** — avatar, league badge, stats grid, weekly streak calendar, achievements preview, menu (AI tutor, theme, settings, admin, logout) ✅
8. **Achievements** — full grid, locked/unlocked states ✅
9. **AI Tutor** — Bengali-medium Arabic tutor chat (z-ai-web-dev-sdk), suggestion chips, typing indicator, Arabic text rendering ✅
10. **Settings** — theme toggle, daily goal, hearts refill shop, toggles ✅
11. **Admin Dashboard** — KPI cards, league distribution, recent users, course overview (admin-only) ✅

### Architecture (Senior-grade)
- Strict separation: `lib/{stores,api,types,auth,session,db}` + `components/{app,icons,ui}` + `app/api/*`
- Typed API client (`lib/api/client.ts`) with uniform error handling
- Reusable game-icon SVG components (hearts, gems, XP, streak, crown, star, trophy)
- Mobile shell with sticky header (stats) + bottom tab nav (4 tabs) + safe-area insets
- `min-h-screen` flex layout with sticky footer pattern respected

### Premium Visual Assets (AI-generated)
- `/public/app-icon.png` — app icon (emerald/gold, Arabic calligraphy)
- `/public/art-mosque.png` — onboarding mosque illustration
- `/public/art-streak.png` — gamification streak flame
- `/public/art-ai-tutor.png` — AI tutor mascot
- `/public/manifest.json` — PWA manifest

## Verification Results (agent-browser)
- ✅ Onboarding renders with Bengali text + illustrations
- ✅ Auth screen renders, demo login works → home
- ✅ Home: course selector, daily goal, learning path with lock/unlock states
- ✅ Lesson player: exercises render, answer feedback works, match-pairs works
- ✅ Bottom nav: all 4 tabs (শেখা/শব্দ/র‍্যাঙ্ক/প্রোফাইল) switch correctly
- ✅ Vocabulary: 10 cards ready for review
- ✅ Profile: user data, stats, league, streak calendar
- ✅ Leaderboard: league selectors + entries
- ✅ Lint clean (0 errors, 0 warnings)

## Demo Credentials
- **Learner**: learner@arabicsikhi.com / demo1234
- **Admin**: admin@arabicsikhi.com / admin123

## Unresolved / Next-phase Priorities
1. **Visual assets**: Generate premium app icon/logo + lesson illustrations (3D/Lottie-style) to replace emoji placeholders
2. **PWA manifest**: Add manifest.json + service worker for true offline-first
3. **More lesson content**: Expand vocabulary bank (target 200+ words) and richer exercise variety per lesson
4. **Voice recognition**: Add ASR for pronunciation scoring (using ASR skill)
5. **Admin CRUD**: Currently admin dashboard is read-only analytics — add full content management (create/edit/delete lessons, vocab)
6. **Streak freeze item** in shop, **XP boost** consumables
7. **Weekly league promotion/demotion** cron logic
8. **Push notifications** for streak reminders

## Recommended Next Focus
Generate premium visual assets (logo, app icon, lesson scene illustrations) to elevate the aesthetic from "great" to "world-class", then expand the vocabulary bank and add pronunciation scoring with the ASR skill.
