# ARCHITECTURE.md — Pickle All System Design

> **Status:** Living document — update whenever a structural decision is made.  
> **Audience:** AI coding agents, lead developers, new contributors.

---

## 1. Project Overview

**Pickle All** is a mobile-first responsive web application that connects pickleball players with court facilities in the Philippines. It provides real-time court discovery, booking management, equipment listings, court reviews, and admin oversight in a single unified platform.

---

## 2. Technology Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Frontend Framework | Next.js | 16.x (App Router) |
| UI Language | TypeScript + React | React 19 |
| Styling | Tailwind CSS v4 | Utility-first, mobile-first |
| Backend / BaaS | Supabase | Auth, Storage, Realtime (Postgres managed separately via Drizzle) |
| Database | PostgreSQL | Managed by Supabase |
| ORM | Drizzle ORM | Type-safe DB queries; all DB reads/writes in RSC and Route Handlers |
| Auth | Supabase Auth | Email+Password + OAuth (Google) |
| File Storage | Supabase Storage | Court images, profile photos |
| Realtime | Supabase Realtime | Live availability updates (via Supabase JS client) |
| Deployment | Vercel (frontend) | Environment vars via Vercel dashboard |
| Package Manager | npm | Lockfile committed |
| Linting | ESLint (Next.js config) | v9 |

---

## 3. Monorepo Structure

```
pickle-LARP/                  ← repo root
├── client/                   ← Next.js 16 App Router frontend
│   ├── app/                  ← Route segments (pages, layouts, loading, error)
│   │   ├── (auth)/           ← Route group: login, register, forgot-password
│   │   ├── (guest)/          ← Route group: public browse pages
│   │   ├── (customer)/       ← Route group: authenticated user flows
│   │   ├── (admin)/          ← Route group: admin panel
│   │   ├── api/              ← Next.js Route Handlers (server-side API)
│   │   ├── globals.css
│   │   └── layout.tsx        ← Root layout
│   ├── components/           ← Shared UI components
│   │   ├── ui/               ← Primitive, headless-style components
│   │   ├── forms/            ← Reusable form components
│   │   ├── layout/           ← Navbar, Sidebar, Footer
│   │   └── features/         ← Feature-specific composite components
│   ├── lib/                  ← Utility functions and service clients
│   │   ├── db/               ← Drizzle ORM layer
│   │   │   ├── index.ts      ← Drizzle client instance (connects via DATABASE_URL)
│   │   │   ├── schema.ts     ← Drizzle table definitions (source of truth for TS types)
│   │   │   └── migrations/   ← Auto-generated SQL migration files (drizzle-kit)
│   │   ├── supabase/
│   │   │   ├── client.ts     ← Browser-side Supabase client (Auth, Realtime, Storage)
│   │   │   └── server.ts     ← Server-side Supabase client (Auth session only)
│   │   ├── payment/
│   │   │   ├── index.ts      ← PaymentService interface + factory
│   │   │   └── mock.ts       ← Mock implementation (Phase 1)
│   │   └── utils.ts
│   ├── hooks/                ← Custom React hooks
│   ├── types/                ← Global TypeScript interfaces and enums
│   ├── public/               ← Static assets
│   ├── drizzle.config.ts     ← Drizzle Kit configuration
│   ├── AGENTS.md             ← Agent-specific rules for this Next.js version
│   ├── package.json
│   └── tsconfig.json
├── docs/                     ← Project documentation suite (this folder)
│   ├── project_proposal.md
│   ├── schema.md             ← Authoritative normalized DB schema (team-designed)
│   ├── ARCHITECTURE.md       ← (this file)
│   ├── FEATURES.md
│   ├── DATA_MODELS.md
│   ├── API_SPEC.md
│   ├── CODING_STANDARDS.md
│   ├── AGENT_PLAYBOOK.md
│   └── TESTING_STRATEGY.md
└── README.md
```

> **Rule for agents:** The authoritative DB schema is `docs/schema.md`. Drizzle table definitions in `lib/db/schema.ts` must match it exactly. Do not invent table or column names — reference `DATA_MODELS.md`.

---

## 4. Architecture Style

**Frontend-heavy BaaS pattern with a type-safe ORM.** There is no custom application server. Backend logic runs through:

1. **Drizzle ORM** — all database reads and writes on the server side go through Drizzle, giving full TypeScript type safety derived from the schema definition in `lib/db/schema.ts`.
2. **Supabase Auth** — session management, email verification, OAuth. Accessed via the Supabase JS client.
3. **Supabase Row-Level Security (RLS)** — enforces authorization at the database level as a second line of defense, even when queries arrive via Drizzle.
4. **Next.js Route Handlers** (`app/api/`) — thin server-side handlers for operations that must not be exposed client-side (payment webhooks, admin actions).
5. **Supabase Edge Functions** (future) — for complex serverless logic if Route Handlers are insufficient.

```
Browser
  │
  ├──(RSC fetch / Route Handler / Server Action)──→ Next.js App Router (Vercel)
  │                                                       │
  │                                                       ├──→ Drizzle ORM ──→ Supabase Postgres (RLS enforced)
  │                                                       ├──→ Supabase Auth  (session verification)
  │                                                       └──→ Supabase Storage
  │
  └──(client-side auth + realtime)────────────────→ Supabase JS Client
                                                          ├── Auth state (session, user object)
                                                          └── Realtime (WebSocket subscriptions)
```

> **Drizzle vs Supabase JS — the split rule:**
> - **Use Drizzle** → any database query (SELECT, INSERT, UPDATE, DELETE) in RSC or Route Handlers.
> - **Use Supabase JS** → `supabase.auth.*`, `supabase.storage.*`, and Realtime subscriptions in client components.

---

## 5. User Roles and Access Model

| Role | Auth Required | Primary Capabilities |
|---|---|---|
| Guest | No | Browse courts, view court details and reviews |
| User (customer) | Yes (`role = 'user'`) | Book courts via invoices, manage own bookings, write reviews |
| Admin | Yes (`role = 'admin'`) | Court/item management, user suspension, review moderation |

Roles are stored as a `role` field in the `profiles` table (`'user'` or `'admin'`). Enforced via:
1. Supabase RLS policies (DB level).
2. Role checks in Next.js Route Handlers (application level).

---

## 6. Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| App Router vs Pages Router | App Router | Enables React Server Components, server actions, better data-fetching patterns |
| Auth provider | Supabase Auth | Co-located with DB; no extra auth service needed |
| ORM | Drizzle ORM | Full TypeScript inference from schema; no runtime overhead; works with Supabase Postgres via direct connection string |
| Styling | Tailwind CSS v4 | Fast iteration, no CSS-in-JS overhead, mobile-first utilities |
| State management | React Context + Supabase Realtime | Avoid Redux overhead; Supabase Realtime handles live sync |
| Image storage | Supabase Storage | Integrated with RLS; no third-party CDN needed initially |
| Payment | TBD — kept abstract | Placeholder service layer; swap implementation without touching UI |
| Timezone | `Asia/Manila` (UTC+8) | All datetimes stored as UTC in DB; displayed in PH time |

---

## 7. Data Flow: Court Booking (Invoice)

```
User selects court + time slot
  → Client submits booking form
  → Route Handler POST /api/invoices receives request
  → Supabase Auth session verified (server-side, via Supabase JS server client)
  → Drizzle checks for overlapping confirmed invoices on this court
  → Drizzle inserts new invoice with status = 'pending'
  → Payment flow triggered (PaymentService interface)
  → Payment provider webhook → Route Handler → Drizzle updates invoice.status = 'confirmed'
  → Supabase Realtime broadcasts availability change to all subscribed clients
  → Confirmation email sent via Supabase Auth email or SMTP
```

---

## 8. Drizzle ORM Setup Reference

### Installation

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

### `client/lib/db/index.ts` — Drizzle client

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Use the pooler (Transaction mode) URL for Vercel serverless
const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
```

### `client/drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### Common Drizzle commands

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations to the database
npx drizzle-kit migrate

# Open Drizzle Studio (local DB browser)
npx drizzle-kit studio
```

---

## 9. Environment Variables

All secrets are stored in environment variables. Never hardcode credentials.

```env
# Required in client/.env.local
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL (public — safe for browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key (public — safe for browser)
SUPABASE_SERVICE_ROLE_KEY=       # Server-side only — never expose to browser
DATABASE_URL=                    # Supabase Postgres connection string — server-side only, used by Drizzle
```

> **Getting `DATABASE_URL`:** Supabase dashboard → Settings → Database → Connection string (URI mode).  
> Use the **direct connection** for migrations (`drizzle-kit migrate`).  
> Use the **Transaction mode pooler URL** for serverless runtime queries on Vercel.

---

## 10. Future Considerations

- **Supabase Edge Functions** for complex payment webhook handling.
- **Push Notifications** via Supabase + web push API (booking reminders).
- **Map Integration** (e.g., Google Maps API) for location-aware court discovery.
- **Analytics** (e.g., Vercel Analytics or PostHog) for usage tracking.
