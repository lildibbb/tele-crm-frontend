# Feature Visibility Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate the FOUC (flash of uncontrolled content) on page refresh and make all 6 un-guarded surfaces respect the superadmin feature-visibility toggles.

**Architecture:** All fixes live in the frontend (`D:\Project\tele-crm-frontend`). The data source is `useFeatureVisibility()` from `src/queries/useMaintenanceQuery.ts`. Each task is a self-contained surgical edit to one component. No backend changes needed.

**Tech Stack:** Next.js 14 (App Router), React Query (`@tanstack/react-query`), TypeScript

---

## Context: How Visibility Works

`useFeatureVisibility()` returns `VisibilityFlags`:

```ts
{
  googleSheets: boolean;
  googleDriveServiceAccount: boolean;
  googleDriveOAuth2: boolean;
  followUps: boolean;
}
```

- Superadmins (`UserRole.SUPERADMIN`) **always** see every feature regardless of flags.
- Non-superadmin roles see a feature only when its flag is `true`.
- If all three Google flags are `false` → the entire Integrations section should vanish.
- If `followUps` is `false` → Follow-ups page, sidebar link, and mobile drawer link vanish.

---

## Task 1: Fix FOUC — Default visibility to hidden during loading

**Problem:** `DEFAULT_VISIBILITY` at `src/queries/useMaintenanceQuery.ts:34-38` is all-`true`. `useMaintenanceConfig()` uses `placeholderData: DEFAULT_CONFIG`. So on every hard refresh, all features flash visible for ~200ms before the real API response arrives and hides them.

**Fix:** Change `DEFAULT_VISIBILITY` to all-`false` so the placeholder hides everything during loading. The real data (where keys are absent from DB) still evaluates to `true` via `data['...'] !== 'false'` — this is correct for first-time setups. Also update `useFeatureVisibility()` to expose `isLoading` for components that need to render a skeleton instead of nothing.

**Files:**
- Modify: `src/queries/useMaintenanceQuery.ts`

**Step 1: Edit DEFAULT_VISIBILITY and useFeatureVisibility**

Open `src/queries/useMaintenanceQuery.ts`. Change lines 34–38 from:
```ts
const DEFAULT_VISIBILITY: VisibilityFlags = {
  googleSheets: true,
  googleDriveServiceAccount: true,
  googleDriveOAuth2: true,
  followUps: true,
};
```
To:
```ts
const DEFAULT_VISIBILITY: VisibilityFlags = {
  googleSheets: false,
  googleDriveServiceAccount: false,
  googleDriveOAuth2: false,
  followUps: false,
};
```

Then update the `useFeatureVisibility` function (lines 86–89) from:
```ts
export function useFeatureVisibility(): VisibilityFlags {
  const { data } = useMaintenanceConfig();
  return data?.visibilityFlags ?? DEFAULT_VISIBILITY;
}
```
To:
```ts
export function useFeatureVisibility(): VisibilityFlags & { isLoading: boolean } {
  const { data, isLoading, isPlaceholderData } = useMaintenanceConfig();
  return {
    ...(data?.visibilityFlags ?? DEFAULT_VISIBILITY),
    isLoading: isLoading || isPlaceholderData,
  };
}
```

**Step 2: Verify TypeScript is happy**

```powershell
cd D:\Project\tele-crm-frontend
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-String "useFeatureVisibility|useMaintenanceQuery"
```
Expected: No errors on these files (there may be pre-existing errors elsewhere — ignore those).

**Step 3: Commit**

```powershell
git add src/queries/useMaintenanceQuery.ts
git commit -m "fix(visibility): default visibility to hidden during loading to prevent FOUC

- DEFAULT_VISIBILITY now all-false so placeholder data hides features
- useFeatureVisibility now returns isLoading flag for skeleton support
- First-time setup unaffected: absent DB keys still evaluate to true

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 2: Fix settings-tabs.tsx — hide Integrations tab when all Google features are hidden

**Problem:** `src/app/(dashboard)/settings/_components/settings-tabs.tsx` line 74–77: `SETTINGS_TABS` `useMemo` only filters by `role`. The "Integrations" tab button is always visible for Owner/Admin/Superadmin even when all three Google flags are `false`.

**Files:**
- Modify: `src/app/(dashboard)/settings/_components/settings-tabs.tsx`

**Step 1: Add visibility imports and hook call**

At the top of the file, add to the imports:
```ts
import { useFeatureVisibility } from "@/queries/useMaintenanceQuery";
```

**Step 2: Destructure visibility inside SettingsTabs()**

After line 72 (`const role = user?.role as UserRole | undefined;`), add:
```ts
const { googleSheets, googleDriveServiceAccount, googleDriveOAuth2, isLoading: visibilityLoading } =
  useFeatureVisibility();
const isSuperAdmin = role === UserRole.SUPERADMIN;
const allGoogleHidden =
  !visibilityLoading &&
  !isSuperAdmin &&
  !googleSheets &&
  !googleDriveServiceAccount &&
  !googleDriveOAuth2;
```

**Step 3: Update useMemo to filter Integrations tab**

Change the `useMemo` block from:
```ts
const SETTINGS_TABS = useMemo(
  () => ALL_SETTINGS_TABS.filter((t) => role && t.roles.includes(role)),
  [role],
);
```
To:
```ts
const SETTINGS_TABS = useMemo(() => {
  const byRole = ALL_SETTINGS_TABS.filter((t) => role && t.roles.includes(role));
  if (allGoogleHidden) return byRole.filter((t) => t.value !== "integrations");
  return byRole;
}, [role, allGoogleHidden]);
```

**Step 4: Type-check**

```powershell
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-String "settings-tabs"
```
Expected: No errors.

**Step 5: Commit**

```powershell
git add src/app/(dashboard)/settings/_components/settings-tabs.tsx
git commit -m "fix(visibility): hide Integrations tab from settings when all Google features are off

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 3: Fix MobileIntegrations.tsx — add visibility gating to all three cards

**Problem:** `src/components/mobile/MobileIntegrations.tsx` (639–870) renders all three cards unconditionally. There is no `useFeatureVisibility()` call anywhere in the file.

**Files:**
- Modify: `src/components/mobile/MobileIntegrations.tsx`

**Step 1: Import useFeatureVisibility**

In the imports section (around line 32–42), add:
```ts
import { useFeatureVisibility } from "@/queries/useMaintenanceQuery";
import { UserRole } from "@/types/enums";
```

**Step 2: Call the hook inside MobileIntegrations**

After line 643 (`const role = user?.role ?? "STAFF";`), add:
```ts
const {
  googleSheets: visGoogleSheets,
  googleDriveServiceAccount: visGoogleDriveSA,
  googleDriveOAuth2: visGoogleDriveOAuth2,
  isLoading: visibilityLoading,
} = useFeatureVisibility();
const isSuperAdmin = role === UserRole.SUPERADMIN;
```

**Step 3: Add full-page redirect when nothing is visible**

After the existing role guard (line 716–717), add:
```ts
// If all Google features are hidden and not superadmin, redirect away
const allHidden =
  !visibilityLoading &&
  !isSuperAdmin &&
  !visGoogleSheets &&
  !visGoogleDriveSA &&
  !visGoogleDriveOAuth2;
if (allHidden) {
  router.replace("/settings");
  return null;
}
```

**Step 4: Gate each card**

Inside the `<div className="space-y-4">` block (line 796), wrap each card:

**Google Sheets card** (lines 798–822): wrap with
```tsx
{(isSuperAdmin || visGoogleSheets) && (
  <IntegrationCard
    icon={...}
    name={...}
    {/* ...all existing props */}
  />
)}
```

**Google Drive SA card** (lines 825–844): wrap with
```tsx
{(isSuperAdmin || visGoogleDriveSA) && (
  <IntegrationCard
    icon={...}
    name={...}
    {/* ...all existing props */}
  />
)}
```

**Google Drive OAuth2 card** (line 847): wrap with
```tsx
{(isSuperAdmin || visGoogleDriveOAuth2) && (
  <GoogleDriveConnectionCard />
)}
```

**Step 5: Type-check**

```powershell
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-String "MobileIntegrations"
```
Expected: No errors.

**Step 6: Commit**

```powershell
git add src/components/mobile/MobileIntegrations.tsx
git commit -m "fix(visibility): add feature visibility gating to MobileIntegrations cards

- All three Google cards now respect useFeatureVisibility()
- Redirects to /settings if no cards are visible for current user
- Superadmins always see all cards

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 4: Fix MobileSettings.tsx — hide Integrations nav row when all Google features are hidden

**Problem:** `src/components/mobile/MobileSettings.tsx` line 254–256 unconditionally shows `INTEGRATION_ITEM` (the nav link to `/settings/integrations`) for Owner/Admin/Superadmin. No visibility check.

**Files:**
- Modify: `src/components/mobile/MobileSettings.tsx`

**Step 1: Import useFeatureVisibility**

Add to imports (near the top of the file):
```ts
import { useFeatureVisibility } from "@/queries/useMaintenanceQuery";
import { UserRole } from "@/types/enums";
```

**Step 2: Call the hook inside the component**

After `const { user, logout } = useAuthStore();`, add:
```ts
const {
  googleSheets,
  googleDriveServiceAccount,
  googleDriveOAuth2,
  isLoading: visibilityLoading,
} = useFeatureVisibility();
const isSuperAdmin = (user?.role as UserRole) === UserRole.SUPERADMIN;
const allGoogleHidden =
  !visibilityLoading &&
  !isSuperAdmin &&
  !googleSheets &&
  !googleDriveServiceAccount &&
  !googleDriveOAuth2;
```

**Step 3: Gate the INTEGRATION_ITEM row**

Change lines 254–256 from:
```tsx
{(role === "OWNER" || role === "ADMIN" || role === "SUPERADMIN") && (
  <NavRow item={INTEGRATION_ITEM} />
)}
```
To:
```tsx
{(role === "OWNER" || role === "ADMIN" || role === "SUPERADMIN") &&
  !allGoogleHidden && <NavRow item={INTEGRATION_ITEM} />}
```

**Step 4: Type-check**

```powershell
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-String "MobileSettings"
```
Expected: No errors.

**Step 5: Commit**

```powershell
git add src/components/mobile/MobileSettings.tsx
git commit -m "fix(visibility): hide Integrations nav row in MobileSettings when all Google features off

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 5: Fix MobileGlobalLayout.tsx — gate Follow-ups in MoreDrawer quick links

**Problem:** `src/components/mobile/MobileGlobalLayout.tsx` line 132–160: `getQuickLinks(role)` is a pure function that always includes `{ label: "Follow-ups", href: "/follow-ups", Icon: Timer }` in the `common` list. `MoreDrawer` calls it with only `role`, never passing visibility state.

**Files:**
- Modify: `src/components/mobile/MobileGlobalLayout.tsx`

**Step 1: Import useFeatureVisibility**

Add to imports:
```ts
import { useFeatureVisibility } from "@/queries/useMaintenanceQuery";
```

**Step 2: Refactor getQuickLinks to accept visibility and isSuperAdmin**

Change the signature and body of `getQuickLinks`:
```ts
function getQuickLinks(
  role: UserRole,
  visibility: { followUps: boolean },
  isSuperAdmin: boolean,
): QuickLink[] {
  const showFollowUps = isSuperAdmin || visibility.followUps;
  const common: QuickLink[] = [
    { label: "Analytics", href: "/analytics", Icon: ChartBar },
    { label: "Broadcasts", href: "/broadcasts", Icon: Megaphone },
    ...(showFollowUps ? [{ label: "Follow-ups", href: "/follow-ups", Icon: Timer }] : []),
    { label: "Audit Logs", href: "/audit-logs", Icon: ClipboardText },
    { label: "Settings", href: "/settings", Icon: Sliders },
    { label: "Docs", href: "/docs", Icon: BookOpen },
  ];
  if (role === "SUPERADMIN") {
    return [
      { label: "Users", href: "/admin/users", Icon: Users },
      { label: "Queues", href: "/admin/queues", Icon: Queue },
      { label: "Sessions", href: "/admin/sessions", Icon: DeviceMobile },
      { label: "Google", href: "/admin/google", Icon: GoogleLogo },
      { label: "System", href: "/admin/system", Icon: Wrench },
      { label: "Backup", href: "/admin/backup", Icon: HardDrives },
      { label: "Secrets", href: "/admin/secrets", Icon: Key },
      { label: "Maintenance", href: "/admin/maintenance", Icon: Warning },
      { label: "Analytics", href: "/analytics", Icon: ChartBar },
      { label: "Settings", href: "/settings", Icon: Sliders },
      { label: "Docs", href: "/docs", Icon: BookOpen },
    ];
  }
  if (role === "STAFF") {
    return common.filter((l) => !["Audit Logs"].includes(l.label));
  }
  return common;
}
```

**Step 3: Call useFeatureVisibility inside MoreDrawer**

Inside the `MoreDrawer` component, after line 173 (`const role = ...`), add:
```ts
const { followUps: followUpsVisible } = useFeatureVisibility();
const isSuperAdmin = role === UserRole.SUPERADMIN;
```

Then change line 178 (`const links = getQuickLinks(role);`) to:
```ts
const links = getQuickLinks(role, { followUps: followUpsVisible }, isSuperAdmin);
```

**Step 4: Type-check**

```powershell
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-String "MobileGlobalLayout"
```
Expected: No errors.

**Step 5: Commit**

```powershell
git add src/components/mobile/MobileGlobalLayout.tsx
git commit -m "fix(visibility): hide Follow-ups from mobile MoreDrawer when feature is toggled off

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 6: Fix MobileFollowUps.tsx — add visibility guard at page level

**Problem:** `src/components/mobile/MobileFollowUps.tsx` has no visibility guard. Users with the follow-ups feature hidden can still navigate directly to `/follow-ups` on mobile and see the full page.

**Files:**
- Modify: `src/components/mobile/MobileFollowUps.tsx`

**Step 1: Find the top of the component function**

Open `src/components/mobile/MobileFollowUps.tsx` and locate the main export function. Identify where `useRouter` and `useAuthStore` are already imported (they likely are).

**Step 2: Add visibility check at top of function body**

Import `useFeatureVisibility` if not already:
```ts
import { useFeatureVisibility } from "@/queries/useMaintenanceQuery";
import { UserRole } from "@/types/enums";
```

Near the top of the component function body (after existing hook calls), add:
```ts
const { followUps: followUpsVisible, isLoading: visibilityLoading } = useFeatureVisibility();
const isSuperAdmin = (user?.role as UserRole) === UserRole.SUPERADMIN;

// Redirect if follow-ups feature is hidden and we have confirmed visibility data
if (!visibilityLoading && !isSuperAdmin && !followUpsVisible) {
  router.replace("/");
  return null;
}
```

> **Important:** If `useRouter` or `user` from `useAuthStore` is not yet imported, add those imports too. Do NOT call hooks conditionally — the redirect check must come after all hooks.

**Step 3: Type-check**

```powershell
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-String "MobileFollowUps"
```
Expected: No errors.

**Step 4: Commit**

```powershell
git add src/components/mobile/MobileFollowUps.tsx
git commit -m "fix(visibility): redirect to home when follow-ups feature is hidden (mobile)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Final Verification

After all 6 tasks:

```powershell
# Full type-check — ignore pre-existing app.controller.spec.ts error
.\node_modules\.bin\tsc --noEmit 2>&1 | Where-Object { $_ -notmatch "app.controller.spec" }
```

Expected: 0 new errors introduced by these changes.

**Manual test checklist:**
1. Toggle off all Google features in superadmin panel → refresh → Integrations tab is absent from settings **immediately** (no flash)
2. On mobile, navigate to Settings → Integrations row is absent
3. On mobile, navigate directly to `/settings/integrations` → redirected away
4. Toggle off Follow-ups → refresh → Follow-ups absent from sidebar, mobile drawer, and direct `/follow-ups` redirects to home
5. Log in as Superadmin → all features still visible regardless of toggles
6. Toggle everything back on → all features reappear after next page load
