# Auth Pages UI/UX Revamp — Design Document
> **Date:** 2026-03-04  
> **Scope:** `/login`, `/forgot-password`, `/reset-password`, `/setup-account`  
> **Design System:** Titan Journal CRM v3.0 (DESIGN.md)

---

## Problem Statement

The auth pages have three core issues:
1. **Login left panel** is visually empty after removing the cinematic image — just bare glow blobs and sparse text.
2. **Colored background icon wrappers** (`bg-crimson/20 border border-crimson/30 rounded-2xl`) are used on all utility pages — feels generic, not premium.
3. **Demo label** (`Demo: Enter 1234 to verify`) is exposed in the reset-password flow.
4. Inconsistent card styling, form label treatment, and input focus states across the 4 pages.

---

## Approach: "Signal Network"

Pure CSS/SVG, no image dependencies. Light + dark mode via existing CSS variable system.

---

## Design Specification

### 1. Login Page — Left Panel (Signal Network)

**Layout:** Keep 55% / 45% split. Left panel = `bg-base overflow-hidden relative`.

**Signal Network SVG:**
- Inline `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` positioned `absolute inset-0 w-full h-full pointer-events-none`
- **25 nodes** as `<circle r="0.5">` elements at hand-tuned `(cx, cy)` coordinates spread across the panel
- **~30 edges** as `<line>` elements connecting spatially adjacent pairs
- Node fill: `fill="rgba(196,35,45,0.35)"` dark / `fill="rgba(220,38,38,0.15)"` light (via CSS class)
- Edge stroke: `stroke="rgba(196,35,45,0.15)"` dark / `stroke="rgba(220,38,38,0.08)"` light  
- 4 "active" nodes use CSS animation `@keyframes pulse-node` (opacity 0.35 → 0.8 → 0.35, 3s infinite, staggered delays)
- 1 "glow" node at focal point: `filter: drop-shadow(0 0 3px rgba(196,35,45,0.8))`

**Logo mark:** Remove the `div.bg-crimson/20 border border-crimson/30` wrapper. Replace with a clean SVG monogram — two stacked horizontal crimson bars (simple abstract "TJ" ligature, geometric precision). No background, no border.

**Bottom footer:** Replace `SECURE ACCESS PORTAL` text with three small decorative badge pills:
```
[⬡ ENCRYPTED] · [⬡ ZERO TRUST] · [⬡ SOC2]
```
Styled as: `text-[10px] uppercase tracking-widest text-text-muted font-semibold px-2 py-1 rounded border border-border-subtle/50`

**Existing glow blobs:** Keep but reduce opacity slightly to let the SVG network breathe.

---

### 2. Form Cards — All 4 Pages

**Consistent card shell:**
```tsx
<div className="surface-card relative overflow-hidden p-8 sm:p-10 rounded-2xl 
  shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 backdrop-blur-xl">
  {/* Top accent line */}
  <div className="absolute top-0 inset-x-0 h-[1px] 
    bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
  ...
</div>
```

**Form labels** (consistent across all pages):
```tsx
<FormLabel className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
```

**Input focus** (consistent):
```tsx
className="... focus-visible:ring-crimson/50 focus-visible:border-crimson"
```

**Submit button shimmer** (standardize across all pages):
```tsx
<div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] 
  bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
```
Button needs `relative overflow-hidden group` classes.

---

### 3. Icons — No Colored Backgrounds

**Rule:** Remove all `div.bg-*/10 border border-*/30 rounded-2xl flex items-center justify-center` icon wrappers. Use the bare Lucide icon directly.

| Page | State | Icon | Style |
|---|---|---|---|
| forgot-password | Form | `<Mail className="h-7 w-7 text-crimson" />` | Bare icon, centered, mb-6 |
| forgot-password | Success | `<CheckCircle2 className="h-7 w-7 text-success" />` | Bare icon |
| reset-password | Step 1 | `<ShieldCheck className="h-7 w-7 text-crimson" />` | Bare icon |
| reset-password | Step 2 | `<LockKeyhole className="h-7 w-7 text-success" />` | Bare icon |
| reset-password | Complete | `<CheckCircle2 className="h-7 w-7 text-success" />` | Bare icon |
| login (mobile) | Brand | SVG monogram (same as left panel) | No bg wrapper |

---

### 4. Removals

| Item | Location | Action |
|---|---|---|
| `Demo: Enter 1234 to verify` | `reset-password/page.tsx` ~line 351 | Delete |
| `const DEMO_OTP_CODE = "1234"` | `reset-password/page.tsx` line 35 | Delete (check usage) |
| Colored bg icon wrappers | All 3 utility pages | Remove wrapper divs |
| Left panel image reference | `login/page.tsx` | Already removed; keep CSS-only |

---

### 5. Light Mode Behaviour

All changes adapt via existing CSS variable system:
- SVG node/edge colors use inline opacity values — light uses lower opacity (0.08–0.15), dark uses higher (0.15–0.35)
- Card `shadow-[0_0_60px_var(--crimson-glow)]` — `--crimson-glow` is already defined per theme
- No additional light mode overrides needed

---

## Files to Modify

| File | Changes |
|---|---|
| `src/app/(auth)/login/page.tsx` | Add SVG signal network, new logo mark, badge footer, consistent form styling |
| `src/app/(auth)/forgot-password/page.tsx` | Remove icon wrapper, add top accent line + bottom glow, consistent labels/inputs |
| `src/app/(auth)/reset-password/page.tsx` | Remove demo label + const, remove icon wrappers, add card improvements |
| `src/app/(auth)/setup-account/page.tsx` | Remove icon wrapper (if any), add card improvements, consistent labels |

---

## Out of Scope

- No changes to auth logic, API calls, or form validation
- No new dependencies
- No layout changes to the 55/45 split
- No changes to TMA auto-login flow
