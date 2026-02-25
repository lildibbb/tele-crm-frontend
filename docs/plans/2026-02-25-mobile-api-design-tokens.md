# Mobile Components: Design Token Migration + API Integration

**Date:** 2026-02-25  
**Status:** In Progress

---

## Problem

All 13 mobile components in `src/components/mobile/` have two critical issues:

1. **Hardcoded hex colors** — every color is a raw hex value (`#080810`, `#141422`, etc.) instead of CSS variables from the design system. This means: no light/dark mode switching, diverges from desktop, maintenance nightmare.

2. **Static mock data** — all screens display hardcoded `MOCK_*` arrays. No real API calls. The Zustand stores (`leadsStore`, `analyticsStore`, `verificationStore`, `authStore`) exist but are unused in mobile.

---

## Design Token Mapping

| Raw Hex | Tailwind Token | Role |
|---|---|---|
| `#080810` | `bg-void` / `bg-background` | Page bg |
| `#0E0E1A` | `bg-base` | Shell header bg |
| `#141422` | `bg-card` | Card surface |
| `#1C1C2E` | `bg-elevated` | Elevated bg, inputs |
| `#24243A` | `bg-overlay` | Hover, tooltip |
| `#2A2A42` | `border-border-subtle` | Dividers, card borders |
| `#38385A` | `border-border-default` | Input borders |
| `#F0F0FF` | `text-text-primary` | Headings, values |
| `#8888AA` | `text-text-secondary` | Labels, captions |
| `#555570` | `text-text-muted` | Placeholder, disabled |
| `#C4232D` | `text-crimson` / `bg-crimson` | Brand CTA |
| `#C4232D1A` | `bg-crimson-subtle` | Crimson tint bg |
| `#E8B94F` | `text-gold` / `bg-gold` | Premium/VIP |
| `#E8B94F1A` | `bg-gold-subtle` | Gold tint |
| `#22D3A0` | `text-success` | Verified, confirmed |
| `#F59E0B` | `text-warning` | Pending |
| `#EF4444` | `text-danger` | Rejected |
| `#60A5FA` | `text-info` | Registered |

---

## API Integration Plan

| Component | Store | Methods | Data Used |
|---|---|---|---|
| `MobileShell` | `authStore` | `user` | name, initials, role, notificationCount |
| `OwnerHome` | `analyticsStore` + `leadsStore` | `fetchSummary`, `fetchLeads` | summary stats, recent 3 leads, pending verif count |
| `StaffHome` | `leadsStore` + `authStore` | `fetchLeads`, `user` | assigned leads, verification count |
| `SuperadminHome` | `analyticsStore` | `fetchSummary` | platform stats |
| `MobileLeadsList` | `leadsStore` | `fetchLeads` | server-side paginated leads list |
| `MobileLeadDetail` | `leadsStore` | `fetchLead(id)` | lead detail, timeline, deposit info |
| `MobileVerification` | `leadsStore` | `fetchLeads({status:'DEPOSIT_REPORTED'})`, `verifyLead`, `updateStatus` | verification queue |
| `MobileAnalytics` | `analyticsStore` | `fetchSummary`, `fetchWeekly` | KPIs, chart data |
| `MobileProfile` | `authStore` | `user`, `logout` | user profile data |

---

## Implementation Order

1. `MobileShell` — auth + tokens (other screens depend on it)
2. `OwnerHome` — analytics + leads  
3. `StaffHome` — leads + auth
4. `SuperadminHome` — analytics
5. `MobileLeadsList` — server-side leads
6. `MobileLeadDetail` — lead fetch + actions
7. `MobileVerification` — verification queue
8. `MobileAnalytics` — real charts
9. `MobileProfile` — auth user data
10. Minor: `MobileNotifications`, `MobileSettings`, `MobileMoreDrawer` — design tokens only

---

## Key Patterns

### Loading skeleton
```tsx
if (isLoading) return <div className="flex flex-col gap-3 px-4 pt-4">
  {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-elevated animate-pulse" />)}
</div>;
```

### Error state  
```tsx
if (error) return <div className="px-4 pt-4 text-sm text-danger">{error}</div>;
```

### useEffect pattern
```tsx
useEffect(() => { store.fetchXxx(); }, []);
```
