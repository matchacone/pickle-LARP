# TESTING_STRATEGY.md — Pickle All Testing Approach

> **Status:** Planned — tests to be written alongside features, not after.  
> **Audience:** AI coding agents, developers.

---

## 1. Testing Philosophy

- **Test behavior, not implementation.** Tests describe what the user or system can do, not how the code is wired internally.
- **Tests live next to the code.** Co-locate `*.test.ts` files with the source file they test.
- **Agents must write tests.** Every feature implemented by an AI agent must include at minimum a unit test for any business logic function and a happy-path integration test for any Route Handler.

---

## 2. Test Types and Tools

| Type | Tool | What It Tests | Location |
|---|---|---|---|
| Unit | Vitest | Pure functions, utilities, validation logic | Co-located `*.test.ts` |
| Component | React Testing Library + Vitest | UI rendering, user interactions | Co-located `*.test.tsx` |
| Integration | Vitest + Supabase local | Route Handlers with a local Supabase instance | `client/app/api/**/*.test.ts` |
| E2E | Playwright | Full user flows in a browser | `e2e/` (root level) |

---

## 3. Setup

### Vitest Configuration

Add Vitest to the project:

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
```

`client/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})
```

`client/vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

### Playwright Configuration

```bash
npm install -D @playwright/test
npx playwright install chromium
```

`e2e/playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    cwd: '../client',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 4. Unit Tests

Target: **Pure functions and business logic** with no side effects.

### Coverage Targets

| Area | Target |
|---|---|
| `lib/utils.ts` | 100% |
| `lib/payment/` | 90% |
| Validation helpers | 100% |
| Date/time utilities | 100% |

### Example — Currency Formatter

```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency } from './utils'

describe('formatCurrency', () => {
  it('formats PHP amounts with peso sign', () => {
    expect(formatCurrency(500)).toBe('₱500.00')
    expect(formatCurrency(1250.5)).toBe('₱1,250.50')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('₱0.00')
  })
})
```

### Example — Booking Overlap Validator

```typescript
// lib/utils.test.ts
import { hasOverlap } from './utils'

describe('hasOverlap', () => {
  it('returns true for overlapping intervals', () => {
    expect(hasOverlap('08:00', '10:00', '09:00', '11:00')).toBe(true)
  })

  it('returns false for adjacent intervals', () => {
    expect(hasOverlap('08:00', '10:00', '10:00', '12:00')).toBe(false)
  })
})
```

---

## 5. Component Tests

Target: **UI components** — verify rendering, state changes, and user interactions.

### Rules

- Mock Supabase calls with `vi.mock('@/lib/supabase/client')`.
- Do not test implementation details (class names, internal state).
- Test what the user sees and can do.

### Example — CourtCard

```typescript
// components/features/CourtCard.test.tsx
import { render, screen } from '@testing-library/react'
import { CourtCard } from './CourtCard'
import { mockCourt } from '@/test/fixtures'

describe('CourtCard', () => {
  it('displays court name and price', () => {
    render(<CourtCard court={mockCourt} />)
    expect(screen.getByText(mockCourt.name)).toBeInTheDocument()
    expect(screen.getByText('₱250.00/hr')).toBeInTheDocument()
  })

  it('shows Indoor badge when is_indoor is true', () => {
    render(<CourtCard court={{ ...mockCourt, is_indoor: true }} />)
    expect(screen.getByText('Indoor')).toBeInTheDocument()
  })
})
```

### Test Fixtures

Shared mock data lives in `client/test/fixtures/`:

```
client/test/
  fixtures/
    courts.ts     → mockCourt, mockCourts
    facilities.ts → mockFacility
    users.ts      → mockCustomer, mockOwner, mockAdmin
    reservations.ts → mockReservation
```

---

## 6. Integration Tests (Route Handlers)

Target: **Next.js Route Handlers** — verify request validation, auth guards, and response shape.

### Setup

Use Supabase local dev for integration tests:
```bash
npx supabase start   # starts local Supabase on port 54321
```

Set `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321` in `.env.test`.

### Example — POST /api/reservations

```typescript
// app/api/reservations/route.test.ts
import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'

describe('POST /api/reservations', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = new Request('http://localhost/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ court_id: 'uuid', start_at: '...', end_at: '...' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 422 when end_at is before start_at', async () => {
    // ... mock auth, send invalid payload
    const res = await POST(req)
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.code).toBe('INVALID_TIME_RANGE')
  })
})
```

---

## 7. End-to-End Tests

Target: **Critical user journeys** — run in a real browser against the dev server.

### Priority Flows (must have E2E coverage)

| Flow | File |
|---|---|
| Guest browses courts | `e2e/guest-browse.spec.ts` |
| Customer registers and logs in | `e2e/auth.spec.ts` |
| Customer reserves a court | `e2e/reservation.spec.ts` |
| Owner creates a facility | `e2e/owner-onboarding.spec.ts` |
| Admin approves a facility | `e2e/admin-approve.spec.ts` |

### Example — Guest Browse

```typescript
// e2e/guest-browse.spec.ts
import { test, expect } from '@playwright/test'

test('guest can see courts without logging in', async ({ page }) => {
  await page.goto('/courts')
  await expect(page.getByRole('heading', { name: /courts/i })).toBeVisible()
  await expect(page.getByTestId('court-card')).toHaveCount.greaterThan(0)
})

test('guest is prompted to login when clicking Book', async ({ page }) => {
  await page.goto('/courts')
  await page.getByTestId('book-button').first().click()
  await expect(page).toHaveURL(/\/login/)
})
```

---

## 8. What Agents Must NOT Do

- Do not skip writing tests to save time. Every PR must include relevant tests.
- Do not test implementation internals (e.g., checking if a specific function was called unless testing a pure unit boundary).
- Do not use `screen.getByTestId` as the primary query — prefer `getByRole`, `getByText`, `getByLabelText`.
- Do not leave `test.only` or `it.skip` in committed code.

---

## 9. Running Tests

```bash
# From client/ directory:
npm run test          # Run Vitest (unit + component + integration)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report

# From repo root:
npx playwright test   # E2E tests (requires dev server running)
```

Add these scripts to `client/package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```
