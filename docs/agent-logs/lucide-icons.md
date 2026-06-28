# Lucide React Icons — Agent Log

> **Date:** 2026-06-29
> **Feature ID:** N/A (cross-cutting concern — affects all pages)
> **Status:** complete
> **Built by:** AI agent (Antigravity)

---

## What Was Built

Replaced all functional inline SVG icons across every page and component with `lucide-react` equivalents. The custom brand SVG art (PickleAll court-lines logo, Google OAuth icon, decorative aerial court illustration, background court art in auth panels) was intentionally preserved — those are brand marks, not UI icons. The `lucide-react` npm package was installed as a production dependency.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/package.json` | modified | Added `lucide-react` as production dependency |
| `client/components/layout/Navbar.tsx` | modified | Hamburger: `Menu` / `X` |
| `client/components/features/CourtCard.tsx` | modified | Location pin: `MapPin` |
| `client/components/features/CourtGrid.tsx` | modified | Search: `Search`; Sort: `SlidersHorizontal`; Chevron: `ChevronDown`; Empty state: `SearchX` |
| `client/app/(guest)/courts/page.tsx` | modified | Hero search: `Search` |
| `client/app/page.tsx` | modified | Find Courts button: `Search`; Location: `MapPin`; Steps: `Search`, `Calendar`, `Trophy` |
| `client/app/(auth)/login/page.tsx` | modified | Bullet check: `Check`; Success state: `CircleCheck` |
| `client/app/(auth)/register/page.tsx` | modified | Bullet check: `Check`; Success state: `CircleCheck` |
| `client/app/(auth)/forgot-password/page.tsx` | modified | Back arrow: `ChevronLeft`; Header icon: `Mail` |

---

## How It Works

All replaced icons are imported directly from `lucide-react` at the top of each file:

```typescript
import { Search, MapPin } from 'lucide-react'
```

Each icon is rendered as a React component with `size` (px number) and optional `aria-hidden="true"` or `color` props:

```tsx
<Search size={16} aria-hidden="true" />
<MapPin size={12} aria-hidden="true" />
<Check size={10} color="#D1FE00" strokeWidth={2.5} aria-hidden="true" />
```

Lucide components accept standard HTML attributes and className for Tailwind styling:

```tsx
<ChevronDown
  size={12}
  aria-hidden="true"
  className={`transition-transform duration-150 ${sortOpen ? 'rotate-180' : ''}`}
/>
```

---

## Key Decisions

- **`lucide-react` is the shadcn/ui standard icon library.** The user requested "shadcn icons" — shadcn/ui ships no icon set of its own; it documents and uses Lucide as its icon system. Lucide is the correct choice.
- **Brand SVGs are preserved.** The PickleAll court-lines logo (Navbar, auth panels, footer), the Google OAuth coloured icon, and the decorative court art SVGs (aerial view in landing hero, auth panel background) are intentional brand marks. Replacing them with generic Lucide icons would break visual identity.
- **`aria-hidden="true"` on all decorative icons.** Every replaced icon is decorative (label is on adjacent text). All get `aria-hidden` for screen-reader hygiene.
- **`color` prop used for coloured icons.** Where the original SVG had `stroke="#D1FE00"` (e.g. in auth bullet checks, mail icon), the Lucide `color` prop is used instead of Tailwind classes, keeping the token explicit.
- **`strokeWidth` prop used for weight control.** The bullet `Check` icons at size 10 need `strokeWidth={2.5}` to remain visible at that small size — the Lucide default (1.5) is too thin.

---

## Known Gaps and Gotchas

- **No Lucide icon for pickleball or court.** Lucide does not have a sport-specific pickleball icon. The brand logo SVG remains custom. Do not replace it with a generic `LayoutGrid` or `Table` icon.
- **`Star` imported but not used on landing page.** The import line in `client/app/page.tsx` includes `Star` which is currently unused (rating display still uses `★` text character). Remove it or use it when building star rating UI. ESLint will flag this.
- **Tree-shaking is automatic.** Lucide uses named exports; bundlers tree-shake unused icons. No config needed.
- **`lucide-react` version.** Installed at whatever is latest at time of `npm install`. Check `client/package.json` for the pinned version. If upgrading, verify icon names — some icons were renamed between Lucide major versions (e.g. `SearchX` appeared in v0.263+).

---

## How to Extend This

- To add a new Lucide icon anywhere: `import { IconName } from 'lucide-react'`, render as `<IconName size={N} aria-hidden="true" />`.
- Full icon browser: https://lucide.dev/icons
- If an icon doesn't exist in Lucide, use a custom inline SVG and document it here.
- To replace the brand logo with a proper SVG file: create `client/public/logo.svg`, import with `next/image`, and update Navbar, auth panels, and footer simultaneously.
