# API Integration Design — Titan Journal CRM Frontend

**Date:** 2026-02-24  
**Scope:** Remove all mock data from page components. Wire every page to its Zustand store / API endpoint. Add Zod-validated shadcn forms for all POST/PATCH mutations.

---

## 1. Problem Statement

The backend API, Axios client, Zod schemas, and Zustand stores are all correctly implemented. The **gap** is in the page components: they hold hardcoded mock arrays instead of calling their stores on mount, and mutation forms submit raw objects instead of using Zod validation + shadcn Form.

Six pages contain mock data. Five form interactions lack Zod/shadcn Form wiring.

---

## 2. Architecture Decision

**Chosen approach: Pure client-side Zustand (existing pattern)**

- All data fetching is `useEffect` → `store.fetch*()` on mount
- Stores are the single source of truth — pages subscribe to store slices
- Forms use `react-hook-form` + `zodResolver` with existing Zod schemas
- Optimistic updates are already handled in stores that need them (commandMenuStore reorder)
- No server actions, no React Query — matches existing codebase 100%

**Rejected alternatives:**
- Next.js server actions for mutations — would mix patterns, big refactor, not justified
- React Query overlay — overkill, existing Zustand stores already handle loading/error state

---

## 3. Analytics Gap Resolution

The backend analytics API returns **count-based data only**:
```
{ newLeads, registeredLeads, depositReported, depositConfirmed }
```

The current analytics page renders monetary AUM charts with hardcoded values. **Decision:** replace AUM/monetary charts with count-based pipeline charts using real API data. No fake financial data will be shown.

Chart mapping:
| Old chart | New chart (real data) |
|---|---|
| BarChart "lead flow" | Keep — `newLeads` per week/month from `analyticsStore.weekly/monthly` |
| Funnel bars | Derive from `analyticsStore.dashboard` totals |
| AUM AreaChart (monetary, fake) | Replace with "Deposit Pipeline" AreaChart — `depositReported` + `depositConfirmed` counts |
| KPI stat chips | `dashboard.totalLeads`, `dashboard.newLeads`, `dashboard.depositConfirmed` |

---

## 4. Page-by-Page Integration Map

### 4.1 Dashboard Home — `(dashboard)/page.tsx`

| What | Source | Action |
|---|---|---|
| KPI cards (total leads, registered, deposits, confirmations) | `analyticsStore.dashboard` | `fetchDashboard()` on mount |
| Recent activity feed | `leadsStore.leads` (last 5 by updatedAt) | `fetchLeads()` on mount |
| Funnel donut chart | `analyticsStore.dashboard` (5 status counts) | derived from dashboard |
| Funnel bars | `analyticsStore.dashboard` | derived |

**Required store action:** `useEffect(() => { fetchDashboard(); fetchLeads(); }, [])`

### 4.2 Analytics — `(dashboard)/analytics/page.tsx`

| Range | API call | Store field |
|---|---|---|
| day / week | `fetchWeekly({ weeks: 4 })` | `analyticsStore.weekly[]` |
| month / 90d | `fetchMonthly({ months: 12 })` | `analyticsStore.monthly[]` |
| header KPIs | `fetchDashboard()` | `analyticsStore.dashboard` |

Replace entire `DATA` constant with computed values from store. Keep the range tab UI but map to API params.

### 4.3 Team — `settings/team/page.tsx`

| What | Source | Store action |
|---|---|---|
| Members table | `usersStore.users` | `fetchUsers()` on mount |
| Pending invites table | `usersStore.invitations` | `fetchInvitations()` on mount |
| Invite form | `POST /users/invite` | `usersStore.inviteUser()` |
| Deactivate user | `PATCH /users/{id}/deactivate` | `usersStore.deactivateUser()` |
| Change role | `PATCH /users/{id}/role` | `usersStore.changeRole()` |

**New shadcn Form:** Invite user modal — `role` (Select, required) + `email` (Input, optional)  
Zod schema: `InviteUserSchema` already exists in `user.schema.ts`

### 4.4 Sessions — `settings/sessions/page.tsx`

No dedicated store exists for sessions. Two options:
- **Option A (simple):** Call `authApi.getSessions()` directly in `useEffect`, store in local `useState`
- **Option B:** Add `sessionsStore` to `authStore`

**Decision:** Option A — sessions are user-specific, ephemeral, no cross-page sharing needed. Local state + direct API call.

Actions:
- `authApi.getSessions()` on mount → replace `SESSIONS` array
- `authApi.revokeSession(id)` on "Revoke" click
- `authApi.revokeAllSessions()` on "Logout everywhere"

### 4.5 Knowledge Base — `settings/knowledge-base/page.tsx`

| What | Source | Store action |
|---|---|---|
| Entry list | `kbStore.entries` | `fetchAll()` on mount |
| Create text entry | `POST /knowledge-base/text` | `kbStore.createText()` |
| Upload file | `POST /knowledge-base/upload` | `kbStore.uploadFile()` |
| Toggle active | `PATCH /knowledge-base/{id}` | `kbStore.update({ isActive })` |
| Delete entry | `DELETE /knowledge-base/{id}` | `kbStore.remove()` |
| SSE status | EventSource `/knowledge-base/status` | `kbStore.watchProcessing()` |

**New shadcn Form:** Create text entry dialog — `title` (Input, min 3), `content` (Textarea, min 10), `type` (Select: TEXT/LINK/TEMPLATE), `url` (Input, optional, shown for LINK/TEMPLATE)  
Zod schema: `CreateKbSchema` already exists in `kb.schema.ts`

### 4.6 Commands — `settings/commands/page.tsx`

| What | Source | Store action |
|---|---|---|
| Command list | `commandMenuStore.items` | `fetchAll()` on mount |
| Create command | `POST /command-menu` | `commandMenuStore.create()` |
| Edit command | `PATCH /command-menu/{id}` | `commandMenuStore.update()` |
| Delete command | `DELETE /command-menu/{id}` | `commandMenuStore.remove()` |
| Reorder | `PATCH /command-menu/reorder` | `commandMenuStore.reorder()` |

**New shadcn Form:** Create/edit command sheet — `command` (Input, /slash prefix), `label` (Input), `description` (Input, optional), `content` (Textarea)  
Zod schema: needs `CreateCommandMenuSchema` added to `commandMenu.schema.ts`

---

## 5. Forms Requiring Zod + shadcn Form

| Form | Page | Schema (file) | Method |
|---|---|---|---|
| Invite user | `settings/team` | `InviteUserSchema` (`user.schema.ts`) | `POST /users/invite` |
| Create KB text | `settings/knowledge-base` | `CreateKbSchema` (`kb.schema.ts`) | `POST /knowledge-base/text` |
| Create command | `settings/commands` | `CreateCommandMenuSchema` (to add) | `POST /command-menu` |
| Edit command | `settings/commands` | `UpdateCommandMenuSchema` (to add) | `PATCH /command-menu/{id}` |
| Change own password | `settings/page.tsx` (or profile) | `ChangeOwnPasswordSchema` (`auth.schema.ts`) | `PATCH /auth/change-own-password` |

All forms follow the same pattern:
```tsx
const form = useForm<SchemaType>({ resolver: zodResolver(Schema) });
const onSubmit = form.handleSubmit(async (data) => {
  await store.action(data);
  toast.success("...");
  form.reset();
});
// JSX: <Form><FormField><FormItem><FormLabel><FormControl><Input/><FormMessage/></FormItem></FormField></Form>
```

---

## 6. Loading & Error States

Each connected page will:
1. Show a `Skeleton` component while `isLoading === true` (matches existing skeleton patterns in codebase)
2. Show a `toast.error(store.error)` when `error !== null`
3. Clear error after display

Pattern (reusable):
```tsx
useEffect(() => {
  if (storeError) {
    toast.error(storeError);
  }
}, [storeError]);
```

---

## 7. Zod Schema Additions Needed

### `commandMenu.schema.ts` — add input schemas
```ts
export const CreateCommandMenuSchema = z.object({
  command: z.string().min(1).regex(/^\//, "Must start with /"),
  label: z.string().min(1).max(60),
  description: z.string().max(200).optional(),
  content: z.object({}).passthrough(), // Tiptap JSON — validated loosely
});
export type CreateCommandMenuInput = z.infer<typeof CreateCommandMenuSchema>;

export const UpdateCommandMenuSchema = CreateCommandMenuSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateCommandMenuInput = z.infer<typeof UpdateCommandMenuSchema>;

export const ReorderCommandMenuSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number().int().min(0) })),
});
export type ReorderCommandMenuInput = z.infer<typeof ReorderCommandMenuSchema>;
```

> Note: `commandMenu.schema.ts` currently only has response types. Input types are imported from it in `commandMenuApi` and `commandMenuStore` but the schema objects themselves are missing — they need to be added.

---

## 8. Implementation Order

Ordered by dependency (independent pages first, shared infra first):

1. **`commandMenu.schema.ts`** — add missing input Zod schemas (unblocks commands page form)
2. **`(dashboard)/page.tsx`** — wire `fetchDashboard` + `fetchLeads`, replace mock KPIs + activity
3. **`analytics/page.tsx`** — wire `fetchWeekly` + `fetchMonthly` + `fetchDashboard`, replace DATA const
4. **`settings/sessions/page.tsx`** — local state + direct `authApi` calls, replace SESSIONS mock
5. **`settings/team/page.tsx`** — wire `usersStore`, add invite form with `InviteUserSchema`
6. **`settings/knowledge-base/page.tsx`** — wire `kbStore`, add create text form with `CreateKbSchema`
7. **`settings/commands/page.tsx`** — wire `commandMenuStore`, add create/edit form

---

## 9. Out of Scope

- `settings/page.tsx` (bot config) — no backend endpoint for bot config in swagger; leave as static UI
- `admin/page.tsx` — role-gated page, check if any new endpoints needed
- Mobile components (already wired to stores via pass-through)
- Auth forms (login, forgot-password, reset-password) — already wired in previous sessions

---

## 10. Success Criteria

- [ ] Zero hardcoded mock arrays in page components
- [ ] All GET data loads from API on page mount
- [ ] All mutation forms use `zodResolver` + shadcn `Form` components
- [ ] `pnpm tsc --noEmit` passes with zero errors
- [ ] Loading skeletons shown while fetching
- [ ] API errors surfaced via `toast.error`
