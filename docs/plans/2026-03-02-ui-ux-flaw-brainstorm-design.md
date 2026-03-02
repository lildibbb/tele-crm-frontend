# UI/UX Flaw Brainstorm — Titan Journal CRM
**Date:** 2026-03-02  
**Status:** Backlog · Not yet implemented  
**Scope:** Desktop dashboard (all pages)

---

## Context

This document captures observed UI/UX gaps and friction points across the dashboard after the March 2026 visual revamp (premium KPI cards, neutral icons, modal redesign, sidebar border fix, USD standardization). These are ranked by user-facing impact.

---

## Identified Flaws & Improvement Opportunities

### 1. ❌ Empty States — Missing Zero-State Design
**Pages affected:** Verification Queue, Lead Intelligence, Broadcasts, Follow-ups  
**Problem:** When a table has no data, the user sees a blank area with no guidance. There's no illustration, no CTA, no explanation of why it's empty (filtered? genuinely empty?).  
**Proposed fix:**  
- Add an `<EmptyState>` component: minimal icon + heading + sub-copy  
- Distinguish between "no data yet" (onboarding CTA) vs "no results for filter" (clear-filter CTA)  
- Verification Queue empty: "All caught up — no pending deposits" with a shield icon

---

### 2. ❌ Table Row Hover — No Visual Feedback
**Pages affected:** Lead Intelligence, Verification Queue, Audit Logs  
**Problem:** DataTable rows have no hover highlight. Users have no affordance that rows are interactive or clickable. This is especially jarring for leads where clicking navigates to the detail page.  
**Proposed fix:**  
- Add `hover:bg-elevated/60 cursor-pointer` to tbody rows globally via DataTable
- Add a subtle right-arrow indicator on hover for navigable rows

---

### 3. ❌ Verification Queue — No Search / Filter
**Pages affected:** Verification Queue  
**Problem:** The queue has 2 tab filters (Pending / All) but no name search, date range, or amount filter. With 50+ leads, finding a specific deposit is impossible.  
**Proposed fix:**  
- Add a search input (by name or broker ID) in the queue panel header  
- Optional: date range picker for submitted date  
- Use URL params for filter state (bookmarkable)

---

### 4. ❌ Action Feedback — No In-Row Confirmation
**Pages affected:** Verification Queue  
**Problem:** After approving or rejecting a lead, the row disappears from the PENDING tab (correct), but there's no visual confirmation at the row level — just a toast that's easy to miss. If the toast is dismissed or missed, the user doesn't know if the action succeeded.  
**Proposed fix:**  
- Flash the row green (approve) or red (reject) for 400ms before removing  
- Optimistic update with a "Undo" toast for 4 seconds

---

### 5. ⚠️ DataTableSkeleton — Generic Column Widths
**Pages affected:** All data tables  
**Problem:** `DataTableSkeleton` renders uniform column widths. Real tables have narrow (status, date) and wide (name, actions) columns. The mismatch causes a jarring layout jump when data loads.  
**Proposed fix:**  
- Pass `columnWidths` array to `DataTableSkeleton`  
- Per-page: verification skeleton should match Lead/HFM/Amount/Date/Status/Actions widths

---

### 6. ⚠️ Topbar — Minimal Context, No Breadcrumb
**Pages affected:** All pages  
**Problem:** The topbar only shows a sidebar toggle, LIVE indicator, locale switcher, and theme toggle. There's no page title, no breadcrumb navigation, and no user context visible at a glance.  
**Proposed fix:**  
- Add a page title/breadcrumb section in the topbar center-left  
- On sub-pages (e.g., `/leads/[id]`), show "Lead Intelligence › John Doe"  
- Keep the right-side controls as-is

---

### 7. ⚠️ Analytics Charts — Color Overload
**Pages affected:** Analytics  
**Problem:** The funnel chart uses 4 distinct brand colors (crimson, purple, amber, teal) simultaneously. The trend area chart uses 3 more. The combined effect is visually noisy and doesn't feel premium.  
**Proposed fix:**  
- Funnel: use a single crimson hue at 4 opacity levels (100% → 25%), not 4 different colors  
- Trend chart: keep crimson (primary) + a neutral gray-blue (secondary) — max 2 series visible at a time  
- Add a toggle to show/hide individual series

---

### 8. ⚠️ Mobile Parity Gaps
**Pages affected:** Mobile versions of Verification Queue, Analytics  
**Problem:** Desktop received significant UI polish (neutral KPIs, premium badges, shadow cards). The mobile components (`MobileVerification`, `MobileAnalytics`) were not updated and may have the old colored KPI numbers and avatar placeholders.  
**Proposed fix:**  
- Audit each mobile component against desktop changes  
- Apply same badge, avatar, and amount format standards

---

### 9. 💡 Lead Detail Page — Section Density
**Pages affected:** `/leads/[id]`  
**Problem:** The lead detail page is very dense with tabs, interaction logs, attachments, and status controls all fighting for space. On 13" laptops the page requires heavy scrolling.  
**Proposed fix:**  
- Consider a 2-column layout: left column for identity/status/meta, right column for interaction timeline  
- Collapse attachment section by default (show count badge)

---

### 10. 💡 Follow-ups / Broadcasts — No Progress Indicator
**Pages affected:** Broadcasts, Follow-ups  
**Problem:** When sending a broadcast or creating a follow-up sequence, there's no visual progress bar or step indicator. The user can't tell how far they are in the flow.  
**Proposed fix:**  
- Multi-step form with a step indicator (Step 1 of 3)  
- Summary review step before submission

---

## Priority Order

| Priority | Flaw | Effort | Impact |
|----------|------|--------|--------|
| P0 | #2 Table row hover | Low | High |
| P0 | #1 Empty states | Medium | High |
| P1 | #3 Verification search | Medium | High |
| P1 | #5 Skeleton widths | Low | Medium |
| P1 | #8 Mobile parity | Medium | High |
| P2 | #4 In-row action feedback | Medium | Medium |
| P2 | #6 Topbar breadcrumb | Medium | Medium |
| P2 | #7 Analytics color reduction | Medium | Medium |
| P3 | #9 Lead detail layout | High | Medium |
| P3 | #10 Multi-step flows | High | Medium |

---

## Next Actions

1. Start with **#2 (row hover)** — single CSS change, high visibility improvement
2. Then **#1 (empty states)** — build reusable `<EmptyState>` component  
3. Then **#3 (verification search)** — adds real utility for ops team
4. Run **mobile audit** (#8) in parallel with #1

