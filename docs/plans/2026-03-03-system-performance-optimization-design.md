# System Performance Optimization Design

**Date:** March 3, 2026  
**Project:** tele-crm-frontend  
**Status:** Approved — ready for implementation  
**Approach:** Parallel swim-lanes (fleet agent execution)

---

## Executive Summary

A deep code audit of tele-crm-frontend identified concrete, file-specific bugs and architectural anti-patterns causing frontend lag. The root causes are: (1) all server state managed inside Zustand stores with no caching layer, (2) redundant packages inflating the bundle, (3) critical memory leaks from unguarded polling intervals, and (4) missing optimistic update rollback causing phantom UI state. This document is the authoritative design for a full-system remediation.

---

## Part 1 — Concrete Bugs Found

### 1.1 Memory Leak — Broadcast Polling (CRITICAL)

**File:** `src/store/broadcastStore.ts:112-142`

`startPolling()` creates a `setInterval` stored in Zustand state. The interval runs for up to 24 attempts x 5 seconds = 120 seconds per broadcast message. If the Broadcasts page unmounts before polling completes, the interval is **never cleared**. Each new message started compounds this leak.

```typescript
// CURRENT (line 112) — no cleanup guarantee
const id = setInterval(async () => { ... }, 5000);
set({ pollingId: id });

// FIX — expose stopPolling, call it in useEffect cleanup in the component
useEffect(() => {
  return () => { broadcastStore.getState().stopPolling(); };
}, []);
```

### 1.2 Phantom UI State — Missing Optimistic Rollback (HIGH)

**File:** `src/store/broadcastStore.ts:65-83` and `src/store/leadsStore.ts:175-192`

Both stores apply optimistic updates to local state before API calls but have **no rollback on failure**. Failed broadcasts remain in the UI as "QUEUED" indefinitely. Failed bulk-handover operations leave leads in the toggled state forever.

```typescript
// CURRENT — leadsStore.ts:175-192 (no rollback)
set((s) => ({ leads: s.leads.map((l) => ({ ...l, handoverMode: mode })) }));
try {
  await leadsApi.setBulkHandover({ handoverMode: mode });
} catch (err) {
  console.error("Failed to set bulk handover", err); // state never restored
}

// FIX — snapshot before, restore on error (TanStack Query onMutate pattern)
const previousLeads = get().leads;
set((s) => ({ leads: s.leads.map((l) => ({ ...l, handoverMode: mode })) }));
try {
  await leadsApi.setBulkHandover({ handoverMode: mode });
} catch (err) {
  set({ leads: previousLeads }); // rollback
  throw err;
}
```

### 1.3 Spurious Re-fetches — Incorrect useEffect Dependencies (HIGH)

**File:** `src/app/(dashboard)/page.tsx:81-84`

`fetchLeads` is included in a `useEffect` that fires on every `period` change. But `fetchLeads` fetches the same top-20 leads regardless of period — it does not use `period`. This triggers an unnecessary network request every time the user changes the analytics timeframe.

```typescript
// CURRENT — fires on period change unnecessarily
useEffect(() => {
  fetchSummary({ timeframe: period });
  fetchLeads({ skip: 0, take: 20 }); // does not use period
}, [fetchSummary, fetchLeads, period]);

// FIX — separate effects
useEffect(() => { fetchSummary({ timeframe: period }); }, [fetchSummary, period]);
useEffect(() => { fetchLeads({ skip: 0, take: 20 }); }, [fetchLeads]); // runs once
```

### 1.4 Over-Subscription — 13 Independent Zustand Listeners (MEDIUM)

**File:** `src/hooks/use-data-grid.ts:259-271`

The data-grid hook creates 13 separate `useStore()` calls. Each is an independent React subscription. When any data-grid state changes (e.g., a keystroke in search), all 13 selectors fire, causing up to 13 sequential re-renders.

```typescript
// CURRENT — 13 subscriptions
const focusedCell = useStore(store, (s) => s.focusedCell);
const editingCell = useStore(store, (s) => s.editingCell);
// ... 11 more

// FIX — 3 grouped selectors with useShallow
const { focusedCell, editingCell, contextMenu, pasteDialog } =
  useStore(store, useShallow((s) => ({
    focusedCell: s.focusedCell, editingCell: s.editingCell,
    contextMenu: s.contextMenu, pasteDialog: s.pasteDialog,
  })));
const { selectionState, rowSelection } =
  useStore(store, useShallow((s) => ({ selectionState: s.selectionState, rowSelection: s.rowSelection })));
const { searchQuery, searchMatches, matchIndex, searchOpen, sorting, columnFilters, rowHeight } =
  useStore(store, useShallow((s) => ({
    searchQuery: s.searchQuery, searchMatches: s.searchMatches, matchIndex: s.matchIndex,
    searchOpen: s.searchOpen, sorting: s.sorting, columnFilters: s.columnFilters, rowHeight: s.rowHeight,
  })));
```

### 1.5 Hardcoded Proxy Target (MEDIUM)

**File:** `next.config.ts:8`

The API rewrite destination is hardcoded to `http://localhost:3001`. This silently breaks in staging, production, and Docker environments.

```typescript
// CURRENT
destination: "http://localhost:3001/api/:path*"

// FIX
destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/:path*`
```

---

## Part 2 — Architectural Flaws

### 2.1 Server State in Zustand (Root Cause of Lag)

All server state lives in Zustand. Every component that reads `leads`, `analytics`, `users`, or `broadcasts` subscribes to the entire store. Any update to any field (including `isLoading`, `error`, `page`) causes every subscriber to re-render.

Zustand is designed for synchronous, client-side UI state — not async server data. It has no native concept of:
- Cache TTL / stale-while-revalidate
- Request deduplication (two components mounting simultaneously = two API calls)
- Background refetch
- Optimistic updates with typed rollback context
- Per-query loading/error states

**Resolution:** Migrate all server/async state to **TanStack Query**. Keep Zustand for UI state only (4 stores).

### 2.2 Redundant Packages (Bundle Bloat)

| Package(s) | Issue |
|---|---|
| `gsap` + `@gsap/react` + `motion` | Three animation libraries; only `framer-motion` used actively |
| `@tremor/react` (3.18.7) + `tremor` (0.0.1) | Duplicate — `@tremor/react` is the real package; `tremor` is a stub. Neither needed since `recharts` + `shadcn` cover all chart use cases |

**Resolution:** Remove `gsap`, `@gsap/react`, `motion`, `@tremor/react`, `tremor`. Keep `framer-motion` only.

### 2.3 Mobile Component Logic Duplication

`src/components/mobile/MobileLeadsList.tsx` (240 LOC) reimplements the same filter, search-debounce, and pagination logic as the desktop data-grid manually. Bug fixes must be applied twice.

**Resolution:** Extract `useLeadsList({ skip, take, search, status })` shared hook. Both mobile and desktop consume it identically.

### 2.4 No `optimizePackageImports` in Next.js Config

Next.js 15 supports `optimizePackageImports` to tree-shake icon packs at the framework level. `lucide-react` and `@phosphor-icons/react` ship hundreds of icons — only imported ones should be bundled.

---

## Part 3 — Architecture After Migration

```
BEFORE                              AFTER
──────────────────────────          ─────────────────────────────────────
Components                          Components
  useLeadsStore()                     useLeadsQuery() / useLeadMutation()
  useAnalyticsStore()                 useAnalyticsQuery()
  useBroadcastStore()                 useBroadcastsQuery()
  ▼                                   useAuthStore()  <- UI auth state
Zustand Stores (18 stores)            useUIStore()    <- sidebar/notifs
  manual axios + isLoading            useDashboardLayoutStore() <- widgets
  no cache, no dedup                  useCommandMenuStore()
  ▼                                   ▼
axios apiClient                     TanStack Query Cache
  └─ Backend API                      └─ axios apiClient
                                         └─ Backend API
```

**Stores that survive (4):**
- `authStore` — user session, token, initialized flag
- `uiStore` — sidebar open, notification tray, global loading overlay
- `dashboardLayoutStore` — widget visibility/order (localStorage persisted)
- `commandMenuStore` — command palette open state

**Stores deleted (14):**
`analyticsStore`, `broadcastStore`, `kbStore`, `leadsStore`, `usersStore`, `backupStore`, `secretsStore`, `superadminStore`, `googleAnalyticsStore`, `verificationStore`, `maintenanceStore`, `passwordResetStore`, `botStore`, `systemConfigStore`

---

## Part 4 — Type Safety Standards

- `queryFn` return type explicit (no `any`)
- `QueryKey` defined as `const` tuple arrays in a central `src/queries/queryKeys.ts`
- Mutations use `onMutate` / `onError` / `onSettled` context pattern for typed rollback
- All `catch` blocks use typed error handling — no silent `console.error` swallowing

---

## Part 5 — UX Performance Principles

- `React.memo` on all list-item components receiving callbacks as props
- No inline object/array literals in JSX props (defeats memo)
- `useCallback` on all handlers passed to memoized children
- `useTransition` for non-urgent updates (filter changes, search input, tab switches)
- Error boundaries around each dashboard widget
- `Suspense` boundaries around TanStack Query-backed components for skeleton states

---

## Part 6 — Swim-Lane Implementation Plan

Execution via fleet agents in parallel. Each lane is independently mergeable.

| Lane | Scope | Key Files | Risk |
|---|---|---|---|
| **Lane 1** — Bundle cleanup | Remove gsap, tremor, motion; add `optimizePackageImports` | `package.json`, `next.config.ts`, all import sites | Low |
| **Lane 2** — Critical bug fixes | Polling leak, optimistic rollback, spurious fetches | `broadcastStore.ts`, `leadsStore.ts`, `page.tsx` | Low |
| **Lane 3** — TanStack Query migration | Install TQ, add QueryProvider, create query hooks | `providers/`, `src/queries/`, all pages consuming deleted stores | High |
| **Lane 4** — Zustand consolidation | Delete 14 stores, consolidate data-grid subscriptions | `src/store/`, `use-data-grid.ts` | Medium |
| **Lane 5** — Code quality | Extract `useLeadsList`, fix mobile debounce, fix proxy env var | `hooks/`, `mobile/`, `next.config.ts` | Low |

> **Merge order:** Lane 1 + Lane 2 + Lane 5 first (safe, independent). Then Lane 3 + Lane 4 together (coordinated — Lane 3 creates query hooks, Lane 4 deletes the stores they replace).

---

## Part 7 — Out of Scope

- PWA / service worker caching
- SSR/SSG for dashboard pages (auth-gated; client-only is correct)
- WebSocket real-time (polling acceptable for current scale)
- Performance monitoring infrastructure
- Backend API changes

---

## Success Metrics

| Metric | Before | Target |
|---|---|---|
| Bundle size | ~2.5MB | ~1.2MB (−52%) |
| Zustand store count | 18 | 4 (−78%) |
| Data-grid re-renders per keypress | ~13 | ~3 (−77%) |
| Dashboard re-renders on analytics update | Full page | Widget-isolated |
| Broadcast polling leak | On every unmount | Zero — cleanup enforced |
| Optimistic rollback coverage | 0% | 100% of mutations |
