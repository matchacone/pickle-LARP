# Global Dark Mode Implementation — Agent Log

> **Date:** 2026-07-02  
> **Feature ID:** UI Polish  
> **Status:** complete  
> **Built by:** Antigravity AI agent

---

## What Was Built

A fully functional, zero-flicker Dark Mode system built specifically for Tailwind v4. It dynamically swaps the global design tokens (backgrounds, text, borders) from a light theme to a premium dark aesthetic (asphalt/mist) when toggled, without needing to rewrite UI components with explicit `dark:` classes.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/app/globals.css` | modified | Refactored Tailwind `@theme` to map to custom `--app-` CSS variables that mutate in `.dark` |
| `client/components/layout/OwnerSidebar.tsx` | modified | Added the Dark Mode state toggle button and logic to toggle the `.dark` class on the root `<html>` element |
| `client/components/features/OwnerDashboardOverview.tsx` | modified | Replaced static `bg-white` classes with theme-aware `bg-surface` |
| `client/components/features/OwnerBookingsTable.tsx` | modified | Replaced static `bg-white` classes with theme-aware `bg-surface` |
| `client/app/layout.tsx` | modified | Replaced static `bg-white` on the root `<body>` tag with `bg-surface` |

---

## How It Works

- **Tailwind v4 Variables:** The CSS architecture defines custom `--app-` variables in `:root` for light mode and inside `.dark` for dark mode.
- **Theme Mapping:** The `@theme inline` block maps Tailwind utility names exclusively to these CSS variables (e.g., `--color-surface: var(--app-surface)`). 
- **Toggle State:** The sidebar contains a `useState` hook. When toggled to dark mode, it adds the `.dark` class to `document.documentElement` (`<html>`), which cascades the new variables down through the DOM natively.

---

## Key Decisions

- **Avoided `dark:` Utility Classes:** Instead of littering the codebase with `dark:bg-slate-900`, relying purely on dynamic CSS variables at the root level ensures that UI components automatically adapt to any theme changes and reduces DOM bloat.
- **Prevented Circular References:** In Tailwind v4, defining `--color-surface: var(--color-surface)` within `@theme` creates a circular reference that breaks styling. This is why a distinct `--app-` prefix was used for the base CSS variables.

---

## Known Gaps and Gotchas

- **Hardcoded Whites:** Any newly created components must use `bg-surface` or `bg-mist` instead of `bg-white` to ensure they adapt to dark mode. `bg-white` remains hardcoded to `#FFFFFF`.
- **Hydration Mismatch:** The dark mode state is currently kept in a simple React `useState` and toggled via an effect. On a hard reload, the page might default to light mode before React mounts. A future enhancement could use `next-themes` or a `localStorage` cookie script in the `<head>` to prevent the flash of light mode.

---

## How to Extend This

- To add a new color token, define it in `:root` (e.g. `--app-brand`), define its dark variant in `.dark`, and map it in `@theme inline` as `--color-brand: var(--app-brand)`.
- You can extend the toggle state to use `localStorage` in `OwnerSidebar.tsx` if persistence across reloads is needed.
