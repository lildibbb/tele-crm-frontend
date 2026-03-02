# Project Improvements Design
**Date:** 2026-03-02  
**Scope:** Code maintainability, performance, UI/UX, Next.js best practices  
**Constraint:** Current features only — no new pages or features

---

## Problem Statement

After completing the i18n, type-safety, and shared-utilities phases, several classes of technical debt remain across the CRM dashboard. These affect developer experience, runtime performance, user experience clarity, and Next.js best practices adherence.

---

## 1. Verification Queue Bugs

### 1a. Rejected Count Hardcoded to Zero
**File:** `src/app/(dashboard)/verification/page.tsx:857`  
The third stats card renders `0` instead of calling `getRejectedCount()` from `verificationStore`.

**Fix:** Call `getRejectedCount()` in the page component (same pattern as `getVerifiedCount`).

### 1b. Misleading "Approved Today" / "Rejected Today" Stats
**File:** `src/app/(dashboard)/verification/page.tsx:843, 857`  
`approvedCount = getVerifiedCount()` derives from the current page's 20 loaded leads — not a real daily count. The stat label says "Today" which misleads agents into thinking these are daily totals.

**Fix:** On component mount, make two lightweight API calls (matching the existing `pendingTotal`/`allTotal` pattern):
- `leadsApi.list({ take: 1, skip: 0, status: DEPOSIT_CONFIRMED, since: <today_start_ISO> })`  
- `leadsApi.list({ take: 1, skip: 0, status: REJECTED, since: <today_start_ISO> })`

Store `approvedTodayTotal` and `rejectedTodayTotal` in local `useState`. This is 2 extra lightweight HTTP requests on mount — acceptable and consistent.

> **Note:** This requires `since` date-filter support from the backend API. If unavailable, relabel to "Total Verified" / "Total Rejected" (deriving from `allTotal` via status breakdown).

---

## 2. Mobile Component Deduplication

### Problem
Three mobile components duplicate utilities that now exist in shared libs:

| Mobile File | Duplicates |
|---|---|
| `src/components/mobile/MobileLeadsList.tsx` | `STATUS_CONFIG` (badge map), `timeAgo()`, `getInitials()` |
| `src/components/mobile/MobileLeadDetail.tsx` | `getInitials()`, status badge inline |
| `src/components/mobile/MobileAuditLogs.tsx` | `ROLE_BADGE`, `timeAgo()`, `PAGE_SIZE` constant |

### Fix
- Replace local `STATUS_CONFIG` with `LEAD_STATUS_BADGE` from `@/lib/badge-config`
- Replace local `timeAgo()` and `getInitials()` with imports from `@/lib/format`
- Replace local `ROLE_BADGE` with `roleBadgeCls()` from `@/lib/badge-config`
- Centralize `PAGE_SIZE = 20` in a `src/lib/constants.ts` (or `src/lib/pagination.ts`)

### Verification Columns
`src/app/(dashboard)/verification/_components/verification-columns.tsx` has an inline `StatusBadge` component that maps statuses to labels and colors independently from `LEAD_STATUS_BADGE`. It should use `LEAD_STATUS_BADGE` for the class names (keeping its dot-indicator visual style).

---

## 3. Leads Page Decomposition

### Problem
`src/app/(dashboard)/leads/page.tsx` is 500+ lines with 13+ `useState` declarations managing independent concerns: filters, bulk actions, export/import, handover mode, column visibility.

### Approach: Extract Sub-Components
Create focused sub-components under `src/app/(dashboard)/leads/_components/`:

| New Component | Responsibility |
|---|---|
| `LeadsToolbar.tsx` | Search, filter tabs, column toggle, export/import actions |
| `LeadsTable.tsx` | DataTable + skeleton + GSAP animation |
| `BulkActionBar.tsx` | Bulk handover toggle, selected count display |

The page itself becomes a thin orchestrator: stores, URL sync, data fetching, passing callbacks down.

**State grouping:** Collapse the 13 `useState` calls into logical groups using `useReducer` or small focused custom hooks (`useLeadsFilters`, `useLeadsBulkActions`).

---

## 4. Performance Improvements

### 4a. GSAP Animation Dep in Verification Page
**File:** `src/app/(dashboard)/verification/page.tsx:768`  
```ts
{ scope: containerRef, dependencies: [leads, filter] }
```
`leads` is an array reference that changes on every store update. Change to `[leads.length, filter]` (same fix applied to leads page in Phase 5).

### 4b. Mobile Components Not Memoized
`MobileLeadsList`, `MobileAuditLogs`, `MobileVerification` are plain function components re-rendering on every parent update. Wrap with `React.memo` since their props are stable references.

### 4c. Verification Store Selectors in Dialog Sub-Components
`ApproveDialog`, `AskMoreDialog`, `ReceiptDialog` use whole-store `useVerificationStore()` subscriptions (destructuring multiple fields). These should use individual selectors or `useShallow` from zustand to prevent over-subscribing.

---

## 5. i18n Gaps in Components

### Hardcoded Strings Remaining
| File | Hardcoded strings |
|---|---|
| `src/components/bot/BotConfigTab.tsx` | "Bot Name", "Bot Configuration", "Save Changes", "Saving…" |
| `src/components/mobile/MobileLeadsList.tsx` | Filter chip labels (status names) |
| `src/components/mobile/MobileAuditLogs.tsx` | All UI labels |
| `verification/_components/verification-columns.tsx` | "Lead", "HFM Account", "Amount", "Submitted", "Status", "Approve", "Reject" |

**Fix:** Add translation keys for all these strings and use `useT()` / `K.*`.

---

## 6. Next.js Best Practices

### 6a. Missing `metadata` Exports
**Affected pages:** `/leads`, `/verification`, `/analytics`, `/follow-ups`, `/broadcasts`, `/audit-logs`, `/admin/*`, `/profile`

Add `export const metadata: Metadata = { title: "...", description: "..." }` to each page. Use a shared `APP_NAME = "Titan Journal CRM"` constant.

### 6b. Missing `error.tsx` Boundaries
No dashboard route has an `error.tsx`. If any async data fetch throws at the page level, the entire dashboard crashes.

**Fix:** Add a minimal `error.tsx` to these segments:
- `src/app/(dashboard)/error.tsx` (catches all dashboard routes)
- Per-segment for routes with critical data: `/leads`, `/verification`, `/analytics`

### 6c. Missing `loading.tsx` for Key Routes
`/verification`, `/follow-ups`, `/broadcasts`, `/audit-logs` have no `loading.tsx`. Add skeleton-based loading UI using existing `DataTableSkeleton`.

---

## 7. BotConfigTab i18n + useCallback

**File:** `src/components/bot/BotConfigTab.tsx`  
- `handleSave` is not wrapped in `useCallback` — memoize it
- All visible strings are hardcoded English — wrap with `useT()` + add keys

---

## Implementation Order (Recommended)

| Phase | Work | Impact |
|---|---|---|
| A | Verification queue bug fixes (hardcoded 0, misleading Today stats) | Correctness |
| B | Mobile component deduplication + verification-columns StatusBadge | Maintainability |
| C | i18n gaps (BotConfigTab, mobile components, verification-columns) | Consistency |
| D | Next.js metadata + error.tsx + loading.tsx | Best practices |
| E | Leads page decomposition | Scalability |
| F | Performance (GSAP dep, React.memo, dialog selectors) | Performance |

Phases A–C are quick wins (< 2 hours total). Phases D–F are structural and require more care.

---

## Out of Scope
- New features
- API layer changes beyond adding `since` date param to existing calls
- Authentication/auth pages (pre-existing type errors unrelated to this work)
