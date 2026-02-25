# Typography, Colors & Navigation Redesign

## Problem
- Font: Syne (`font-display`) is editorial, bad for data numerics at large sizes
- Typography: Pages use 3+ inconsistent patterns (admin/page.tsx is the reference)
- Colors: `dashboard/page.tsx` still has ~20+ hardcoded dark-only colors (`text-white`, `.chart-card` bg)
- Analytics timeframe tabs: 7 tabs wrap awkwardly on tablet-width viewports
- Settings tab nav: Plain scrollable tabs, needs modern pill+icon treatment

## Decisions
- **Display font**: Replace Syne → **Space Grotesk** (sharp, fintech-grade numerics)
- **Numbers**: Use `data-mono` (JetBrains Mono) for all KPI numeric values
- **Settings nav**: Pill segment tabs with icons + Framer Motion highlight

## Typography Standard (admin/page.tsx as reference)

| Element | Class |
|---|---|
| Page h1 | `text-2xl font-bold text-text-primary` |
| Section heading (panel) | `text-sm font-semibold text-text-secondary uppercase tracking-wider` |
| Tab sub-heading | `text-xl font-semibold text-text-primary` |
| KPI numeric value | `text-2xl font-bold data-mono [accent-color]` |
| KPI label | `text-xs text-text-secondary` |
| Body | `text-sm text-text-secondary font-sans` |
| Caption | `text-xs text-text-muted` |

## Color Fix Rules (same as analytics pattern)
- `.chart-card` (dark `#0f0f1c`) → `bg-elevated rounded-xl`
- `text-white` → `text-text-primary`
- `rgba(255,255,255, x)` → CSS var equivalents
- `Card + kpi-card` → `bg-elevated rounded-xl` flat panels
- Keep: `text-white` inside hero section only (dark video backdrop, intentional)
- Keep: Telegram preview `text-white` in commands-tab (intentional dark bg)
- Keep: Image overlay `text-white` in verification (intentional dark overlay)

## Analytics Tabs Responsive
- Container: `overflow-x-auto` + `flex-nowrap` + hidden scrollbar
- No layout shift, works on all viewport widths

## Settings Tab Nav
- Pill segment control: `bg-elevated rounded-xl p-1` list container
- Each trigger: icon (lucide, 16px) + label, `rounded-lg px-3 py-2`
- Active: `bg-card shadow-sm` + crimson text via `data-[state=active]`
- Framer Motion `MotionHighlight` for the slide animation
- Icons: Bot → `Bot`, KB → `BookOpen`, Commands → `Command`, Team → `Users`, Sessions → `Shield`

## Files to Change
1. `src/app/layout.tsx` — swap Syne → Space Grotesk
2. `src/app/globals.css` — update `--font-syne` var name to `--font-space-grotesk`
3. `src/app/(dashboard)/page.tsx` — full color fix (chart-card, text-white, kpi-card)
4. `src/app/(dashboard)/analytics/page.tsx` — typography fix (font-display → standard)
5. `src/app/(dashboard)/settings/page.tsx` — typography fix
6. `src/app/(dashboard)/settings/_components/settings-tabs.tsx` — pill+icon redesign
7. `src/app/(dashboard)/settings/_components/bot-config-tab.tsx` — section heading fix
8. `src/app/(dashboard)/settings/_components/knowledge-base-tab.tsx` — heading fix
9. `src/app/(dashboard)/settings/_components/commands-tab.tsx` — heading fix
10. `src/app/(dashboard)/settings/_components/team-tab.tsx` — heading fix
11. `src/app/(dashboard)/settings/_components/sessions-tab.tsx` — heading fix
12. `src/app/(dashboard)/leads/page.tsx` — CardTitle typography fix
