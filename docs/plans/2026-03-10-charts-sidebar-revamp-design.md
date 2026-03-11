# Design: Enterprise Charts + Sidebar Active State Revamp
**Date:** 2026-03-10  
**Scope:** Analytics charts (desktop + mobile), Command Center charts, sidebar active indicator

---

## 1. Problem Statement

### Charts
The "Dark Intelligence" viewport treatment was applied last session — charts now have dark cinema backgrounds with strong gradients. But enterprise-grade CRM charts still need:
- Y-axis values showing `1.2K` not `1200` — raw numbers feel unpolished
- Bar charts missing value labels — user must read the Y-axis to know a bar's value
- No distinction between data magnitude (every number looks the same scale)
- The `ReferenceLine` for avg deposits is invisible — no label
- Active hover dots lack the "glow" expected in premium dashboards
- Mobile charts still use flat backgrounds and blue (`#60A5FA`) for leads instead of brand crimson
- Recharts default animation is jarring — needs easing tuning
- `FunnelOverview` donut center has no inner glow ring

### Sidebar
Current active state: `!bg-crimson/10 !text-crimson` — a flat red-tinted box.  
Problems:
- Looks like a plain `background-color` change — no depth, no drama
- No left accent indicator (the "selected tab" visual cue)
- "Boring box red" — identical shape to hover state, just different color
- Collapsed (icon-only) sidebar has no active indicator at all
- No visual hierarchy difference between active and hover

---

## 2. Chart Enhancements — Design

### 2a. Y-Axis Tick Formatter
All numeric Y-axes get a `tickFormatter`:
```
1200 → 1.2K   |   12000 → 12K   |   1200000 → 1.2M
```
Formatter: `(v) => v >= 1_000_000 ? (v/1_000_000).toFixed(1).replace('.0','')+'M' : v >= 1_000 ? (v/1_000).toFixed(1).replace('.0','')+'K' : String(v)`

Applied to: TrendCharts (area + bar), analytics AreaChart, analytics distribution BarChart.

### 2b. ReferenceLine Label on Deposits Chart
The existing dashed gold `ReferenceLine` at `avgDeposits` needs a floating label:
```tsx
<ReferenceLine y={avgDeposits}
  label={{ value: `Avg ${avgDeposits}`, position: 'insideTopRight',
           fontSize: 9, fill: 'rgba(232,185,79,0.65)',
           fontFamily: 'var(--font-jetbrains-mono,monospace)' }}
/>
```

### 2c. Bar Value Labels (LabelList)
Recharts `<LabelList>` above each deposit bar — shows the count in the viewport:
```tsx
<Bar dataKey="Deposits" fill="url(#gradBar)" radius={[8,8,0,0]}>
  <LabelList dataKey="Deposits"
    position="top"
    style={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)',
             fontFamily: 'var(--font-jetbrains-mono,monospace)' }}
    formatter={(v) => v > 0 ? v : ''}
  />
</Bar>
```

### 2d. Active Dot Glow
Add CSS `filter: drop-shadow` to `activeDot` on all Area charts:
```tsx
activeDot={{ r: 5, strokeWidth: 2, stroke: '#0c0e12', fill: 'var(--color-crimson)',
  style: { filter: 'drop-shadow(0 0 5px var(--color-crimson))' } }}
```
Gold for confirmed, crimson for leads. Makes hover feel alive.

### 2e. Animation Tuning
```tsx
<Area animationDuration={900} animationEasing="ease-out" ... />
<Bar animationDuration={700} animationEasing="ease-out" ... />
```

### 2f. Mobile Dark Viewport + Crimson Fix
- Apply `<div className="rounded-xl overflow-hidden bg-[#0c0e12] px-1 pt-3 pb-1">` wrapper around both MobileAnalytics charts
- Fix "New Leads" gradient color from `#60A5FA` (blue) → `var(--color-crimson)`
- Increase heights: 180 → 220px
- XAxis tick fill: `rgba(255,255,255,0.40)` on dark bg
- CartesianGrid stroke: `rgba(255,255,255,0.06)`

### 2g. Funnel Donut Inner Glow Ring
Add a subtle CSS ring around the donut center number:
```tsx
<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
  {/* Glow ring */}
  <div className="absolute w-[112px] h-[112px] rounded-full border border-white/5
      shadow-[0_0_20px_rgba(34,211,160,0.12),inset_0_0_20px_rgba(34,211,160,0.06)]" />
  <span className="text-2xl font-bold ...">...</span>
```

---

## 3. Sidebar Active State — Design

### The "Bleeding Glow Capsule" 

Replace the boring flat box with a three-layer active indicator:

**Layer 1: Gradient Background** (inside the button, left-to-right fade)
```
bg-gradient-to-r from-[--color-crimson]/14 via-[--color-crimson]/5 to-transparent
```

**Layer 2: Left Capsule Indicator** (positioned on the `SidebarMenuItem` parent, overflowing)
- A thin capsule positioned `absolute left-0` on the `SidebarMenuItem` 
- Height: `65%` of the item, centered vertically — shorter than the item = "capsule" not "full border"
- Width: `3px`
- Border-radius: `0 999px 999px 0` — half-oval right edge (organic, NOT a square)
- Background: `var(--color-crimson)`
- Glow: `box-shadow: 0 0 8px var(--color-crimson), 0 0 20px rgba(196,35,45,0.4)`
- This element sits on the `SidebarMenuItem` (which has `position: relative`) and LEFT of the button padding
- The capsule "overflows" the button but stays within the sidebar rail

**Layer 3: Icon Glow**
```tsx
<Icon style={{ filter: isActive ? 'drop-shadow(0 0 5px var(--color-crimson))' : undefined }} />
```

**Collapsed sidebar (icon mode)**:
When sidebar is `collapsed`, only the icon is visible. Active indicator:
- Small dot below/under the icon: `w-1 h-1 rounded-full bg-crimson` centered horizontally
- OR keep the capsule on the left (it works in icon mode too)

### Structure Change

`SidebarMenuItem` needs `relative overflow-visible`:
```tsx
<SidebarMenuItem key={href} className="relative">
  {isActive && (
    <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2
      w-[3px] h-[62%] rounded-r-full bg-[var(--color-crimson)]
      shadow-[0_0_8px_var(--color-crimson),0_0_18px_rgba(196,35,45,0.35)]
      z-10" />
  )}
  <SidebarMenuButton className={`nav-item ... 
    ${isActive 
      ? "bg-gradient-to-r from-[var(--color-crimson)]/12 via-[var(--color-crimson)]/4 to-transparent !text-crimson font-medium" 
      : "text-text-secondary hover:!bg-elevated hover:!text-text-primary"
    }`}
  >
```

Remove `!bg-crimson/10` and `overflow-hidden` from active class.

### Sub-items (superadmin group)
Same treatment, slightly smaller capsule:
- `w-[2px] h-[55%]` capsule, same glow but at 70% opacity

---

## 4. Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/TrendCharts.tsx` | Y-axis formatter, LabelList on bar, ReferenceLine label, activeDot glow, animation tuning |
| `src/components/dashboard/FunnelOverview.tsx` | Inner glow ring on donut center |
| `src/app/(dashboard)/analytics/page.tsx` | Y-axis formatters on all 3 charts, activeDot glow, animation |
| `src/components/mobile/MobileAnalytics.tsx` | Dark viewport, crimson gradient fix, height 220px, axis styling |
| `src/components/app-sidebar.tsx` | Bleeding glow capsule active state, icon glow, remove flat box |

No API changes. No data shape changes. No new dependencies.

---

## 5. Success Criteria

- Charts feel enterprise/Bloomberg Terminal quality — data is readable, proportional, and visually engaging
- Sidebar active state is unmistakable — the glowing crimson capsule makes the selected page immediately clear
- Mobile charts match desktop visual language
- Zero breaking changes to data flow or API calls
- 139/139 tests still pass, 0 lint errors
