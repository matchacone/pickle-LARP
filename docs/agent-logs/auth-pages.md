# Auth Pages — Agent Log

> **Date:** 2026-06-28
> **Feature ID:** F-02 (User Registration & Login)
> **Status:** partial
> **Built by:** AI agent (Antigravity)

---

## What Was Built

Three auth pages — login/register (combined single route), forgot password — plus the Supabase OAuth callback route handler. Login and register share a single page at `/login` implemented as a **full-screen 200vw horizontal carousel**: clicking "Sign up free" slides the entire UI left to reveal the register screen with a mirrored layout; clicking "Sign in" slides it back. Both Google OAuth and email+password flows are wired to Supabase Auth. Password reset sends a Supabase magic-link email.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/app/(auth)/login/page.tsx` | created | Combined login + register carousel page — client component |
| `client/app/(auth)/register/page.tsx` | created | Standalone register page (direct-URL access); kept for `/register` route |
| `client/app/(auth)/forgot-password/page.tsx` | created | Password reset — email input + success state |
| `client/app/api/auth/callback/route.ts` | created | Supabase OAuth code exchange; supports `?next=` redirect param |
| `client/app/globals.css` | modified | Added `.input`, `.spinner`, `@keyframes spin`, `@keyframes fadeUp`, `@keyframes slideFromRight`, `@keyframes slideFromLeft`, `.animate-*` utilities |

---

## How It Works

### Login / Register carousel (`/login`)
1. Page loads with `view = 'login'` state.
2. Layout is a `200vw` wide flex container. Left half = Screen 1 (dark panel + login form). Right half = Screen 2 (register form + dark panel, mirrored).
3. `transform: translateX(0)` shows Screen 1. `translateX(-50%)` shifts to Screen 2.
4. Transition: `0.55s cubic-bezier(0.76, 0, 0.24, 1)` — premium easing.
5. On login submit: `supabase.auth.signInWithPassword()` → on success `router.push('/courts'); router.refresh()`.
6. On register submit: `supabase.auth.signUp()` with `emailRedirectTo` pointing to `/api/auth/callback` → on success shows inline email-sent confirmation state (no navigation).
7. Google OAuth: `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: origin + '/api/auth/callback' })`.

### OAuth callback (`/api/auth/callback`)
1. Supabase redirects here with `?code=...` after Google consent or email link click.
2. `supabase.auth.exchangeCodeForSession(code)` — sets the session cookie.
3. Redirects to `?next=` param value (default `/courts`).
4. On failure: redirects to `/login?error=auth_callback_failed`.

### Forgot password (`/forgot-password`)
1. `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/api/auth/callback?next=/update-password' })`.
2. Shows success state (no navigation). User clicks the email link which hits the callback route with `?next=/update-password`.
3. `/update-password` page is **not yet built** — see Known Gaps.

---

## Key Decisions

- **Login and register are one page at `/login`, not two.** The carousel UX requires them to share state (view toggle, OAuth loading). The standalone `/register/page.tsx` still exists for direct URL access but has no carousel.
- **`200vw` container, `translateX(-50%)`** — not `translateX(-100vw)`. The container is `200vw` wide, so 50% of it equals one full viewport. Using `vw` units directly in `translateX` would also work but is less portable.
- **`height: 100dvh`** — used instead of `100vh` to correctly handle mobile browser chrome (address bar). Important for iOS Safari.
- **Google OAuth requires Supabase redirect URL registration.** The URL `http://localhost:3000/api/auth/callback` (and the production equivalent) must be added to Supabase Dashboard → Auth → URL Configuration → Redirect URLs. Without this, OAuth fails silently.
- **`router.refresh()` after login** — this is required to re-render all RSC on the page with the new session cookie. Without it, the server components show the pre-auth state.
- **No middleware yet.** Protected routes are not guarded. Any unauthenticated user can navigate to `/dashboard` or `/admin`. Auth middleware (`client/middleware.ts`) must be added before launch.

---

## API Routes Added or Changed

| Method | Path | Change |
|---|---|---|
| GET | `/api/auth/callback` | Created — Supabase OAuth + email confirmation code exchange |

---

## Known Gaps and Gotchas

- **`/update-password` page does not exist.** The forgot-password flow sends the user to `/update-password` after clicking the email link, but this page has not been built. Without it, the reset link lands on a 404. Build it next: call `supabase.auth.updateUser({ password: newPassword })` in a client component.
- **No auth middleware.** Protected routes (dashboard, admin, booking) are accessible to unauthenticated users. Add `client/middleware.ts` using `@supabase/ssr` session check before any protected feature is built.
- **Standalone `/register` page is not carousel-aware.** If a user navigates directly to `/register`, they see the standalone form (no slide animation). This is acceptable for now but may create UX inconsistency.
- **OAuth `provider: 'google'` requires Google OAuth app credentials** configured in Supabase Dashboard → Auth → Providers → Google. Without this, the Google button will redirect to a Supabase error page.
- **No `username` input on register.** The profiles trigger generates a username from the email prefix. Users need a settings page to change it. This is intentional but must be tracked.
- **Error messages from Supabase are raw strings** (e.g. "Invalid login credentials"). Consider mapping them to friendlier messages before launch.

---

## How to Extend This

- **Add `/update-password`:** create `client/app/(auth)/update-password/page.tsx`, call `supabase.auth.updateUser({ password })` in a form submit handler.
- **Add auth middleware:** create `client/middleware.ts` — use `createServerClient` from `lib/supabase/server.ts`, check `getUser()`, redirect unauthenticated users to `/login?next=<currentPath>`. Pass `next` param through the callback route.
- **Add more OAuth providers:** just add another button calling `signInWithOAuth({ provider: 'github' | 'facebook' })` — the callback route already handles any provider.
- **Wire `?error=auth_callback_failed`:** on `/login` page, read `searchParams.error` and display an error banner if present.
