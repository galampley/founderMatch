## Technical Architecture — Where we are today

### Platform and Framework
- React Native app built with Expo SDK ^53 and Expo Router ~5 for navigation
- Targets mobile first; web supported via `react-native-web` and Expo web export
- React 19, React Native 0.79, Reanimated 3, Gesture Handler 2
- Icons via `lucide-react-native`, UI styled with inline StyleSheet (no design system yet)

### Navigation
- Root `Stack` in `app/_layout.tsx` provides two flows:
  - `onboarding/*` stack (welcome → basic-info → photos → prompts → complete)
  - Main `(tabs)` with four tabs: Discover, Messages, Collabs, Profile
- Initial route decision in `app/index.tsx` based on `user.isOnboardingComplete`

### State Management
- Simple global user state via `contexts/UserContext.tsx` using React Context
  - `user: UserProfile | null`, `setUser`, and `updateUser(updates)` merge-only
  - User model in `types/user.ts`
  - No persistence; all data is in-memory for demo; logs to console

### Data and Backend
- No backend integration yet
  - Discover, Messages, Chat, and Collabs use local sample arrays for demo data
  - No network, auth, or storage; no persistence across reloads

### Key Screens
- Discover (`app/(tabs)/index.tsx`):
  - Swipe-left style dismissal using `react-native-gesture-handler` + `reanimated`
  - Tappable sections open a response modal (local Alert + state only)
- Messages (`app/(tabs)/messages.tsx`):
  - List of matches with designations (some manual, some disabled to simulate auto)
  - Navigation to chat at `app/chat/[id].tsx`
- Chat (`app/chat/[id].tsx`):
  - Static per-user dummy messages; send message appends locally
  - Can send a “Collab invite” by selecting from predefined options (no backend)
- Collabs (`app/(tabs)/collabs.tsx`):
  - Catalog of collaboration methods; Active collabs list with progress tracking in local state
  - Detailed modals for methods and active collab steps; criteria completion updates progress
- Profile (`app/(tabs)/profile.tsx`):
  - Renders `user` profile with Photos, Prompts, Basics; local edit modals update context state

### Onboarding Flow
- `onboarding/index.tsx` welcome → `basic-info` → `photos` → `prompts` → `complete`
- Each step writes into `UserContext` via `updateUser`
- Completion sets `isOnboardingComplete` then routes to tabs

### Configuration
- Expo app config in `app.json` (router plugin, typed routes enabled)
- TS strict mode with path alias `@/*` in `tsconfig.json`
- Entry point `package.json` main: `expo-router/entry`; scripts for dev and web build

### Current Limitations / Gaps
- No real authentication, backend API, or database
- No offline/persistence (AsyncStorage/SecureStore) for `user`
- Demo-only media (no real uploads), no push notifications
- Minimal error handling and no analytics/monitoring
- Accessibility and theming are basic; no internationalization

## Near-term Architecture — iOS-first + Supabase

### Distribution (iOS prioritized)
- EAS Build (Expo) for iOS; deliver via TestFlight
  - Internal testing first (no review), expand to external testers after quick Beta App Review
  - Submit for App Store review only when compliant features/policies are in place

### Backend (Supabase)
- Auth: Email OTP/magic link initially; add Apple Sign-In before public App Store
- Database: Postgres with Row-Level Security (RLS)
  - Tables (initial): `profiles`, `matches`, `messages`, `collabs`, `push_tokens`, `attachments`
  - RLS: users can read/write their own profile, read matched profiles, scoped access to conversations/collabs
- Storage: Buckets for profile photos and attachments (public read via signed URLs; write with policy checks)
- Messaging transport: Polling for messages (every 10–15s) using `updated_at` cursors; Real-time optional later
- Edge Functions: server-side actions (e.g., secure mutations, basic content filters). Defer advanced moderation initially
- Cron: defer initially (no scheduled jobs for MVP)
- Region: choose closest to target users (e.g., `us-east-1`)

### Hosting
- Mobile app: distributed via TestFlight (no hosting needed)
- Marketing site + admin (optional now): Vercel
  - Domain/DNS on Cloudflare (optional) for fast propagation and security
  - If adding Expo Web later, export static web and host on Vercel/Cloudflare Pages
  - Defer marketing site for MVP; do not block TestFlight

### Web App (PWA)
- Delivery: Expo Web export hosted on Vercel or Cloudflare Pages (gives an installable PWA)
- Auth: add site URL to Supabase redirect URLs; web uses same magic-link flow (no native deep link)
- PWA UX: ensure manifest/icons/splash; lightweight “Install app” CTA; skip web push for MVP
- File uploads: use file input fallback; client-side image compression (~1080px, JPEG ~0.7)
- Messaging: same polling loop (10–15s) with updated_at cursor; pause on background tabs
- UI tweaks: keep gestures but add click/tap controls; verify modals/scroll on Safari/Chrome
- Analytics/errors: same events; enable Sentry for web build

### Push Notifications
- Expo Notifications + APNs
  - Capture Expo push tokens, store in `push_tokens`
  - Send through Expo Push API; later migrate to direct APNs if needed

### Observability and Quality
- Sentry for React Native + source maps via EAS
- Basic analytics (PostHog/Amplitude/Segment) for funnel tracking
  - Track: `onboarding_started`, `onboarding_completed`, `discover_view`, `profile_like`, `profile_pass`, `message_sent`, `collab_proposed`, `crash`

### MVP UX/Resilience
- Basic error handling: small error utility, try/catch around network calls, user-friendly toasts/snackbars
- Image compression/optimization: downscale to max ~1080px, JPEG quality ~0.7; convert HEIC→JPEG on iOS before upload
- Optimistic UI: apply to message send, profile edits, collab status; rollback on failure and ensure idempotency

### Integration plan (incremental)
1) Supabase project + schemas + minimal RLS
2) Wire app to Supabase for Auth and Profiles; configure deep links (app.json scheme + Supabase redirect URLs) and handle via expo-linking/expo-router
3) Replace local lists with Supabase-backed: Discover, Messages, Chat (messages use polling loop with `updated_at` cursor; pause on background; backoff on failures)
4) Store photos in Supabase Storage; pre-upload compression; serve via signed URLs
5) Add push token capture and basic notifications
6) EAS iOS build → TestFlight (internal) → external beta

### Alternative rollout — Web-first then iOS fast-follow
- Week 0 (days 1–3): ship PWA MVP on Vercel; collect feedback/analytics; iterate daily
- Week 0 (days 3–5): stabilize auth/redirects, image uploads, polling; prepare iOS build
- Week 1: EAS build → TestFlight internal; expand to external testers after quick beta review

### Risks/Constraints to watch
- App Store policies: UGC requires report/block and moderation stance + privacy policy before public App Store release (TestFlight OK to start with basic profanity filter)
- Deep linking: magic-link flow must be tested on-device; ensure scheme/redirects are correct
- iOS media permissions and link handling for auth
- Real-time vs. battery/network usage trade-offs; consider optimistic UI and background fetch

### Open decisions
- Analytics platform: choose one (PostHog vs Amplitude vs Segment-first) --> Amplitude
- Supabase region: finalize (default `us-east-1` unless user geography says otherwise) --> US West
- Profanity filter approach: simple client/server wordlist now; when to add report/block UI --> Simplest is best
- PWA rollout timing: Day 0 alongside iOS TestFlight vs Week 1 fast-follow --> Day 0

### MVP success metrics
- Onboarding completion rate (started → completed)
- Time-to-first-message and first-message rate after onboarding
- Time-to-first-collab proposal and proposal acceptance rate
- D1 and D7 retention; DAU/WAU; message sends per active user
- Crash rate and error rate on critical flows (auth, upload, chat)

### Test matrix
- Platforms/browsers: iOS latest + previous major; Safari and Chrome on macOS; Mobile Safari on iOS
- Smoke tests:
  - Magic-link sign-in deep link end-to-end
  - Photo select → compression → upload → display
  - Discover browse + like/pass via tap and gesture
  - Messages polling: send/receive; backoff on network errors
  - Collab proposal flow and progress updates
  - PWA install prompt and launch on supported browsers
