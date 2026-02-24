# Leads & Verification Queue — TanStack Table Server-Side Pagination

## Problem

Both `leads/page.tsx` and `verification/page.tsx` currently use hand-rolled HTML tables
with **client-side** pagination/filtering: all leads are fetched once into a Zustand store,
then sliced in memory. This doesn't scale and prevents server-side search/sort.

## Approved Design Decisions

| Decision | Choice |
|---|---|
| Status filter UI | Keep tabs (ALL / NEW / REGISTERED / DEPOSIT_REPORTED…) above the table |
| Data fetching | Refactor existing `leadsStore` to be server-side aware (no new deps) |
| Table component | `DataTable` + `useDataTable` from existing `src/components/data-table/` |
| URL state | `nuqs` (needed by `useDataTable`) for page / perPage / sort sync |

---

## Architecture

### Data Flow

```
URL params (page, perPage, sort)
  └─▶ useDataTable hook (nuqs)
        └─▶ Page reads page/perPage from table.getState()
              └─▶ leadsStore.fetchLeads({ skip, take, status })
                    └─▶ GET /leads?status=X&skip=Y&take=Z
                          └─▶ { data: Lead[], total: number }
                                └─▶ useDataTable({ data, pageCount }) ─▶ DataTable
```

### leadsStore Refactor

Remove client-side selectors (`getFiltered`, `getPaginated`, `getTotalPages`).
Change `fetchLeads` signature to accept `{ skip, take, status? }` and store the
API-returned `total`. Add `pageCount` computed getter.

Keep all mutation actions intact: `updateStatus`, `setHandover`, `verifyLead`.

### Missing Infrastructure to Create

| File | Purpose |
|---|---|
| `src/hooks/use-callback-ref.ts` | Re-export from `@/lib/hooks/use-callback-ref` |
| `src/hooks/use-debounced-callback.ts` | Re-export from `@/lib/hooks/use-debounced-callback` |
| `src/config/data-table.ts` | `dataTableConfig` — operators, filterVariants, joinOperators |
| `src/lib/data-table.ts` | `getColumnPinningStyle`, `getFilterOperators`, `getDefaultFilterOperator` |
| `src/lib/parsers.ts` | `FilterItemSchema`, `getSortingStateParser`, `getFiltersStateParser` |
| `src/lib/format.ts` | `formatDate` utility |
| `src/lib/id.ts` | `generateId` utility |

### Missing Packages to Install

- `nuqs` — URL query state (required by `useDataTable`)
- `react-day-picker` — required by `data-table-date-filter`

### Missing shadcn Components to Add

- `slider` — range input for numeric filters
- `calendar` — date picker (depends on `react-day-picker`)

### Column Definitions

**`src/app/(dashboard)/leads/_components/leads-columns.tsx`**

| Column | Sortable | Filterable | Notes |
|---|---|---|---|
| `displayName` | ✓ | text | Click → lead detail sheet |
| `telegramUserId` | — | — | |
| `email` | — | — | |
| `status` | — | — | Badge (visual only — tabs handle filtering) |
| `assignedAgentId` | — | — | |
| `handoverMode` | — | — | Toggle switch, calls `setHandover` |
| Actions | — | — | View / Chat / Verify buttons |

**`src/app/(dashboard)/verification/_components/verification-columns.tsx`**

| Column | Notes |
|---|---|
| `displayName` | |
| `telegramUserId` | |
| `hfmBrokerId` | |
| `depositAmount` | |
| `reportedAt` | Date |
| Actions | Verify button |

### Page Refactors

**leads/page.tsx:**
1. Remove hand-rolled `<Table>` and manual pagination controls
2. Add `useDataTable({ data: leads, pageCount, columns })` hook
3. Wrap table with `<DataTable table={table}><DataTableToolbar table={table} /></DataTable>`
4. Keep status tabs — on tab change: update `statusFilter` state + call `fetchLeads`
5. Preserve `MobileLeadsList` mobile branch (no change)
6. Adapt GSAP animation: `gsap.from(".data-table tbody tr", {...})` on data change

**verification/page.tsx:**
1. Same pattern but tab/status filter fixed to `DEPOSIT_REPORTED`
2. Simpler — no status tabs needed

---

## Implementation Order

1. Install packages (`nuqs`, `react-day-picker`)
2. Create missing utility files + hook re-exports
3. Add shadcn `slider` + `calendar` components
4. Refactor `leadsStore`
5. Create `leads-columns.tsx`
6. Create `verification-columns.tsx`
7. Refactor `leads/page.tsx`
8. Refactor `verification/page.tsx`
9. TypeScript check + smoke test
