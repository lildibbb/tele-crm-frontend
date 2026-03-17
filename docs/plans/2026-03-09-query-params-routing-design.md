# Lead Detail Routing — Query Params Migration Design

**Date:** 2026-03-09  
**Status:** Approved

## Problem

The app uses `output: "export"` (Cloudflare Pages static export). The dynamic route `/leads/[id]` only pre-generates `out/leads/0.html` via `generateStaticParams`. Navigating directly to `/leads/{real-uuid}` returns 404 because `out/leads/{uuid}/index.html` does not exist. The `_redirects` fallback (`/* /index.html 200`) is unreliable in this scenario.

## Solution

Migrate from path params to query params. Static pages at predictable paths always exist in the `out/` folder — no SPA fallback needed.

## Route Structure

| Old Route | New Route |
|-----------|-----------|
| `/leads/[id]` | `/leads/detail?id={uuid}` |
| `/leads/[id]/chat` | `/leads/chat?id={uuid}` |

Old `[id]` folder is **removed entirely** to avoid conflicts.

## File Changes

### New Pages (create)

- `src/app/(dashboard)/leads/detail/page.tsx`  
  Static page wrapping `<LeadDetailClient />` in `<Suspense>`.

- `src/app/(dashboard)/leads/chat/page.tsx`  
  Static page wrapping `<LeadChatClient />` in `<Suspense>`.

### Components (move + migrate)

- `src/app/(dashboard)/leads/[id]/_components/` → `src/app/(dashboard)/leads/detail/_components/`
- `src/app/(dashboard)/leads/[id]/chat/_components/` → `src/app/(dashboard)/leads/chat/_components/`

**`LeadDetailClient.tsx`** — replace `useParams()` with `useSearchParams()`:
```ts
// Before
const params = useParams();
const id = params.id as string;

// After
const searchParams = useSearchParams();
const id = searchParams.get("id") ?? "";
```

**`LeadChatClient.tsx`** — same swap + fix desktop redirect:
```ts
// Before
router.replace(`/leads/${id}`)

// After
router.replace(`/leads/detail?id=${id}`)
```

### Old Routes (delete)

- `src/app/(dashboard)/leads/[id]/` — entire folder removed

### Link Updates (6 files)

All `href="/leads/${id}"` → `href="/leads/detail?id=${id}"`:

1. `src/app/(dashboard)/leads/_components/leads-columns.tsx`
2. `src/components/dashboard/LiveActivityFeed.tsx`
3. `src/app/(dashboard)/verification/_components/verification-columns.tsx`
4. `src/components/mobile/MobileLeadsList.tsx`
5. `src/components/mobile/OwnerHome.tsx`
6. `src/components/mobile/StaffHome.tsx`

## TMA Pages

`/status` and `/submit` pages work correctly as static routes — **no changes required**.

## Bot URL Fix (Backend)

The `BOT_FORM_URL` env var on the backend bot is misconfigured (set to `/l` instead of `/submit`). This causes mystery `HEAD /l` 404s. Fix: set `BOT_FORM_URL=https://titanjournal-staging.adibasyraaf.com/submit` in the backend environment.

## Notes

- `useSearchParams()` requires `<Suspense>` wrapping in Next.js static export — both new page files must include it.
- `MobileLeadDetail` and `MobileLeadChat` receive `id` as props from parent components, not via hooks — no direct changes needed to those components.
