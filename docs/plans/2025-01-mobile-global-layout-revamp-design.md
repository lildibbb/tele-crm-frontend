# Design: Global Mobile Layout Revamp
> Date: 2025-01-30 | Status: Approved

## Problem

1. No global mobile layout — each page embeds its own nav (MobileShell) inconsistently. Only 6 of 16 mobile components use MobileShell; the other 10 render naked content.
2. Mobile icons use multi-color fills (text-crimson, text-gold, text-info, emoji flags) in content areas — doesn't match the monochrome desktop aesthetic.
3. shadcn/ui components underused — custom div/button/span for cards, badges, avatars, and drawers instead of Card, Badge, Avatar, Sheet.
4. Layout returns bare `<>{children}</>` on mobile — no header, no nav, no shell.

## Approved Design

### Architecture

```
layout.tsx (mobile path):
  <MobileGlobalLayout>        ← new wrapper component
    <MobileGlobalHeader />    ← sticky top header (title + bell + avatar)
    <main>                    ← {children} from page
    <MobileBottomNav />       ← fixed bottom nav (4 tabs, path-based active)
    <Sheet>                   ← global "More" bottom drawer
  </MobileGlobalLayout>
```

Pages' mobile components are **pure content** — no MobileShell wrapper, no header, no nav.

### Navigation Design

- 4 tabs: Home / Leads / Verify / More (role-aware)
- Icons: Phosphor, `weight="regular"` inactive → `weight="fill"` active
- Colors: `text-text-muted` inactive → `text-crimson` active (matches desktop sidebar)
- Active pill: `bg-crimson/10 rounded-2xl` (consistent with desktop active state)
- Height: 60px + safe-area-inset-bottom

### Icon Policy (monochrome)

- **Nav tabs**: `text-crimson` when active only — acceptable as brand identity
- **Content icons**: ONLY `text-text-secondary` or `text-text-muted` — NO colored fills for decorative/status icons
- **Status indicators**: Color via `Badge` text only, icons remain neutral
- **No emoji icons** — replace all emoji status indicators with Phosphor icons at text-text-secondary

### shadcn Component Mapping

| Context | Component |
|---|---|
| Data cards | `Card` + `CardContent` (bg-card surface) |
| Status chips | `Badge` variant=outline or secondary |
| Drawers/modals | `Sheet` side="bottom" |
| User initials | `Avatar` + `AvatarFallback` |
| Loading states | `Skeleton` |
| CTA buttons | `Button` variant=default/ghost/outline |
| Dividers | `Separator` |
| List scroll | `ScrollArea` |

### Files To Change

**New files:**
- `src/components/mobile/MobileGlobalLayout.tsx` — layout wrapper (header + nav + More sheet)

**Modified files:**
- `src/app/(dashboard)/layout.tsx` — mobile branch wraps children in MobileGlobalLayout
- `src/components/mobile/MobileShell.tsx` — keep for backwards compat, but document as deprecated
- All 16 mobile components — revamp with shadcn + monochrome icons + drop MobileShell wrapper

## Implementation Phases

### Phase 1 — Global Layout (Critical Path)
1. Create `MobileGlobalLayout.tsx` with header + bottom nav + More sheet
2. Update `layout.tsx` mobile branch to use it
3. Test nav renders on all pages

### Phase 2 — Remove MobileShell from 6 components
Files that currently wrap in MobileShell: MobileLeadsList, OwnerHome, StaffHome, SuperadminHome, MobileAnalytics, MobileAdminDashboard

### Phase 3 — Revamp all 16 content components
Each component: drop MobileShell/MobileMoreDrawer imports, use shadcn primitives, monochrome icons, proper 44px touch targets

### Phase 4 — Verify
- TypeScript check (no new errors)
- Hooks violation audit (no early returns before hooks)
- Visual pass on all 16 pages
