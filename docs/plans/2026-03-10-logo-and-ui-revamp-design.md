# Logo Integration & UI/UX Revamp — Design Document

**Date:** 2026-03-10  
**Scope:** Full logo integration across all pages + premium TMA submit page redesign  
**Approach:** B — Logo Integration + Premium Submit Page Revamp

---

## 1. Problem Statement

The Titan Journal CRM currently uses entirely text-based and SVG-based branding ("TITAN JOURNAL CRM" text + custom `TitanMark` SVG). Six official PNG logo files exist in `public/assets/logo/` but are **never used** anywhere in the application. The TMA submit page — the primary customer-facing touchpoint for deposit proof submission — lacks visual trust signals and a polished, professional feel that reflects the brand.

---

## 2. Goals

1. Replace all placeholder/SVG/text branding with the real official logo (Logo-02 primary, Logo-03 for sidebar collapsed state — red variants only)
2. Keep the "TITAN JOURNAL CRM" text name in sidebar (logo sits alongside the text)
3. Redesign the TMA submit page as a premium, trust-inspiring fintech-grade form
4. Improve logo presence on all auth pages and TMA status page
5. Full visual revamp — modernize the submit/status pages while preserving the existing dashboard design system

---

## 3. Logo Assets

| File | Usage |
|---|---|
| `Titan Trade Circle Official Logo-02.png` | Primary logo — auth pages, TMA pages, login panel |
| `Titan Trade Circle Official Logo-03.png` | Icon/compact — sidebar collapsed state |

All other logo variants (01, 04, 05, 06) are not used in this revamp.

---

## 4. Shared Component

### `src/components/ui/titan-logo.tsx`

```
Props:
  variant: "full" | "icon"    (default: "full")
  size: "sm" | "md" | "lg" | "xl"   (24 | 32 | 48 | 64px height)
  className?: string
```

- `variant="full"` → renders Logo-02 PNG via Next.js `<Image>` with `priority` prop
- `variant="icon"` → renders Logo-03 PNG via Next.js `<Image>`
- Accessible: `alt="Titan Journal"` on full, `alt=""` aria-hidden on decorative uses
- Sizes map to `h-6 / h-8 / h-12 / h-16` Tailwind classes with `w-auto`

---

## 5. Logo Placement Map

| Location | Current | Replacement |
|---|---|---|
| `app-sidebar.tsx` expanded | `TITAN JOURNAL CRM` text spans | `<TitanLogo variant="full" size="sm">` + existing text |
| `app-sidebar.tsx` collapsed | `T.` text | `<TitanLogo variant="icon" size="md">` |
| `login/page.tsx` desktop left | `<TitanMark>` SVG + text | `<TitanLogo variant="full" size="lg">` + text |
| `login/page.tsx` mobile | `<TitanMark>` SVG + text | `<TitanLogo variant="full" size="md">` + text |
| `setup-account/page.tsx` | Text-only | `<TitanLogo variant="full" size="md">` added |
| `forgot-password/page.tsx` | No logo | `<TitanLogo variant="full" size="md">` added |
| `reset-password/page.tsx` | No logo | `<TitanLogo variant="full" size="md">` added |
| `(tma)/submit/page.tsx` | Shield icon + text | `<TitanLogo variant="full" size="lg">` |
| `(tma)/status/page.tsx` | No logo in header | `<TitanLogo variant="full" size="lg">` added |

---

## 6. TMA Submit Page — Premium Redesign

### Context
Customer-facing mobile page (opened from Telegram bot link). Purpose: submit registration proof and deposit screenshot to prove they registered under Titan Journal's referral link. Trust is paramount.

### New Layout (top → bottom)

1. **Header**
   - Logo-02 centered (48px tall)
   - "Titan Journal CRM" subtitle in muted text
   - Thin crimson divider line

2. **Trust Bar**
   - `🔒 256-bit SSL Secured · Titan Journal Official`
   - Small pill badge with lock icon, subtle background

3. **Page Title Block**
   - `h1`: "Deposit Proof Submission"
   - Subtitle: "Complete your account registration and submit your deposit screenshot in one step."

4. **Form Card** (white card with soft shadow)
   - Section header: "① Upload Receipt" with camera icon
   - File upload zone: large touch target (min 140px), dashed border, thumbnail previews, remove button per file, max 3 files
   - Section header: "② Your Details"
   - HFM Account ID field (required, with helper: "Found in your HFM dashboard")
   - Deposit Amount field (required, USD prefix)
   - Email field (optional badge)
   - Phone field (optional badge)
   - Error alert (inline, red, above submit) if API fails
   - Submit button: full-width crimson, "Submit Proof" label, spinner on loading

### State Screens (full-page centered, all include Logo-02)

**Success:**
- Logo-02 (48px) centered
- Animated green checkmark circle
- `h2`: "Submission Received!"
- Subtitle: "Your proof has been received. We'll verify and notify you via Telegram shortly."
- Muted note: "You can close this page."

**Already Submitted:**
- Logo-02 + blue info icon
- `h2`: "Already Received"
- Subtitle: same as current

**Invalid Token:**
- Logo-02 + red X icon
- `h2`: "Invalid Link"
- Subtitle: current message

### Design Tokens (TMA-specific)
- Brand crimson: `#C4232D`
- Trust bar bg: `#FFF5F5`
- Card bg: `#FFFFFF` with `box-shadow: 0 2px 20px rgba(0,0,0,0.08)`
- Input focus: crimson border ring
- All typography: existing `font-sans` / `font-display` classes

---

## 7. Auth Pages

### Login (`login/page.tsx`)
- Desktop left panel: replace `<TitanMark className="w-9 h-9 text-crimson ...">` with `<Image src="/assets/logo/..." height={56} width="auto">`. Keep the `TITAN JOURNAL` text + SignalNetwork animation + glow effects as-is.
- Mobile: replace `<TitanMark className="w-10 h-10 ...">` with `<Image height={44}>`. Keep `TITAN JOURNAL` text + subtitle.

### Setup Account (`setup-account/page.tsx`)
- Add `<TitanLogo variant="full" size="md">` to the header/form top area
- Keep existing layout

### Forgot Password + Reset Password
- Add `<TitanLogo variant="full" size="md">` to form headers
- Same pattern as setup-account

---

## 8. Sidebar (`app-sidebar.tsx`)

**Expanded state (keep text):**
```jsx
<div className="flex items-center gap-2">
  <Image src="/assets/logo/Titan Trade Circle Official Logo-02.png" height={28} alt="Titan Journal" />
  <div className="flex items-center text-[13px] gap-1 ...">
    <span>TITAN</span>
    <span>JOURNAL</span>
    <span className="text-crimson">CRM</span>
  </div>
</div>
```

**Collapsed state (logo only):**
```jsx
<Image src="/assets/logo/Titan Trade Circle Official Logo-03.png" height={32} alt="Titan Journal" />
```

---

## 9. Files to Create/Modify

| File | Action |
|---|---|
| `src/components/ui/titan-logo.tsx` | **CREATE** — new shared component |
| `src/components/app-sidebar.tsx` | **MODIFY** — logo in expanded + collapsed |
| `src/app/(auth)/login/page.tsx` | **MODIFY** — replace TitanMark SVG |
| `src/app/(auth)/setup-account/page.tsx` | **MODIFY** — add logo |
| `src/app/(auth)/forgot-password/page.tsx` | **MODIFY** — add logo |
| `src/app/(auth)/reset-password/page.tsx` | **MODIFY** — add logo |
| `src/app/(tma)/submit/page.tsx` | **MODIFY** — premium redesign |
| `src/app/(tma)/status/page.tsx` | **MODIFY** — add logo + polish |

---

## 10. Out of Scope

- Dashboard inner pages (analytics, leads, settings, etc.) — no logo appears there currently
- Color palette or design token changes to the dashboard design system
- New animation libraries or dependencies
- Logo files 01, 04, 05, 06
