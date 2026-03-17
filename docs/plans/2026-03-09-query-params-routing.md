# Lead Detail Query Params Routing Migration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `/leads/[id]` dynamic routes with static `/leads/detail?id=` and `/leads/chat?id=` query-param routes so Cloudflare Pages static export always has the HTML file pre-generated.

**Architecture:** Delete the `[id]` dynamic route folder entirely. Create two new static page files (`leads/detail/page.tsx` and `leads/chat/page.tsx`) that wrap existing client components in `<Suspense>`. Client components switch from `useParams()` to `useSearchParams()`. All navigation links updated to the new URLs.

**Tech Stack:** Next.js 14 (static export), `useSearchParams` from `next/navigation`, vitest, pnpm

---

## Background

`output: "export"` in Next.js pre-generates only the paths returned by `generateStaticParams`. The old `/leads/[id]` route only generated `out/leads/0.html` — navigating directly to `/leads/{real-uuid}` returns 404 on Cloudflare Pages.

Migrating to query params means `out/leads/detail.html` always exists regardless of the `id` value. The `id` is read client-side via `useSearchParams()`.

---

## Task 1: Create `leads/detail/page.tsx` and move `_components`

**Files:**
- Create: `src/app/(dashboard)/leads/detail/page.tsx`
- Move (git mv): `src/app/(dashboard)/leads/[id]/_components/` → `src/app/(dashboard)/leads/detail/_components/`

**Step 1: Git-move the _components folder**

```bash
cd D:\Project\tele-crm-frontend
git mv "src/app/(dashboard)/leads/[id]/_components" "src/app/(dashboard)/leads/detail/_components"
```

Expected: folder now at `src/app/(dashboard)/leads/detail/_components/LeadDetailClient.tsx`

**Step 2: Create the new static page**

Create `src/app/(dashboard)/leads/detail/page.tsx`:

```tsx
import { Suspense } from "react";
import LeadDetailClient from "./_components/LeadDetailClient";

export default function LeadDetailPage() {
  return (
    <Suspense>
      <LeadDetailClient />
    </Suspense>
  );
}
```

No `generateStaticParams` — this is a static page with no dynamic segment.

**Step 3: Migrate LeadDetailClient to useSearchParams**

In `src/app/(dashboard)/leads/detail/_components/LeadDetailClient.tsx`:

Change line 4 — replace `useParams` import with `useSearchParams`:
```ts
// Before
import { useParams } from "next/navigation";

// After
import { useSearchParams } from "next/navigation";
```

Change lines 253-254 — replace useParams call:
```ts
// Before
const params = useParams();
const id = params.id as string;

// After
const searchParams = useSearchParams();
const id = searchParams.get("id") ?? "";
```

**Step 4: Run type-check to verify no errors in the migrated component**

```bash
cd D:\Project\tele-crm-frontend && npx tsc --noEmit 2>&1 | Select-String "leads/detail" 
```

Expected: no output (no errors in the detail component)

**Step 5: Commit**

```bash
git add "src/app/(dashboard)/leads/detail/"
git commit -m "feat: migrate leads detail to query params route"
```

---

## Task 2: Create `leads/chat/page.tsx` and move _components

**Files:**
- Create: `src/app/(dashboard)/leads/chat/page.tsx`
- Move (git mv): `src/app/(dashboard)/leads/[id]/chat/_components/` → `src/app/(dashboard)/leads/chat/_components/`

**Step 1: Git-move the chat _components folder**

```bash
git mv "src/app/(dashboard)/leads/[id]/chat/_components" "src/app/(dashboard)/leads/chat/_components"
```

Expected: file now at `src/app/(dashboard)/leads/chat/_components/LeadChatClient.tsx`

**Step 2: Create the new static chat page**

Create `src/app/(dashboard)/leads/chat/page.tsx`:

```tsx
import { Suspense } from "react";
import LeadChatClient from "./_components/LeadChatClient";

export default function LeadChatPage() {
  return (
    <Suspense>
      <LeadChatClient />
    </Suspense>
  );
}
```

**Step 3: Migrate LeadChatClient to useSearchParams**

Replace full content of `src/app/(dashboard)/leads/chat/_components/LeadChatClient.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsMobileHydrated } from "@/lib/hooks/useIsMobile";
import MobileLeadChat from "@/components/mobile/MobileLeadChat";

export default function LeadChatClient() {
  const isMobile = useIsMobileHydrated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  useEffect(() => {
    if (isMobile === false) {
      router.replace(`/leads/detail?id=${id}`);
    }
  }, [isMobile, router, id]);

  if (isMobile === undefined) return null;
  if (isMobile) return <MobileLeadChat />;
  return null;
}
```

**Step 4: Run type-check**

```bash
npx tsc --noEmit 2>&1 | Select-String "leads/chat"
```

Expected: no output

**Step 5: Commit**

```bash
git add "src/app/(dashboard)/leads/chat/"
git commit -m "feat: migrate leads chat to query params route"
```

---

## Task 3: Delete old `[id]` dynamic route folder

**Files:**
- Delete: `src/app/(dashboard)/leads/[id]/` (entire folder — only `page.tsx` and `chat/page.tsx` remain after task 1+2)

**Step 1: Delete the old dynamic route files**

```bash
git rm "src/app/(dashboard)/leads/[id]/page.tsx"
git rm "src/app/(dashboard)/leads/[id]/chat/page.tsx"
```

Then remove empty directories (if any remain):
```bash
# Check if anything is left
Get-ChildItem "src/app/(dashboard)/leads/[id]/" -Recurse
```

Expected: no files remaining

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove old [id] dynamic route folder"
```

---

## Task 4: Update all navigation links

Update every `href="/leads/${id}"` → `href="/leads/detail?id=${id}"` in 6 files.

**Files:**
- Modify: `src/app/(dashboard)/leads/_components/leads-columns.tsx` (lines 47, 236)
- Modify: `src/components/dashboard/LiveActivityFeed.tsx` (line 60)
- Modify: `src/app/(dashboard)/verification/_components/verification-columns.tsx` (line 275)
- Modify: `src/components/mobile/MobileLeadsList.tsx` (line 93)
- Modify: `src/components/mobile/OwnerHome.tsx` (line 269)
- Modify: `src/components/mobile/StaffHome.tsx` (line 242)

**Step 1: Update leads-columns.tsx (2 occurrences)**

Find and replace both occurrences of:
```ts
href={`/leads/${lead.id}`}
```
with:
```ts
href={`/leads/detail?id=${lead.id}`}
```

**Step 2: Update LiveActivityFeed.tsx**

Find:
```ts
href={`/leads/${row.id}`}
```
Replace with:
```ts
href={`/leads/detail?id=${row.id}`}
```

**Step 3: Update verification-columns.tsx**

Find:
```ts
<Link href={`/leads/${lead.id}`}>
```
Replace with:
```ts
<Link href={`/leads/detail?id=${lead.id}`}>
```

**Step 4: Update MobileLeadsList.tsx**

Find:
```ts
<Link href={`/leads/${lead.id}`} className="block">
```
Replace with:
```ts
<Link href={`/leads/detail?id=${lead.id}`} className="block">
```

**Step 5: Update OwnerHome.tsx**

Find:
```ts
<Link key={lead.id} href={`/leads/${lead.id}`}>
```
Replace with:
```ts
<Link key={lead.id} href={`/leads/detail?id=${lead.id}`}>
```

**Step 6: Update StaffHome.tsx**

Find:
```ts
<Link key={lead.id} href={`/leads/${lead.id}`}>
```
Replace with:
```ts
<Link key={lead.id} href={`/leads/detail?id=${lead.id}`}>
```

**Step 7: Verify no old links remain**

```bash
cd D:\Project\tele-crm-frontend
Select-String -Path "src/**/*.tsx","src/**/*.ts" -Pattern 'href=.*`/leads/\$\{' -Recurse
```

Expected: no results (all old-style lead links replaced)

**Step 8: Commit**

```bash
git add src/
git commit -m "feat: update all lead detail links to query params"
```

---

## Task 5: Full verification

**Step 1: Run type-check**

```bash
cd D:\Project\tele-crm-frontend && npx tsc --noEmit
```

Expected: only the pre-existing errors in `(auth)/forgot-password` and `(auth)/reset-password` (zod/framer-motion incompatibility). Zero new errors.

**Step 2: Run tests**

```bash
pnpm test
```

Expected: 139 tests pass

**Step 3: Run production build**

```bash
pnpm build
```

Expected: build succeeds, `out/leads/detail.html` and `out/leads/chat.html` exist

**Step 4: Verify static files exist**

```bash
Test-Path "out/leads/detail.html" 
Test-Path "out/leads/chat.html"
```

Expected: both `True`

**Step 5: Verify old dynamic files do NOT exist**

```bash
Test-Path "out/leads/0"
```

Expected: `False` (old pre-generated dynamic path is gone)

**Step 6: Commit if not already on clean state**

```bash
git status
```

Expected: clean working tree

---

## Task 6: Push and deploy

**Step 1: Push to develop branch**

```bash
git push origin develop
```

Expected: CI pipeline triggers (`lint → type-check → test → build → deploy-staging`)

**Step 2: Verify Cloudflare Pages deployment**

After CI completes (~3-5 min), open:
- `https://titanjournal-staging.adibasyraaf.com/leads/detail?id=3ebad227-f0e8-4e19-9f38-1f8e0e1d9ce0`

Expected: Lead detail page loads (no 404)

**Step 3: Verify chat page**

Open: `https://titanjournal-staging.adibasyraaf.com/leads/chat?id=3ebad227-f0e8-4e19-9f38-1f8e0e1d9ce0`

On mobile: Lead chat page loads  
On desktop: Redirects to `/leads/detail?id=3ebad227-...`

---

## Out of Scope (Backend Fix)

The mystery `HEAD /l` 404 is caused by `BOT_FORM_URL` being misconfigured on the Telegram bot backend. Fix by setting:
```
BOT_FORM_URL=https://titanjournal-staging.adibasyraaf.com/submit
```
in the backend environment (NestJS project). This is not a frontend change.
