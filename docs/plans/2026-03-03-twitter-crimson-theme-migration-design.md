# Theme Migration Design: Twitter-Crimson Preset
**Date:** March 3, 2026  
**Status:** Approved — ready for implementation  
**Scope:** Moderate (globals.css + shadcn component files + per-page cleanup)

---

## Problem Statement

The current tele-crm light mode has cards that blend into the page background because:
1. `Card` component uses Tailwind's `shadow-sm` (`0 1px 2px rgba(0,0,0,0.05)`) — nearly invisible.
2. Background is `#fdfdfd` and Card is `#FFFFFF` — a difference of ~1 lightness unit, imperceptible.
3. `--radius: 0.75rem` produces 20px rounded cards/buttons that feel too bubbly for a finance CRM.

Additionally, the full shadcn component set (badge, button) has drifted from upstream shadcn defaults, missing features like `shadow-xs` on buttons, `border`+`overflow-hidden` on badges, and focus ring improvements.

---

## Approved Design: Twitter-Crimson Preset

### Color Strategy

**Light mode:**
- Page background (`--void`, `--background`): `#f7f8f8` — slightly warm gray (Twitter's sidebar color used as BG)
- Card (`--card`): `#ffffff` — pure white; floats above the gray background
- Sidebar (`--base`): `#f0f3f7` — slightly cooler gray; distinguishes sidebar from content
- Shadow: `--shadow-card` stays strong (multi-layer) so cards pop visually even without color contrast alone
- Primary: `#DC2626` (crimson, unchanged)
- Border: `#e1eaef` (Twitter's clean border, slightly more blue-tinted than current `#e7e7ee`)

**Dark mode (Twitter dark):**
- Background: `#000000` — pure black (Twitter DM's dark mode)
- Card: `#17181c` — very dark gray (Twitter's card surface)
- Sidebar: `#16181c` — nearly identical to card (unified feel)
- Border: `#2f3336` (Twitter dark border)
- Keeps current crimson brand

**Radius:**
- `--radius: 0.4rem` (≈6.4px) — the one source of truth
- `@theme inline` radius tokens derived: `--radius-sm: calc(var(--radius) - 2px)`, `--radius-md: var(--radius)`, `--radius-lg: calc(var(--radius) + 2px)`, `--radius-xl: calc(var(--radius) + 6px)`
- `.surface-card` and `.kpi-card` `border-radius` updated to use `var(--radius-xl)` (was hardcoded 20px)

### Shadow System (Light Mode Card Pop)

```
--shadow-card:  0 1px 0 rgba(0,0,0,0.03), 0 2px 8px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.06);
--shadow-hover: 0 2px 4px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.11), 0 0 0 1px rgba(15,23,42,0.07);
```

Card component changes from `shadow-sm` → `shadow-[var(--shadow-card)]`.

---

## Token Mapping: Before → After

### Light Mode (`:root`)

| Token | Before | After | Note |
|---|---|---|---|
| `--radius` | `0.75rem` | `0.4rem` | Tighter radius |
| `--void` (background) | `#fdfdfd` | `#f7f8f8` | Warm gray creates card contrast |
| `--base` (sidebar) | `#f5f8fb` | `#f0f3f7` | Slightly cooler sidebar |
| `--card` | `#FFFFFF` | `#FFFFFF` | Stays pure white |
| `--elevated` | `#FFFFFF` | `#FFFFFF` | Same |
| `--overlay` | `#f5f5f5` | `#f0f0f0` | Slightly more defined |
| `--border-subtle` | `#e7e7ee` | `#e1eaef` | Twitter's cleaner blue-tinted border |
| `--border-default` | `#ebebeb` | `#e5e8ed` | Slightly stronger |
| `--sidebar` (shadcn) | `hsl(210 40% 98%)` | `#f0f3f7` | Align to new base |

### Dark Mode (`.dark`)

| Token | Before | After | Note |
|---|---|---|---|
| `--void` | `#1a1b1e` | `#000000` | Twitter pure black |
| `--base` | `#161618` | `#16181c` | Twitter sidebar |
| `--card` | `#222327` | `#17181c` | Twitter card surface |
| `--elevated` | `#2a2c33` | `#1e2025` | Twitter popover |
| `--overlay` | `#2a2c33` | `#1e2025` | Same |
| `--border-subtle` | `#33353a` | `#2f3336` | Twitter dark border |
| `--border-default` | `#3e4048` | `#38444d` | Twitter input border |
| `--sidebar` (shadcn) | `hsl(240 5.9% 10%)` | `#16181c` | Align |

---

## Component Changes

### `src/components/ui/card.tsx`
- Change `shadow-sm` → `shadow-[var(--shadow-card)]` on the Card wrapper
- No other changes needed

### `src/components/ui/badge.tsx`
- Update `badgeVariants` base to match template:
  - Add `border` to base classes
  - Add `overflow-hidden` to base classes
  - Add `transition-[color,box-shadow]` to base classes
  - `rounded-md` replaces current rounded behavior

### `src/components/ui/button.tsx`
- Add `shadow-xs` to the `default` variant (aligns with shadcn template)
- No other changes

### `src/components/ui/table.tsx`
- `TableRow`: Remove hardcoded `border-border-subtle` (redundant — `border-b` inherits from `--border`)

---

## Per-Page Cleanups

### `src/app/(dashboard)/analytics/page.tsx`
Two inline hardcoded hex status colors:
```tsx
// BEFORE
style={{ color: up ? "#22d3a0" : "#f87171" }}

// AFTER  
style={{ color: up ? "var(--color-success)" : "var(--color-danger)" }}
```

### `src/app/(dashboard)/_components/leads-columns.tsx`
### `src/app/(dashboard)/_components/verification-columns.tsx`
Telegram brand color used as hex:
```tsx
// BEFORE
className="... text-[#229ED9] ..."

// AFTER (Telegram blue is sky-500 equivalent)
className="... text-sky-500 ..."
```

---

## DESIGN.md Update

Section 3 (Color System) to be updated with the new Twitter-Crimson token values reflecting the light/dark mode changes above.

---

## Preservation Guarantees

- All 2,383 custom token usages (`text-text-primary`, `bg-overlay`, `bg-elevated`, etc.) remain valid — the custom alias vars stay in `@theme inline` and `:root`; only their VALUES change.
- Dark mode crimson values unchanged (they're already tuned for dark backgrounds).
- Badge `.badge-*` component classes in `globals.css` unchanged (these are semantic status badges, separate from the shadcn `Badge` component).
- All animations, ProseMirror styles, Telegram preview styles unchanged.
- TypeScript: pure CSS + component className changes — zero TypeScript impact.
