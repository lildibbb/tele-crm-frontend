# Admin Page UI/UX Revamp Design
> Date: 2026-02-24  
> Status: Approved

---

## Problem

The current `src/app/(dashboard)/admin/page.tsx` has several design issues:
- **Nested cards** — `Card` > `CardContent` > `div.surface-card` in the RAG section
- **Left color borders** — `border-l-4 border-l-[--gold]` etc. on KPI cards (prohibited by design system)
- **Raw border classes** — `border border-border-subtle` inline throughout
- **Raw `<Table>`** — uses shadcn's basic Table instead of the project's DataTable component
- **Duplicate "Add User" button** — appears in both Quick Actions bar and card header
- **Audit log**: uses `ScrollArea` + manual `Separator` dividers — dated feel, not scannable

---

## Approach: Flat Command Center (Approach A)

Remove all `<Card>` components. Use flat `div` panels with `bg-bg-elevated rounded-xl` as the surface primitive. This eliminates all nesting, borders, and left-stripe anti-patterns.

---

## Section 1: Page Header + KPI Row

### Header
- Layout: flex row, title left, "Add User" button right
- `ShieldStar` icon (crimson) + H1 "Superadmin Panel" + subtitle
- No breadcrumb (redundant on isolated admin page)

### KPI Tiles (4 tiles, `grid-cols-2 xl:grid-cols-4 gap-4`)
- Surface: `bg-bg-elevated rounded-xl p-5` — **no border**, **no shadow**, **no left stripe**
- Icon: `rounded-lg p-2 bg-[accent]/10 text-[accent]` — tinted square, not circular
- Value: `text-2xl font-bold data-mono text-text-primary`
- Sub-label: `text-xs text-text-muted`
- Accent colors per tile: `--info` (Total Users), `--success` (Active), `--gold` (RAG Hit Rate), `--crimson` (AI Tokens)
- Skeleton state via `Skeleton` component

---

## Section 2: Users Table

### Panel
- Surface: `bg-bg-elevated rounded-xl overflow-hidden` — no Card, no border
- Header row: "Users (N)" label left, toolbar right

### DataTable integration
- Use `DataTable` from `src/components/data-table/data-table.tsx`
- Hook: `useReactTable` (client-side — user list is small)
- Toolbar: `DataTableToolbar` with search input + faceted Role filter + Refresh icon button

### Columns (in order)
| Column | Content | Notes |
|--------|---------|-------|
| Email | `data-mono text-sm font-medium` | sortable |
| Role | `RoleBadge` component | facet-filterable |
| Status | `StatusDot` (active/inactive) | |
| Last Login | `timeAgo(lastLoginAt)` or "Never" | sortable |
| Actions | Single `⋮` DropdownMenu | Change Role / Force Password Reset / Deactivate or Reactivate |

### Row actions dropdown
- Change Role → opens `ChangeRoleModal`
- Force Password Reset → opens `ForcePasswordModal`
- Deactivate / Reactivate → opens `AlertDialog` confirm
- Self-row guard: Change Role + Deactivate disabled for own user

### Pagination
- `DataTablePagination` built-in, default 10 rows/page

---

## Section 3: Audit Log + RAG Stats

### Layout: `grid-cols-1 xl:grid-cols-3 gap-4`

### Audit Log (xl: 2 cols)
- Surface: `bg-bg-elevated rounded-xl overflow-hidden`
- Header: "Audit Log" label + faceted action filter (via `DataTableToolbar`) + Reload button
- Use **DataTable** for the audit entries
- Columns: Action (icon + formatted label), Actor email, Resource type + ID, Time (`timeAgo`)
- 20 rows/page default
- Replaces the ScrollArea + Separator approach entirely

### RAG AI Performance (xl: 1 col)
- Surface: `bg-bg-elevated rounded-xl p-5`
- Section title: "AI / RAG Performance" with `Brain` icon
- Layout: vertical list of 4 stat rows
- Each row: label (`text-xs text-text-secondary`) + value (`font-bold data-mono [accent]`)
- Stats: Hit Rate (`--success`), Avg Chunks (`--info`), Zero-Hit Queries (`--danger`), Total Tokens (`--gold`)
- Shown only when `ragStats` is loaded; skeleton rows while loading

---

## Modals (unchanged logic, minor style polish)

- `CreateUserModal` — Dialog, unchanged logic
- `ChangeRoleModal` — Dialog, unchanged logic
- `ForcePasswordModal` — Dialog, unchanged logic
- `AlertDialog` confirm for deactivate/reactivate — unchanged

---

## Animations (GSAP, unchanged)

- `.admin-header`: fade + y slide down
- `.kpi-tile`: stagger scale + fade up
- `.page-section`: stagger y fade in

---

## Constraints Checklist

| Constraint | Status |
|---|---|
| No nested cards | ✅ No `<Card>` used anywhere |
| No border classes | ✅ No `border-*` utility |
| No left color border | ✅ No `border-l-*` |
| DataTable for tables | ✅ Users + Audit Log use `DataTable` |
| Modern UI/UX | ✅ Flat surface, consistent type scale |

---

## Files to Change

| File | Change |
|---|---|
| `src/app/(dashboard)/admin/page.tsx` | Full rewrite of JSX (keep all logic, modals, store hooks) |

No new files needed. All DataTable, store, and modal logic is already in place.
