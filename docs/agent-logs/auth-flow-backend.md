# Agent Log: Auth Flow Backend (Phase 2)

**Date:** 2026-07-07  
**Feature:** F-02 — Auth Flow  
**Branch:** `backend`  
**Status:** ✅ Complete

---

## What Was Built

### Finding
The auth pages (`/login`, `/register`, `/forgot-password`) already had fully working Supabase client-side auth logic — email/password login, registration with email confirmation, Google OAuth, and password reset. Only the server-side session management and UI integration were missing.

### New Files

| File | Purpose |
|---|---|
| `middleware.ts` | Next.js middleware — refreshes Supabase session on every request, protects routes |
| `hooks/useAuth.ts` | Client-side hook — `{ user, loading }` with cross-tab sync via `onAuthStateChange` |
| `app/actions/auth-actions.ts` | `logout()` server action — signs out server-side, clears cookies, redirects to `/` |

### Modified Files

| File | Changes |
|---|---|
| `components/layout/Navbar.tsx` | Auth-aware: shows user avatar + dropdown (Dashboard, Bookings, Sign Out) when logged in; original "Log in / Join Free" buttons when not. Responsive mobile menu included. |

### Applied SQL

| Script | Target |
|---|---|
| `lib/db/migrations/supabase_trigger_profiles.sql` | Run in Supabase SQL Editor — auto-creates `profiles` row on user signup |

---

## Key Decisions

1. **No server actions for login/register/reset.** The existing client-side Supabase calls (`signInWithPassword`, `signUp`, `resetPasswordForEmail`) already work. Adding server actions would be redundant complexity.

2. **Middleware for route protection, not layout-level checks.** The middleware handles session refresh and redirects in one place, before any page renders. Admin role checking is deferred to the admin layout since reading the `profiles.role` from middleware's edge runtime would add complexity.

3. **`useAuth` hook is intentionally minimal.** Returns only `{ user, loading }` — no profile data, no role. Role checks happen server-side. This keeps the hook fast and avoids extra round-trips.

4. **Loading skeleton in Navbar.** Shows a pulsing circle while auth state loads to prevent the flash of "Log in / Join Free" → user avatar on page load.

---

## Gotchas

- **Next.js 16 deprecation:** `middleware.ts` is deprecated in favor of `proxy`. The middleware still works but emits a console warning. Migration to `proxy` can be done in a future chore.
- **Dev server restart required:** Adding `middleware.ts` while the dev server is running doesn't hot-reload. Must restart `npm run dev`.
- **Profiles trigger:** Must be manually run in Supabase SQL Editor before testing registration. Without it, sign-ups succeed in `auth.users` but no `profiles` row is created, which breaks Drizzle queries that JOIN on `profiles`.

---

## How to Extend

- **Add admin role guard:** In `app/admin/layout.tsx`, query `profiles.role` via Drizzle and redirect non-admins.
- **Add user profile page:** Create `/settings` page, use `useAuth` for user info, add a server action for profile updates.
- **Migrate to `proxy`:** When ready, follow [Next.js docs](https://nextjs.org/docs/messages/middleware-to-proxy) to convert `middleware.ts` to the new `proxy` convention.

---

## Files Index

```
client/
├── middleware.ts                          ← NEW: session refresh + route guards
├── hooks/
│   └── useAuth.ts                        ← NEW: client-side auth hook
├── app/
│   └── actions/
│       └── auth-actions.ts               ← NEW: logout server action
├── components/
│   └── layout/
│       └── Navbar.tsx                    ← MODIFIED: auth-aware user menu
└── lib/
    └── db/
        └── migrations/
            └── supabase_trigger_profiles.sql  ← Applied to Supabase DB
```
