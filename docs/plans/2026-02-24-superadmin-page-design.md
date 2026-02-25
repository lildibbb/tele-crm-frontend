# Superadmin Page & Role-Based Navigation Design

**Date:** 2026-02-24  
**Status:** Approved (autonomous)

## Problem

The sidebar shows all nav items to all roles. The SUPERADMIN (developer) should see platform-management pages only, not business-operation pages. The `/admin` page uses 100% mock data despite real APIs existing.

## Approach

### Role-based sidebar visibility

| Role | Pages visible |
|------|--------------|
| SUPERADMIN | Admin, Analytics, Settings |
| OWNER | Command Center, Leads, Verification, Analytics, Settings |
| ADMIN | Command Center, Leads, Verification, Analytics, Settings |
| STAFF | Command Center, Leads, Verification, Settings |

### Route protection

`/admin` renders a redirect to `/` if the user is not SUPERADMIN.

### Superadmin page — real API data

Replace all mock data with live API calls:

1. **User Management** — `superadminApi.findAllUsers()` with create / deactivate / reactivate / change-role / force-password actions
2. **Audit Logs** — `auditLogsApi.findMany()` with filters (action, date range)
3. **RAG AI Stats** — `analyticsApi.getRagStats()` for hitRate, avgChunks, tokens, zeroHitCount
4. **KPI cards** — derived from the above

## Architecture

- `src/store/superadminStore.ts` — Zustand store for users + audit logs + RAG stats
- `src/components/app-sidebar.tsx` — filtered NAV_ITEMS based on `user.role`
- `src/app/(dashboard)/admin/page.tsx` — rewritten with real data + SUPERADMIN guard

## UI Decisions

- Modals for Create User and Force Password Reset (no separate pages needed)
- Audit log supports action filter + date range (from/to)
- RAG stats card only visible to SUPERADMIN (always true on this page)
- Skeleton loading states during fetch
