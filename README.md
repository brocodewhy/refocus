# REFOCUS — Firebase Auth + Supabase database

**Notice. Refocus. Continue.**

This Next.js 14 student digital-wellbeing prototype uses Firebase Authentication for Google sign-in and secure Next.js server routes for Supabase data access. It is configured for Vercel deployment without Firebase Cloud Functions.

## Before starting

- Keep a backup of your current repository.
- Node.js 20+ and npm.
- Firebase project with Google provider enabled.
- Supabase project with the existing `focus_sessions` and `usage_entries` tables.

## 1. Install packages

From this folder (the one containing `package.json`):

```bash
npm install
```

## 2. Configure local environment

Copy `.env.local.example` to `.env.local`. Fill in:

- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` from Firebase Project settings → Your apps.
- `NEXT_PUBLIC_SUPABASE_URL` from Supabase Project Settings → API.
- `SUPABASE_SERVICE_ROLE_KEY` from Supabase Project Settings → API Keys. It is a secret/server-only key. Never prefix it with `NEXT_PUBLIC_`, commit it, or expose it to the browser.
- `FIREBASE_SERVICE_ACCOUNT_JSON`: paste the downloaded Firebase service-account JSON as a single-line JSON value. Alternatively set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` (the private key's line breaks can be represented as `\n`). Never commit this credential.

Keep `.env.local` out of Git. The provided `.gitignore` ignores it.

## 3. Configure Firebase Google sign-in

In Firebase Console → Authentication → Sign-in method, enable Google. In Authentication → Settings → Authorized domains, add your production Vercel domain (for example `your-app.vercel.app`) and `localhost` if missing. Do not configure a separate Google OAuth provider in Supabase for this setup.

## 4. Apply the database migration carefully

**Back up your Supabase database first.** Then open `supabase/firebase-auth-migration.sql` in Supabase SQL Editor and run it once. It changes `user_id` from UUID to text (Firebase UIDs are strings), drops the old foreign keys to `auth.users`, removes client-role policies, and keeps RLS enabled. Existing rows are preserved but old Supabase UUID rows are not automatically mapped to Firebase accounts.

The app uses the Supabase service-role/secret key only inside server code. All server data queries filter by the verified Firebase UID; do not create a browser Supabase client with the service-role key.

## 5. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`. Test Google login, logout, focus session save, usage entry create/list/delete, and confirm one account cannot see another account's rows.

## 6. Configure Vercel

In Vercel → Project → Settings → Environment Variables, add the same environment variables from `.env.local` for Production (and Preview if needed). Use the Vercel project's production domain in Firebase Authentication → Authorized domains. Redeploy after changing variables.

## Security architecture

- Firebase client SDK signs in with Google.
- The browser posts a Firebase ID token to `/api/auth/session`.
- Next.js verifies the ID token with Firebase Admin and sets an HTTP-only, secure-in-production, SameSite=Lax session cookie.
- Protected server layout verifies that cookie. API routes verify the same session before data access.
- Supabase service key is server-only. Each query is scoped by the verified Firebase UID. RLS remains enabled and has no browser-access policies for these tables.

## Pages

- `/login` — Firebase Google sign-in
- `/dashboard` — focus overview and chart
- `/focus` — timer and server-side session saving
- `/streaks` — saved-session streaks
- `/wellbeing` — manual screen-time logging
- `/goals` — local browser study planner
- `/settings` — local browser preferences

## Known limitations

- Usage tracking is manual; a web app cannot automatically read other apps' screen time.
- Goals, reminder preference, and appearance preference remain localStorage-only.
- The reminder setting is a preference toggle, not an operating-system notification.
- You must configure the environment variables and run the SQL migration before database features work. This bundle cannot be tested against your private Firebase/Supabase projects from here.

## REFOCUS upgrade notes

This version includes a custom-duration focus timer, a dedicated customizable Pomodoro page, a visible CSS-based weekly focus chart, local habit tracking, an editable study goal and task planner, improved manual screen-time logging, global light/dark appearance, an animated page transition, and a profile editor.

### Database migration

The app uses Firebase session authentication and server-side Supabase access. For an existing database, review and run `supabase/firebase-auth-migration.sql` in the Supabase SQL Editor after taking a backup. It adds `firebase_uid` columns while preserving legacy columns. If your live database already has these columns/indexes, do not rerun any destructive migration from older branches. The app expects a unique index on `(firebase_uid, app_name, entry_date)` for idempotent extension syncing.

### Persistence notes

- Focus sessions and extension/manual usage entries are stored in Supabase.
- The study goal, daily plan, habits, theme preference, and profile name/photo are stored in the current browser's local storage. They do not sync between browsers/devices yet.
- Profile photo uploads are limited to 1.5 MB to avoid exceeding browser storage limits.
- Pomodoro intervals can be customized. Completed focus intervals are saved as focus sessions; break intervals are not.
- Manual screen-time logging adds minutes to an existing app/date entry. Chrome extension sync replaces the stored value with its cumulative daily total.

### Validation

TypeScript check: `npx tsc --noEmit`.
A production build should be run in the user's environment after installing dependencies with `npm ci`; this environment could not download Next.js's native SWC binary because network access to npm was unavailable.
