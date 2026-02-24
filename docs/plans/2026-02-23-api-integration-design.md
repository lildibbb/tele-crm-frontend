# API Integration Design — Titan Journal CRM Frontend

**Date:** 2026-02-23  
**Status:** Approved  
**Scope:** Full backend integration via `swagger.json`, type-safe layer, Zod schemas, Zustand async stores, shadcn forms

---

## 1. Problem Statement

The frontend currently uses **mock/seed data** in all Zustand stores and has no real API calls. The `apiClient.ts` uses `localStorage` for the JWT token (insecure, has TODO comments), field names in stores do not match the API (`name` vs `displayName`, `hfmId` vs `hfmBrokerId`, `handover` vs `handoverMode`), and there are no Zod schemas or form validation. This design describes the complete integration architecture.

---

## 2. Chosen Architecture: Zod-First Layered Architecture

### Decision Summary
| Concern | Decision |
|---------|----------|
| Access token storage | In-memory (Zustand `useAuthStore`) |
| Type safety | Zod schemas as single source of truth, TS types via `z.infer<>` |
| Server state management | Zustand stores with async actions + `isLoading / error` state |
| API service layer | One file per domain under `src/lib/api/` |
| Form validation | shadcn `<Form>` + react-hook-form + Zod resolver |

---

## 3. Type System & Enums

**File:** `src/types/enums.ts`

All backend enum values become TypeScript `const` enums or `as const` objects:

```ts
export const UserRole = {
  SUPERADMIN: 'SUPERADMIN',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const LeadStatus = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  REGISTERED: 'REGISTERED',
  DEPOSIT_REPORTED: 'DEPOSIT_REPORTED',
  DEPOSIT_CONFIRMED: 'DEPOSIT_CONFIRMED',
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const KbType = { TEXT: 'TEXT', LINK: 'LINK', TEMPLATE: 'TEMPLATE' } as const;
export type KbType = (typeof KbType)[keyof typeof KbType];

export const KbFileType = {
  TEXT_MANUAL: 'TEXT_MANUAL', PDF: 'PDF', DOCX: 'DOCX',
  IMAGE: 'IMAGE', VIDEO_LINK: 'VIDEO_LINK', EXTERNAL_LINK: 'EXTERNAL_LINK',
} as const;
export type KbFileType = (typeof KbFileType)[keyof typeof KbFileType];

export const KbStatus = { PENDING: 'PENDING', PROCESSING: 'PROCESSING', READY: 'READY', FAILED: 'FAILED' } as const;
export type KbStatus = (typeof KbStatus)[keyof typeof KbStatus];
```

**Zod Schema Files:** `src/lib/schemas/`
- `common.ts` — `ApiResponseSchema<T>` wrapper
- `auth.schema.ts` — LoginSchema, ForgotPasswordSchema, ResetPasswordSchema, SetupAccountSchema, ChangeOwnPasswordSchema
- `user.schema.ts` — UserResponseSchema, InviteUserSchema, ChangeRoleSchema, CreateUserSchema
- `lead.schema.ts` — LeadResponseSchema, UpdateLeadStatusSchema, UpdateHandoverSchema
- `kb.schema.ts` — KbResponseSchema, CreateKbSchema, UpdateKbSchema
- `commandMenu.schema.ts` — CommandMenuResponseSchema, CreateCommandMenuSchema, UpdateCommandMenuSchema
- `analytics.schema.ts` — AnalyticsDashboardResponseSchema, DailyStatsSchema, WeeklyStatsSchema, MonthlyStatsSchema

All TypeScript types are `z.infer<typeof XyzSchema>` — no separate interface declarations.

---

## 4. API Client & Auth Token Strategy

### In-Memory Token Flow

```
App boot
  └─► initAuth() in useAuthStore
        └─► POST /auth/refresh (cookie sent automatically, withCredentials: true)
              ├─► success → store accessToken in memory, call GET /users/me → store user
              └─► failure → isInitialized = true, user = null → redirect to /login

Every API request
  └─► Request interceptor reads useAuthStore.getState().accessToken
        └─► Injects Authorization: Bearer <token>

On 401 response
  └─► Response interceptor
        └─► POST /auth/refresh
              ├─► success → update in-memory token → retry original request
              └─► failure → clearAuth() + redirect to /login
```

### Key `apiClient.ts` Changes
- `withCredentials: true` (for cookie refresh)
- Request interceptor reads from `useAuthStore.getState()` (no localStorage)
- Response interceptor handles silent refresh + retry with a flag to prevent infinite loops
- Remove current `localStorage.removeItem('token')` logic

---

## 5. Domain API Modules (`src/lib/api/`)

Each module exports a typed namespace object:

| File | Functions |
|------|-----------|
| `auth.ts` | `login`, `refresh`, `logout`, `tmaLogin`, `setupAccount`, `getSessions`, `revokeSession`, `revokeAllSessions`, `forgotPassword`, `resetPassword`, `changeOwnPassword`, `createUser` |
| `users.ts` | `findAll`, `getMe`, `findById`, `deactivate`, `reactivate`, `changeRole`, `changePassword`, `invite`, `listInvitations`, `deleteInvitation` |
| `leads.ts` | `list`, `findOne`, `updateStatus`, `setHandover`, `verify`, `submitInfo` |
| `kb.ts` | `findAll`, `findActive`, `findOne`, `createText`, `uploadFile`, `update`, `remove`, `getProcessingStatus` |
| `commandMenu.ts` | `findAll`, `findOne`, `create`, `update`, `remove`, `reorder` |
| `attachments.ts` | `findByLead` |
| `analytics.ts` | `getDashboard`, `getToday`, `getWeekly`, `getMonthly` |

All input arguments are `z.infer<typeof ...Schema>`, all return types are `Promise<AxiosResponse<ApiResponse<T>>>`.

---

## 6. Zustand Store Refactor

### Auth Store (new: `useAuthStore`)
```ts
interface AuthState {
  user: User | null
  accessToken: string | null
  isInitialized: boolean
  isLoading: boolean
}
// Actions: login, logout, initAuth, setAccessToken
```

### Leads Store (refactor: `useLeadsStore`)
- Replace seed data with real API
- Align types to `LeadResponseDto` (`displayName`, `hfmBrokerId`, `handoverMode`, `telegramUserId`)
- Add `isLoading`, `error`, `total` for pagination
- Actions: `fetchLeads`, `updateStatus`, `setHandover`, `verifyLead`

### Verification Store (refactor: `useVerificationStore`)
- Currently: standalone mock data
- After: selects leads with `DEPOSIT_REPORTED` status from `useLeadsStore` + calls `POST /leads/{id}/verify`

### New Stores
| Store | Purpose |
|-------|---------|
| `useUsersStore` | Users + invitations management (admin/superadmin) |
| `useKbStore` | Knowledge base CRUD + SSE processing status |
| `useCommandMenuStore` | Command menu CRUD + reorder |
| `useAnalyticsStore` | Dashboard, daily, weekly, monthly stats |

### Unchanged
- `useUIStore` — pure UI state (sidebar, modals, loading overlay), no API

---

## 7. Forms (shadcn + react-hook-form + Zod)

All auth forms upgraded to shadcn `<Form>` pattern:
- **Login page** — `LoginSchema` (email + password min 8)
- **Forgot password** — `ForgotPasswordSchema` (email)
- **Reset password** — `ResetPasswordSchema` (email + 4-digit OTP code + newPassword)
- **Setup account** — `SetupAccountSchema` (invitationToken + initData + email + password)

Dashboard forms (new):
- Invite user modal — `InviteUserSchema` (role + optional email)
- Change role modal — `ChangeRoleSchema`
- Change own password — `ChangeOwnPasswordSchema` (currentPassword + newPassword + confirmPassword match)
- Create/edit KB entry — `CreateKbSchema` / `UpdateKbSchema`
- Create/edit command menu — `CreateCommandMenuSchema`

---

## 8. File Structure Summary

```
src/
  types/
    enums.ts                    ← all const enums
  lib/
    schemas/
      common.ts
      auth.schema.ts
      user.schema.ts
      lead.schema.ts
      kb.schema.ts
      commandMenu.schema.ts
      analytics.schema.ts
    api/
      apiClient.ts              ← upgraded (in-memory token, refresh interceptor)
      auth.ts
      users.ts
      leads.ts
      kb.ts
      commandMenu.ts
      attachments.ts
      analytics.ts
    stores/                     ← existing useUIStore.ts stays here
      useUIStore.ts
  store/                        ← existing store folder
    leadsStore.ts               ← refactored
    uiStore.ts                  ← unchanged
    verificationStore.ts        ← refactored
    authStore.ts                ← new
    usersStore.ts               ← new
    kbStore.ts                  ← new
    commandMenuStore.ts         ← new
    analyticsStore.ts           ← new
```

---

## 9. Error Handling

- All API errors return `{ statusCode, message, data }` — Zod parses responses
- 422 responses include field-level errors → surfaced via `react-hook-form` `setError`
- 401 → silent refresh attempt, then logout if refresh fails
- 403 → show "Insufficient permissions" toast
- 429 → show "Too many requests, try again in X minutes" toast
- Network errors → show "Connection error" toast via `useUIStore` toast actions

---

*Design approved. Proceed to implementation plan.*
