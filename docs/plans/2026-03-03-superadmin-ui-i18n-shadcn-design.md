# Superadmin UI Refactor — i18n, shadcn, TypeSafety, UX Gaps Design

**Date:** March 3, 2026
**Project:** tele-crm-frontend
**Status:** Approved — ready for implementation
**Approach:** Parallel fleet execution (5 independent lanes)

---

## Executive Summary

A targeted audit of the superadmin panel pages and the broader dashboard identified five categories of issues:

1. **Critical bug (FIXED):** `sessions.map is not a function` — `listSessions()` returned `res.data.data` without an array guard. Fixed as hotfix in `src/lib/api/superadmin.ts:143`.
2. **Zero i18n:** All 12 superadmin admin pages have every string hardcoded in English. The i18n system (`useT`, `K.*`) exists and is used on all other pages — it is simply missing from the admin section.
3. **Raw HTML instead of shadcn:** Two custom toggle components in `system-config-panel.tsx` and `backup-panel.tsx` use raw `<button>` elements styled as toggles — shadcn `<Switch>` exists and is already imported in `maintenance-panel.tsx`. `google/page.tsx` uses raw `<table>/<tr>/<td>` — shadcn Table primitives are available.
4. **UI/UX gaps:** Empty states, table row hover, skeleton column widths, topbar breadcrumb, mobile parity, analytics color overload — all previously documented in `2026-03-02-ui-ux-flaw-brainstorm-design.md` (still unimplemented).
5. **TypeSafety:** `HealthStatus` is a plain `type` not a `const` object — inconsistent with `UserRole`, `LeadStatus`. Two raw `<button>` toggle components bypass React's controlled-component pattern.

---

## Part 1 — Critical Bug (Already Fixed)

### 1.1 sessions.map is not a function (FIXED)

**File:** `src/lib/api/superadmin.ts:143`

`listSessions()` returned `res.data.data` directly. When the API returns a non-array (null, object wrapper, or undefined on error), `sessions.map` throws at runtime. Fixed with:

```typescript
// BEFORE
return res.data.data;

// AFTER (hotfix applied)
const data = res.data.data;
return Array.isArray(data) ? data : [];
```

---

## Part 2 — Missing i18n in Superadmin Pages

All 12 pages under `/admin/**` use zero `useT()` / `K.*` calls. Every page title, description, table header, button label, and toast message is a raw English string literal.

**Affected files:**
- `src/app/(dashboard)/admin/sessions/page.tsx`
- `src/app/(dashboard)/admin/queues/page.tsx`
- `src/app/(dashboard)/admin/secrets/page.tsx` (via `secrets-panel.tsx`)
- `src/app/(dashboard)/admin/maintenance/page.tsx`
- `src/app/(dashboard)/admin/system/page.tsx` (via `system-config-panel.tsx`)
- `src/app/(dashboard)/admin/backup/page.tsx` (via `backup-panel.tsx`)
- `src/app/(dashboard)/admin/users/page.tsx` (via `users-panel.tsx`)
- `src/app/(dashboard)/admin/overview/page.tsx` (partial — `overview-panel.tsx` uses K)
- `src/app/(dashboard)/admin/google/page.tsx`

**New keys to add to `src/i18n/keys.ts` under a `superadmin` namespace:**

```typescript
superadmin: {
  // Pages
  sessions: {
    title: "superadmin.sessions.title",
    subtitle: "superadmin.sessions.subtitle",
    sessionId: "superadmin.sessions.sessionId",
    userId: "superadmin.sessions.userId",
    createdAt: "superadmin.sessions.createdAt",
    expiresAt: "superadmin.sessions.expiresAt",
    userAgent: "superadmin.sessions.userAgent",
    actions: "superadmin.sessions.actions",
    revoke: "superadmin.sessions.revoke",
    revokeTitle: "superadmin.sessions.revokeTitle",
    revokeDesc: "superadmin.sessions.revokeDesc",
    noSessions: "superadmin.sessions.noSessions",
    count: "superadmin.sessions.count",
  },
  queues: {
    title: "superadmin.queues.title",
    subtitle: "superadmin.queues.subtitle",
    queueName: "superadmin.queues.queueName",
    waiting: "superadmin.queues.waiting",
    active: "superadmin.queues.active",
    completed: "superadmin.queues.completed",
    failed: "superadmin.queues.failed",
    actions: "superadmin.queues.actions",
    retryFailed: "superadmin.queues.retryFailed",
    purgeFailed: "superadmin.queues.purgeFailed",
    noQueues: "superadmin.queues.noQueues",
  },
  backup: {
    title: "superadmin.backup.title",
    subtitle: "superadmin.backup.subtitle",
    triggerBackup: "superadmin.backup.triggerBackup",
    triggering: "superadmin.backup.triggering",
    retention: "superadmin.backup.retention",
    retentionDays: "superadmin.backup.retentionDays",
    saveRetention: "superadmin.backup.saveRetention",
    noHistory: "superadmin.backup.noHistory",
    filename: "superadmin.backup.filename",
    size: "superadmin.backup.size",
    destinations: "superadmin.backup.destinations",
    status: "superadmin.backup.status",
  },
  google: {
    title: "superadmin.google.title",
    subtitle: "superadmin.google.subtitle",
    totalOps: "superadmin.google.totalOps",
    errors: "superadmin.google.errors",
    lastSync: "superadmin.google.lastSync",
    recentOps: "superadmin.google.recentOps",
    noOps: "superadmin.google.noOps",
  },
}
```

---

## Part 3 — Raw HTML → shadcn Replacements

### 3.1 `system-config-panel.tsx:221-227` — Toggle button → `<Switch>`

```tsx
// BEFORE — raw button simulating a toggle
<button
  type="button"
  onClick={() => setValue(field.key, getValue(field.key) === "true" ? "false" : "true")}
  className={`relative inline-flex h-5 w-9 ...`}
>
  <span className="..." />
</button>

// AFTER
import { Switch } from "@/components/ui/switch";
<Switch
  checked={getValue(field.key) === "true"}
  onCheckedChange={(checked) => setValue(field.key, checked ? "true" : "false")}
/>
```

### 3.2 `system-config-panel.tsx:182` — Refresh button → `<Button variant="ghost" size="icon">`

```tsx
// BEFORE
<button onClick={() => void refetchConfig()} className="p-1.5 ...">
  <ArrowClockwise size={14} />
</button>

// AFTER
<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void refetchConfig()}>
  <ArrowClockwise size={14} className={isLoading ? "animate-spin" : ""} />
</Button>
```

### 3.3 `backup-panel.tsx` — Remove `InlineToggle`, use `<Switch>`

The private `InlineToggle` component (lines 47-68) is a manual re-implementation of `<Switch>`. Delete it and replace all usages with `<Switch>` from shadcn.

### 3.4 `google/page.tsx` — Raw table → shadcn `Table` primitives

`OpRow` and the header row use raw `<table>/<tr>/<td>`. Replace with:
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
```

---

## Part 4 — UI/UX Gaps (from Existing Backlog)

These are prioritised P0/P1 items from `2026-03-02-ui-ux-flaw-brainstorm-design.md`:

### 4.1 Empty States — `<EmptyState>` Component (P0)

Create `src/components/ui/empty-state.tsx`:
```tsx
interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode; // CTA button
}
```

Use in: Verification Queue, Broadcasts, Follow-ups, Leads (no results), Superadmin Sessions.

### 4.2 Table Row Hover (P0)

In `src/components/data-table/DataTable.tsx`, add `hover:bg-accent/30 cursor-pointer transition-colors` to `<TableRow>` inside `<TableBody>`.

### 4.3 DataTableSkeleton Column Widths (P1)

Add optional `columnWidths?: string[]` prop to `DataTableSkeleton`. Default falls back to uniform widths. Each page passes its own width array.

### 4.4 Topbar Breadcrumb (P2)

Add breadcrumb to `src/components/dashboard/topbar.tsx` using the Next.js `usePathname()` hook and a route-to-label map.

### 4.5 Mobile Parity (P1)

Audit `MobileVerification` and `MobileAnalytics` against desktop — ensure badge, amount format, and avatar standards match.

---

## Part 5 — TypeSafety

### 5.1 `HealthStatus` → const object

**File:** `src/lib/api/superadmin.ts:69`

```typescript
// BEFORE
export type HealthStatus = 'ok' | 'degraded' | 'down';

// AFTER — consistent with UserRole, LeadStatus pattern
export const HealthStatus = {
  OK:       'ok',
  DEGRADED: 'degraded',
  DOWN:     'down',
} as const;
export type HealthStatus = (typeof HealthStatus)[keyof typeof HealthStatus];
```

---

## Part 6 — Parallel Swim-Lane Execution Plan

| Lane | Scope | Key Files | Risk |
|---|---|---|---|
| **Lane A** — i18n superadmin | Add keys to keys.ts + en.ts; wire useT() into all admin pages | `src/i18n/keys.ts`, `src/i18n/en.ts`, all `admin/**/*.tsx`, superadmin panels | Low |
| **Lane B** — shadcn cleanup | Replace raw toggle buttons with Switch; replace raw table in google/page.tsx | `system-config-panel.tsx`, `backup-panel.tsx`, `google/page.tsx` | Low |
| **Lane C** — UI/UX gaps | EmptyState component, table row hover, skeleton widths, breadcrumb | `src/components/ui/empty-state.tsx`, `DataTable.tsx`, topbar | Medium |
| **Lane D** — Performance | From existing `2026-03-03-system-performance-optimization-design.md` | Multiple (broadcast, leads, data-grid, bundle) | High |
| **Lane E** — TypeSafety | HealthStatus const object | `src/lib/api/superadmin.ts` | Low |

> **Merge order:** Lanes A, B, E are safe and independent — merge first. Lane C can be merged alongside. Lane D is the highest-risk and should go last.

---

## Success Metrics

| Metric | Before | After |
|---|---|---|
| Admin pages with i18n | 0/12 | 12/12 |
| Raw toggle buttons in admin | 3 | 0 |
| Raw HTML tables in admin | 1 | 0 |
| sessions.map runtime crash | Present | Fixed |
| Empty state components | 0 | 1 reusable |
| Table rows with hover | 0 | All |
| TypeSafety: HealthStatus | `type` only | `const` + `type` |
