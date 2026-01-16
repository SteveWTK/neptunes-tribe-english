# Neptune's Tribe / Habitat Naturalist - Project Summary

## Project Overview
**Habitat Naturalist** is an educational conservation web app built with Next.js 14, Supabase, and NextAuth. It gamifies wildlife observation and learning through:
- Species avatar journeys (users adopt endangered species and help them "recover" by earning points)
- Wildlife observations (photo uploads with species identification)
- Seasonal challenges and bonus tasks
- Community leaderboards
- Educational "Worlds" with lessons

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS with dark mode support
- **Payments**: Stripe (premium subscriptions)
- **Languages**: English (en) and Brazilian Portuguese (pt)

---

## Recent Features Implemented (January 2026)

### 1. Dashboard Onboarding Tour
A sleek tooltip-based tour for new users using `react-joyride`.

**Files:**
- `src/components/onboarding/DashboardTour.js` - Main tour component with 9 steps
- `src/app/(site)/dashboard/page.js` - Added `data-tour` attributes to elements

**Key Features:**
- 9 tour steps: Season Progress, Species Avatar, Settings, Quick Actions, Journey Widget, Wildlife Map, Community Stats, Leaderboard, Observations
- Multi-language support (EN/PT) using `useLanguage` hook
- localStorage tracking (`habitat_dashboard_tour_completed`)
- Custom tooltip with step numbers, progress dots, navigation
- `scrollOffset={100}` prevents elements going under header
- Smooth transitions with `transitionDuration: 600`

**Tour Targets (data-tour attributes):**
```
season-progress, species-avatar, settings-link, quick-actions,
journey-widget, wildlife-map, community-stats, leaderboard, recent-observations
```

### 2. Restart Tour Button
Added to Profile page so users can replay the dashboard tour.

**File:** `src/app/(site)/profile/page.js`
- Button in Account section calls `resetDashboardTour()` and redirects to dashboard

### 3. Comments Feature Fix
Fixed 500 error on observation comments.

**Issue:** Database column named `comment` but code used `content`
**Files Fixed:**
- `src/app/api/observations/[id]/comments/route.js` - Changed insert column
- `src/app/(site)/observations/[id]/page.js` - Changed display from `c.content` to `c.comment`

### 4. Root Domain Redirect Fix
**File:** `src/middleware.js`
- Logged-in users now redirect to `/dashboard` (was `/worlds`)
- Applies to both homepage (`/`) and auth routes (`/login`, `/register`)

### 5. Display Name Prompt
Prompts new users to set their display name on first dashboard visit.

**File:** `src/components/profile/DisplayNamePrompt.js`

### 6. Season Progress Bar
Shows current season progress at top of dashboard.

**File:** `src/components/season/SeasonProgressBar.js`

---

## Key Directory Structure
```
src/
├── app/
│   ├── (landing)/          # Public pages (home, explorers)
│   ├── (site)/             # Protected pages
│   │   ├── dashboard/      # Main user dashboard
│   │   ├── profile/        # User profile & settings
│   │   ├── observations/   # Wildlife observations
│   │   ├── worlds/         # Educational content
│   │   └── avatar-selection/ # Species avatar picker
│   └── api/                # API routes
├── components/
│   ├── onboarding/         # Tour components (DashboardTour, IndividualOnboarding)
│   ├── journey/            # Species journey widgets
│   ├── observations/       # Observation components & map
│   ├── profile/            # Profile components
│   └── season/             # Season progress components
├── lib/
│   ├── auth.js             # NextAuth configuration
│   ├── supabase.js         # Supabase client
│   └── contexts/           # React contexts (LanguageContext, etc.)
└── middleware.js           # Route protection & redirects
```

---

## Database Tables (Supabase)
- `users` - User accounts
- `species_avatars` - Available endangered species
- `user_journeys` - User's selected species and progress
- `observations` - Wildlife photo uploads
- `observation_comments` - Comments on observations (uses `comment` column, not `content`)
- `challenges` - Bonus challenges
- `user_challenges` - User challenge progress

---

## Authentication Flow
1. User visits site → middleware checks auth status
2. If logged in + on `/` or auth routes → redirect to `/dashboard`
3. If not logged in + on protected route → redirect to `/login`
4. New users → shown avatar selection, then dashboard tour

---

## Useful Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
git add .        # Stage changes (fixed nul file issue)
```

---

## Notes
- The `nul` reserved filename issue was fixed by adding it to `.gitignore`
- Tour uses localStorage, not database, for completion tracking
- All new features support dark mode via Tailwind's `dark:` prefix
- Portuguese translations use ASCII (no accents) for compatibility

---

## Pending/Future Work
- Test all tour functionality end-to-end
- Consider adding tour for other pages (Worlds, Observations)
- Mobile responsiveness testing for tour tooltips
