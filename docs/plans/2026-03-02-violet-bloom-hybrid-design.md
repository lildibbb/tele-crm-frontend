# Violet Bloom Hybrid UI Migration

## Problem
The current Slate × Crimson palette uses a blue-grey page background (`#F1F5F9`) and dark obsidian dark mode (`#080810`). The shadcn-template's **Violet Bloom** preset offers a cleaner, warmer, more refined surface hierarchy that looks more premium — especially for a CRM dashboard.

## Approach
**Hybrid Violet Bloom**: Take all surface/background/border tokens, font, radius, and circular transition from Violet Bloom. Keep Crimson Red as the brand accent — buttons, tabs, focus rings, badges remain red. No component-level refactoring needed.

## What Changes

### 1. Surface Tokens (globals.css)

**Light mode — 6 values:**
| Token | Before | After |
|---|---|---|
| `--void` (page bg) | `#F1F5F9` | `#fdfdfd` |
| `--base` (sidebar) | `#F8FAFC` | `#f5f8fb` |
| `--overlay` (inset) | `#EFF3F8` | `#f5f5f5` |
| `--surface-sunken` | `#E8EDF4` | `#edf0f4` |
| `--border-subtle` | `#E2E8F0` | `#e7e7ee` |
| `--border-default` | `#CBD5E1` | `#ebebeb` |

**Dark mode — 6 values (Violet Bloom dark):**
| Token | Before | After |
|---|---|---|
| `--void` | `#080810` | `#1a1b1e` |
| `--base` (sidebar) | `#0e0e1a` | `#161618` |
| `--card` | `#141422` | `#222327` |
| `--elevated` | `#1c1c2e` | `#2a2c33` |
| `--border-subtle` | `#2a2a42` | `#33353a` |
| `--border-default` | `#38385a` | `#3e4048` |

Also update sidebar HSL vars in light/dark to match new surface hex values.

### 2. Border radius
`--radius`: `0.625rem` → `0.75rem`

This propagates to all shadcn radius utilities: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`.

### 3. Font: Plus Jakarta Sans
- Add `Plus_Jakarta_Sans` import in `src/app/layout.tsx` via `next/font/google`
- Update `--font-sans` in `globals.css` `@theme inline` to use `var(--font-jakarta)`
- Remove `DM_Sans` import (was `--font-dm-sans`)
- Keep `Space_Grotesk` for `--font-display`, `JetBrains_Mono` for `--font-mono`
- Load weights: 400, 500, 600 (same as DM Sans)

### 4. Circular View Transition (dark/light toggle)
- Add `::view-transition-old/new(root)` CSS + `@keyframes reveal` (clip-path circle) to `globals.css`
- Create `src/lib/hooks/use-circular-transition.ts` — wraps `document.startViewTransition` with `--x`/`--y` CSS vars for click-origin reveal
- Upgrade `src/components/ui/theme-toggle.tsx` to use `useCircularTransition().toggleTheme(event)` instead of plain `setTheme`

### 5. CardAction slot
- Add `CardAction` component to `src/components/ui/card.tsx`
- Used for badge/action inline with card header (matches the VB template's KPI card pattern)

## What Stays Unchanged
- All `--crimson` brand tokens (red-600)  
- All `--text-primary/secondary/muted` values  
- All `--gold` values  
- All `--shadow-*` values  
- All status colors (success, warning, danger, info)  
- All badge/status CSS classes  
- All component logic and TypeScript  
- Dark mode text colors (`#f0f0ff`, `#8888aa`, etc.)  

## Risk Assessment
- **Low risk**: Surface changes are CSS-only, no TS changes
- **Font**: `Plus_Jakarta_Sans` is a drop-in with same variable name convention
- **Radius**: 0.625→0.75rem is a subtle change (0.125rem / ~2px) — low visual impact  
- **Circular transition**: Additive, uses progressive enhancement (`startViewTransition` feature-detected)
- **Dark mode**: The new dark bg `#1a1b1e` is lighter than before — more readable, more modern

## Files Changed (Phase 1 — Violet Bloom surfaces/font/transition)
1. `src/app/globals.css` — surfaces, radius, font var, circular transition CSS
2. `src/app/layout.tsx` — swap DM Sans → Plus Jakarta Sans
3. `src/lib/hooks/use-circular-transition.ts` — new file
4. `src/components/ui/theme-toggle.tsx` — upgrade to circular transition
5. `src/components/ui/card.tsx` — CardAction slot already present

## Phase 2 — Full Template Component Integration

**CSS Token Bridge (globals.css @theme inline) — 7 fixes:**
- `--color-muted: var(--overlay)` (was var(--card) = white — BUG: invisible table hover/skeleton/tabs)
- `--color-secondary: var(--overlay)` (was var(--elevated))
- `--color-accent: var(--overlay)` (was var(--elevated))
- `--color-sidebar-accent: var(--overlay)` (was HSL chain)
- `--color-sidebar-accent-foreground: var(--text-primary)` (was HSL chain)
- `--color-sidebar-primary: var(--crimson)` (branded active state)
- `--color-sidebar-primary-foreground: #ffffff`

**card.tsx — full template style:**
- Shadow: complex → `shadow-sm`
- Spacing: `gap-0` → `gap-6 py-6`; padding `px-5` → `px-6`
- CardHeader: flex → CSS Grid (auto CardAction placement), remove border-b
- CardContent: `p-5` → `px-6`; CardFooter: border-t removed
- Remove `overflow-hidden`, `border-border-subtle`, `isolation-isolate`

**badge.tsx:** `rounded-full` → `rounded-md`

**table.tsx — template density:**
- TableHead: `h-11 px-4 font-semibold` → `h-10 px-2 font-medium`
- TableCell: `px-4 py-3` → `p-2`
- TableRow: `hover:bg-muted/40` → `hover:bg-muted/50`
