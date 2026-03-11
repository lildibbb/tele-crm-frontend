# Enterprise Charts + Sidebar Active State — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate all recharts charts to enterprise/CRM-grade quality and replace the flat sidebar active state with a glowing crimson capsule indicator.

**Architecture:** Pure UI layer changes — no API, data, or business logic touched. All recharts enhancements use existing props (`tickFormatter`, `LabelList`, `animationDuration`, `activeDot` glow). Sidebar restructure adds a positioned `<span>` capsule to `SidebarMenuItem` and replaces the flat active background with a left-to-right gradient.

**Tech Stack:** React, Recharts, Tailwind CSS v4, Next.js App Router, shadcn/ui sidebar primitives

---

## Task 1: TrendCharts.tsx — Y-axis formatter + LabelList + ReferenceLine label + activeDot glow + animation

**Files:**
- Modify: `src/components/dashboard/TrendCharts.tsx`

**Step 1: Import `LabelList` from recharts**

Add to imports at top:
```tsx
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine, LabelList, ResponsiveContainer,
} from "recharts";
```

**Step 2: Add Y-axis tick formatter util (inside the file, above component)**

```tsx
const fmtTick = (v: number): string =>
  v >= 1_000_000
    ? (v / 1_000_000).toFixed(1).replace(".0", "") + "M"
    : v >= 1_000
      ? (v / 1_000).toFixed(1).replace(".0", "") + "K"
      : String(v);
```

**Step 3: Apply formatter to both YAxis instances**

On the Area chart YAxis (currently has `width={30} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" ... }}`):
```tsx
<YAxis
  width={32}
  tickFormatter={fmtTick}
  tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)", fontFamily: "var(--font-jetbrains-mono,monospace)" }}
  axisLine={false}
  tickLine={false}
/>
```

On the Bar chart YAxis (same treatment):
```tsx
<YAxis
  width={28}
  tickFormatter={fmtTick}
  tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)", fontFamily: "var(--font-jetbrains-mono,monospace)" }}
  axisLine={false}
  tickLine={false}
/>
```

**Step 4: Add ReferenceLine label**

Replace existing `<ReferenceLine>`:
```tsx
{avgDeposits > 0 && (
  <ReferenceLine
    y={avgDeposits}
    stroke="rgba(232,185,79,0.45)"
    strokeDasharray="5 4"
    strokeWidth={1.5}
    label={{
      value: `Avg ${fmtTick(avgDeposits)}`,
      position: "insideTopRight",
      fontSize: 9,
      fill: "rgba(232,185,79,0.65)",
      fontFamily: "var(--font-jetbrains-mono,monospace)",
    }}
  />
)}
```

**Step 5: Add `<LabelList>` inside `<Bar>`**

```tsx
<Bar dataKey="Deposits" fill="url(#gradBar)" radius={[8, 8, 0, 0]}>
  <LabelList
    dataKey="Deposits"
    position="top"
    style={{
      fontSize: 9,
      fill: "rgba(255,255,255,0.55)",
      fontFamily: "var(--font-jetbrains-mono,monospace)",
    }}
    formatter={(v: number) => (v > 0 ? fmtTick(v) : "")}
  />
</Bar>
```

**Step 6: Add activeDot glow to both Area series**

On "Leads" Area:
```tsx
activeDot={{
  r: 5,
  strokeWidth: 2,
  stroke: "#0c0e12",
  fill: "var(--color-crimson)",
  style: { filter: "drop-shadow(0 0 5px var(--color-crimson))" },
}}
```

On "Confirmed" Area:
```tsx
activeDot={{
  r: 5,
  strokeWidth: 2,
  stroke: "#0c0e12",
  fill: "#22D3A0",
  style: { filter: "drop-shadow(0 0 5px #22D3A0)" },
}}
```

**Step 7: Add animation props to Area components**

```tsx
<Area
  animationDuration={900}
  animationEasing="ease-out"
  type="monotone"
  dataKey="Leads"
  ...
/>
<Area
  animationDuration={1050}
  animationEasing="ease-out"
  type="monotone"
  dataKey="Confirmed"
  ...
/>
```

And to Bar:
```tsx
<Bar
  animationDuration={700}
  animationEasing="ease-out"
  dataKey="Deposits"
  ...
/>
```

**Step 8: Verify no TypeScript errors**

Run: `npx tsc --noEmit 2>&1 | Select-String -Pattern "TrendCharts"`
Expected: no output (no errors in this file)

**Step 9: Run tests**

Run: `pnpm test`
Expected: 139 tests pass

---

## Task 2: FunnelOverview.tsx — Donut center glow ring

**Files:**
- Modify: `src/components/dashboard/FunnelOverview.tsx`

**Step 1: Replace the center label div**

Find the existing center label block:
```tsx
{/* Center label */}
<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
  <span className="text-2xl font-bold data-mono text-white leading-none">
    {totalLeads.toLocaleString()}
  </span>
  <span className="text-[11px] mt-0.5 text-white/50">
    {labels.totalLeads}
  </span>
</div>
```

Replace with:
```tsx
{/* Center label with glow ring */}
<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
  {/* Subtle inner ring */}
  <div
    className="absolute rounded-full border border-white/[0.06]"
    style={{
      width: 118,
      height: 118,
      boxShadow:
        "0 0 20px rgba(34,211,160,0.10), inset 0 0 16px rgba(34,211,160,0.06)",
    }}
  />
  <span className="text-2xl font-bold data-mono text-white leading-none relative z-10">
    {totalLeads.toLocaleString()}
  </span>
  <span className="text-[11px] mt-0.5 text-white/50 relative z-10">
    {labels.totalLeads}
  </span>
</div>
```

**Step 2: Run tests**

Run: `pnpm test`
Expected: 139 pass

---

## Task 3: analytics/page.tsx — Y-axis formatters + activeDot glow + animation

**Files:**
- Modify: `src/app/(dashboard)/analytics/page.tsx`

**Step 1: Add fmtTick util near top of file (after imports)**

Add after the last import but before type/const definitions:
```tsx
const fmtTick = (v: number): string =>
  v >= 1_000_000
    ? (v / 1_000_000).toFixed(1).replace(".0", "") + "M"
    : v >= 1_000
      ? (v / 1_000).toFixed(1).replace(".0", "") + "K"
      : String(v);
```

**Step 2: Update YAxis on the AreaChart (deposit trend)**

Find the YAxis in the analytics AreaChart:
```tsx
<YAxis
  width={30}
  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)", fontFamily: "var(--font-jetbrains-mono,monospace)" }}
  axisLine={false}
  tickLine={false}
/>
```

Replace with:
```tsx
<YAxis
  width={32}
  tickFormatter={fmtTick}
  tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)", fontFamily: "var(--font-jetbrains-mono,monospace)" }}
  axisLine={false}
  tickLine={false}
/>
```

**Step 3: Update activeDot glow on AreaChart Area components**

On "New Leads" Area — add `style` to activeDot:
```tsx
activeDot={{
  r: 5,
  strokeWidth: 2,
  stroke: "#0c0e12",
  fill: "var(--color-crimson)",
  style: { filter: "drop-shadow(0 0 5px var(--color-crimson))" },
}}
```

On "Confirmed" Area:
```tsx
activeDot={{
  r: 5,
  strokeWidth: 2,
  stroke: "#0c0e12",
  fill: "var(--color-success)",
  style: { filter: "drop-shadow(0 0 5px var(--color-success))" },
}}
```

**Step 4: Add animation to Area components**

```tsx
<Area animationDuration={900} animationEasing="ease-out" type="monotone" dataKey="New Leads" ... />
<Area animationDuration={1050} animationEasing="ease-out" type="monotone" dataKey="Confirmed" ... />
```

**Step 5: Run tests + type check**

```
pnpm test
npx tsc --noEmit 2>&1 | Select-String -Pattern "analytics"
```
Expected: 139 tests pass, no new TS errors

---

## Task 4: MobileAnalytics.tsx — Dark viewport + crimson gradient + heights + axis styling

**Files:**
- Modify: `src/components/mobile/MobileAnalytics.tsx`

**Step 1: Update the Lead Trend chart section**

Find the gradient defs for the area chart. Currently:
```tsx
<linearGradient id="mobileGradNew" ...>
  <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.35} />
  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.02} />
</linearGradient>
```

Replace `#60A5FA` with `var(--color-crimson)`:
```tsx
<linearGradient id="mobileGradNew" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="var(--color-crimson)" stopOpacity={0.65} />
  <stop offset="50%" stopColor="var(--color-crimson)" stopOpacity={0.22} />
  <stop offset="100%" stopColor="var(--color-crimson)" stopOpacity={0} />
</linearGradient>
```

Also update the Area stroke color if it references `#60A5FA`:
```tsx
<Area
  type="monotone"
  dataKey="New Leads"
  stroke="var(--color-crimson)"
  strokeWidth={2}
  fill="url(#mobileGradNew)"
  ...
/>
```

**Step 2: Wrap the Lead Trend ResponsiveContainer in dark viewport**

Find the `<ResponsiveContainer width="100%" height={180}>` for the area chart.

Before it, add the dark wrapper div and increase height to 220:
```tsx
<div className="rounded-xl overflow-hidden bg-[#0c0e12] px-1 pt-3 pb-1">
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart
      data={trendData}
      margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
    >
      ...
      <XAxis
        dataKey="date"
        tick={{ fontSize: 10, fill: "rgba(255,255,255,0.40)", fontFamily: "inherit" }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        width={28}
        tickFormatter={(v: number) => v >= 1000 ? (v/1000).toFixed(1).replace('.0','')+'K' : String(v)}
        tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)", fontFamily: "var(--font-jetbrains-mono,monospace)" }}
        axisLine={false}
        tickLine={false}
      />
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="rgba(255,255,255,0.06)"
        vertical={false}
      />
      ...
    </AreaChart>
  </ResponsiveContainer>
</div>
```

Close the dark viewport wrapper `</div>` after `</ResponsiveContainer>`.

**Step 3: Wrap the Conversion Funnel BarChart in dark viewport**

Find the `<ResponsiveContainer width="100%" height={180}>` for the bar chart (funnel).

Apply the same treatment:
```tsx
<div className="rounded-xl overflow-hidden bg-[#0c0e12] px-1 pt-3 pb-1">
  <ResponsiveContainer width="100%" height={220}>
    <BarChart ...>
      ...
      <XAxis
        tick={{ fontSize: 10, fill: "rgba(255,255,255,0.40)", fontFamily: "inherit" }}
        ...
      />
      <YAxis
        width={28}
        tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)", ... }}
        ...
      />
      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} ... />
      ...
    </BarChart>
  </ResponsiveContainer>
</div>
```

Also update `cursor` on Tooltip: `cursor={{ fill: "rgba(255,255,255,0.05)", rx: 6 }}`.

**Step 4: Update skeleton height to match**

Find any `h-[180px]` skeleton placeholders and update to `h-[220px]`:
```tsx
{isLoading ? (
  <div className="h-[220px] rounded-xl bg-[#0c0e12] animate-pulse" />
) : (
  ...
```
Or search for `h-[180px]` in MobileAnalytics and replace with `h-[220px]`.

**Step 5: Run tests**

```
pnpm test
```
Expected: 139 tests pass

---

## Task 5: app-sidebar.tsx — Bleeding Glow Capsule active indicator

**Files:**
- Modify: `src/components/app-sidebar.tsx`

**Step 1: Update the regular nav items `SidebarMenuItem`**

Find the block (around line 205-242):
```tsx
return (
  <SidebarMenuItem key={href}>
    <SidebarMenuButton
      asChild
      isActive={isActive}
      tooltip={label}
      className={`nav-item group h-auto py-2.5 px-3 transition-all duration-300 overflow-hidden ${isActive ? "!bg-crimson/10 !text-crimson active" : "text-text-secondary hover:!bg-elevated hover:!text-text-primary"}`}
      ...
```

Replace with:
```tsx
return (
  <SidebarMenuItem key={href} className="relative">
    {isActive && (
      <span
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 z-10 w-[3px] rounded-r-full bg-[var(--color-crimson)]"
        style={{
          height: "62%",
          boxShadow:
            "0 0 8px var(--color-crimson), 0 0 20px rgba(196,35,45,0.40)",
        }}
        aria-hidden="true"
      />
    )}
    <SidebarMenuButton
      asChild
      isActive={isActive}
      tooltip={label}
      className={`nav-item group h-auto py-2.5 px-3 transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-[var(--color-crimson)]/[0.12] via-[var(--color-crimson)]/[0.04] to-transparent !text-crimson"
          : "text-text-secondary hover:!bg-elevated hover:!text-text-primary"
      }`}
      onClick={() => setOpenMobile(false)}
    >
      <Link href={href} className="flex items-center">
        <Icon
          size={18}
          weight={isActive ? "fill" : "light"}
          className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{
            filter: isActive
              ? "drop-shadow(0 0 5px var(--color-crimson))"
              : undefined,
          }}
        />
        <span className="font-medium ml-2">{label}</span>
        ...
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);
```

Key changes from original:
- `SidebarMenuItem` gets `className="relative"` 
- Capsule `<span>` added when `isActive === true`
- Active class: `overflow-hidden` REMOVED, flat `!bg-crimson/10` REPLACED with gradient
- `Icon` gets `style={{ filter: isActive ? 'drop-shadow(0 0 5px var(--color-crimson))' : undefined }}`

**Step 2: Update the Superadmin `SidebarMenuButton` (same pattern)**

Find lines ~253-287 (isAdminPath block). Apply same changes:
```tsx
<SidebarMenuItem className="relative">
  {isAdminPath && (
    <span
      className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 z-10 w-[3px] rounded-r-full bg-[var(--color-crimson)]"
      style={{
        height: "62%",
        boxShadow: "0 0 8px var(--color-crimson), 0 0 20px rgba(196,35,45,0.40)",
      }}
      aria-hidden="true"
    />
  )}
  <SidebarMenuButton
    isActive={isAdminPath}
    tooltip="Superadmin"
    className={`nav-item group h-auto py-2.5 px-3 transition-all duration-200 cursor-pointer select-none ${
      isAdminPath
        ? "bg-gradient-to-r from-[var(--color-crimson)]/[0.12] via-[var(--color-crimson)]/[0.04] to-transparent !text-crimson"
        : "text-text-secondary hover:!bg-elevated hover:!text-text-primary"
    }`}
    ...
  >
    <Crown
      size={18}
      weight={isAdminPath ? "fill" : "light"}
      ...
      style={{
        filter: isAdminPath
          ? "drop-shadow(0 0 5px var(--color-crimson))"
          : undefined,
      }}
    />
```

**Step 3: Update Sub-items active style**

Find lines ~304-308. The sub-item active class currently uses `!bg-crimson/8`:
```tsx
className={`h-8 transition-colors duration-150 ${
  isSubActive
    ? "!text-crimson !bg-crimson/8 font-medium"
    : ...
}`}
```

Replace with:
```tsx
className={`relative h-8 transition-colors duration-150 ${
  isSubActive
    ? "bg-gradient-to-r from-[var(--color-crimson)]/[0.10] to-transparent !text-crimson font-medium"
    : "text-text-secondary hover:!text-text-primary hover:!bg-elevated/60"
}`}
```

Sub-items don't need the capsule (too small) — the gradient is sufficient.

**Step 4: Verify sidebar tooltip still works (no regression)**

The `tooltip={label}` prop is handled by shadcn sidebar — verify it still renders by inspecting `SidebarMenuButton` in `src/components/ui/sidebar.tsx`. The tooltip relies on `data-tooltip` not on overflow, so removing `overflow-hidden` is safe.

**Step 5: Run tests + lint**

```
pnpm test
pnpm lint 2>&1 | Select-String "error" | Where-Object { $_ -match "error" -and $_ -notmatch "warning" }
```
Expected: 139 tests pass, 0 errors

---

## Task 6: Final validation

**Step 1: Full test run**

```
pnpm test
```
Expected: 139/139 pass

**Step 2: TypeScript check**

```
npx tsc --noEmit
```
Expected: Pre-existing errors in auth pages only (forgot-password, reset-password — known pre-existing issue, not related to our changes)

**Step 3: Lint check**

```
pnpm lint
```
Expected: 0 errors, ~135 warnings (all pre-existing react-compiler warnings)

**Step 4: Commit**

```
git add src/components/dashboard/TrendCharts.tsx
git add src/components/dashboard/FunnelOverview.tsx
git add src/app/(dashboard)/analytics/page.tsx
git add src/components/mobile/MobileAnalytics.tsx
git add src/components/app-sidebar.tsx
git add docs/plans/2026-03-10-charts-sidebar-revamp-design.md
git commit -m "feat: enterprise charts polish + sidebar glow capsule active state"
```

---

## Summary of All Changes

| What | Why |
|------|-----|
| `fmtTick` formatter on Y-axes | `1200` → `1.2K` — professional data readability |
| `ReferenceLine` label "Avg X" | Communicates the reference line meaning without guessing |
| `LabelList` on deposit bars | Each bar shows its own value — no need to read Y-axis |
| `activeDot` glow filter | Hover feels alive — glowing dot on dark bg is premium |
| Animation easing tuning | `ease-out` curve feels intentional, not mechanical |
| Donut center glow ring | Depth + brand color accent in the dead center of the donut |
| Mobile dark viewport | Consistent visual language with desktop on mobile |
| Mobile crimson gradient | Brand color (crimson) instead of blue for "New Leads" |
| Mobile chart heights +40px | More data visible, less cramped on mobile |
| Sidebar capsule indicator | Glowing crimson pill that "overflows" the item boundary |
| Sidebar gradient bg (active) | Directional light from left replaces flat box tint |
| Sidebar icon glow | `drop-shadow` filter makes the icon feel selected/lit |
