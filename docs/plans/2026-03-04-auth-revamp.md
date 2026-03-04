# Auth Pages UI/UX Revamp — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Revamp all 4 auth pages (`/login`, `/forgot-password`, `/reset-password`, `/setup-account`) with a Signal Network animated left panel, consistent glass cards, monochrome icons (no colored-bg wrappers), and remove the demo label.

**Architecture:** Pure CSS/SVG additions — no new dependencies. Signal network is an inline `<svg>` with `<circle>` nodes and `<line>` edges, styled with CSS animations. All card, label, input, and button changes use existing Tailwind utility classes from the DESIGN.md token system.

**Tech Stack:** Next.js 15, React, Tailwind CSS v4, Lucide React icons, Framer Motion (already installed on forgot/reset pages)

---

## Context: Design Token Quick Reference

These CSS vars are available globally (see `src/app/globals.css`):
- `--crimson` — brand red (#c4232d dark / #DC2626 light)
- `--crimson-glow` — rgba glow for shadows
- `--crimson-subtle` — 10% opacity crimson bg
- `--void` — page background
- `--base` — sidebar/panel background
- `--card` — card surface
- `--border-subtle` — faint border
- `--text-primary`, `--text-secondary`, `--text-muted`

Tailwind class mapping: `bg-void`, `bg-base`, `bg-card`, `text-crimson`, `border-border-subtle`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `bg-crimson/20`, `text-success`, `text-danger`.

**`surface-card` utility** (defined in globals.css) = `bg-card rounded-xl border border-border-subtle shadow-[var(--shadow-card)]`

---

## Task 1: Remove Demo Label from Reset-Password Page

**Files:**
- Modify: `src/app/(auth)/reset-password/page.tsx`

### Step 1: Delete `DEMO_OTP_CODE` constant and the demo hint paragraph

Find and remove:
```tsx
// Demo OTP code for testing
const DEMO_OTP_CODE = "1234";
```

Find and remove (inside `StepOneVerification`):
```tsx
{/* Demo hint */}
<p className="text-center text-xs text-text-muted mt-6">
  Demo: Enter {DEMO_OTP_CODE} to verify
</p>
```

Also in `handleVerify`, clean up the demo bypass logic — replace:
```tsx
if (code === DEMO_OTP_CODE || code.length === 4) {
```
with the actual API call (or leave stub as just `if (code.length === 4)` until real API is wired). The current file already has `await new Promise(...)` stub — leave the stub but remove the `DEMO_OTP_CODE` reference.

### Step 2: TypeScript check

```bash
npx tsc --noEmit 2>&1 | grep "reset-password"
```
Expected: no new errors on reset-password (pre-existing auth page errors in zod/framer-motion are OK to ignore).

### Step 3: Commit

```bash
git add src/app/(auth)/reset-password/page.tsx
git commit -m "fix: remove demo OTP label and DEMO_OTP_CODE constant from reset-password

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 2: Standardize Form Cards, Labels, Inputs & Buttons (Forgot + Reset + Setup)

**Files:**
- Modify: `src/app/(auth)/forgot-password/page.tsx`
- Modify: `src/app/(auth)/reset-password/page.tsx`
- Modify: `src/app/(auth)/setup-account/page.tsx`

### Step 1: Update card wrappers on all 3 pages

For each page, find the `surface-card` wrapper div and update its className to include:
- Top accent gradient line (absolute child div)
- Bottom crimson ambient glow shadow

**forgot-password** — find `className="surface-card p-7 sm:p-8 shadow-sm"` and replace with:
```tsx
className="surface-card relative overflow-hidden p-8 sm:p-10 rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 backdrop-blur-sm"
```
Add as the first child inside:
```tsx
<div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
```

**reset-password** (two instances: the main card and the success card) — same className upgrade, same top accent line child.

**setup-account** — find `className="surface-card p-7 sm:p-8 shadow-sm"` and apply same upgrade.

### Step 2: Standardize FormLabel classes across all 3 pages

Find all instances of:
```tsx
<FormLabel className="text-xs font-medium text-text-secondary">
```
Replace with:
```tsx
<FormLabel className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
```

### Step 3: Standardize Input focus classes

On **forgot-password** `<Input>`:
```tsx
className="h-11 focus-visible:ring-crimson/50 focus-visible:border-crimson"
```

On **reset-password** password inputs:
```tsx
className="pr-10 h-11 focus-visible:ring-crimson/50 focus-visible:border-crimson"
```

On **setup-account** inputs:
```tsx
// Add to existing className
focus-visible:ring-crimson/50 focus-visible:border-crimson
```

### Step 4: Add shimmer effect to all primary submit buttons

For every `<Button type="submit" ...>` on the 3 pages, add:
1. `relative overflow-hidden group` to the Button className
2. As the first child of Button (before loading state check):
```tsx
<div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
```

Note: `shimmer` keyframe is already defined in `globals.css` (check — if not, it's used in login already so it must be defined or inline in Tailwind).

### Step 5: TypeScript check

```bash
npx tsc --noEmit 2>&1 | grep -E "(forgot|reset|setup)"
```
Expected: only pre-existing zod/framer-motion errors, no new errors.

### Step 6: Commit

```bash
git add src/app/(auth)/forgot-password/page.tsx \
        src/app/(auth)/reset-password/page.tsx \
        src/app/(auth)/setup-account/page.tsx
git commit -m "feat(auth): standardize card shell, labels, inputs, and button shimmer across auth pages

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 3: Remove Colored Background Icon Wrappers (Forgot + Reset Pages)

**Files:**
- Modify: `src/app/(auth)/forgot-password/page.tsx`
- Modify: `src/app/(auth)/reset-password/page.tsx`

### Step 1: Update forgot-password icons

**Form state icon** — find:
```tsx
<div className="w-16 h-16 rounded-2xl bg-crimson/20 border border-crimson/30 flex items-center justify-center">
  <Mail className="h-8 w-8 text-crimson" />
</div>
```
Replace with:
```tsx
<Mail className="h-8 w-8 text-crimson" />
```
Keep the `motion.div` wrapper and `className="flex justify-center mb-6"` outer container.

**Success state icon** — find:
```tsx
<div className="w-16 h-16 rounded-2xl bg-success/20 border border-success/30 flex items-center justify-center relative">
  <motion.div ...>
    <CheckCircle2 className="h-8 w-8 text-success" />
  </motion.div>
  {/* Success ring animation */}
  <motion.div className="absolute inset-0 rounded-2xl border-2 border-success/50" ... />
</div>
```
Replace with (keep the ring animation as a sibling, not child):
```tsx
<div className="flex justify-center mb-6 relative">
  <motion.div variants={iconVariants} initial="initial" animate="animate">
    <CheckCircle2 className="h-8 w-8 text-success" />
  </motion.div>
  <motion.div
    className="absolute w-12 h-12 rounded-full border-2 border-success/50"
    initial={{ scale: 1, opacity: 0.5 }}
    animate={{ scale: 1.8, opacity: 0 }}
    transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
  />
</div>
```

### Step 2: Update reset-password icons

**StepOneVerification icon** — find:
```tsx
<div className="w-16 h-16 rounded-2xl bg-crimson/20 border border-crimson/30 flex items-center justify-center">
  <ShieldCheck className="h-8 w-8 text-crimson" />
</div>
```
Replace with:
```tsx
<ShieldCheck className="h-8 w-8 text-crimson" />
```

**StepTwoPassword icon** — find:
```tsx
<div className="w-16 h-16 rounded-2xl bg-success/20 border border-success/30 flex items-center justify-center">
  <CheckCircle2 className="h-8 w-8 text-success" />
</div>
```
Replace with:
```tsx
<CheckCircle2 className="h-8 w-8 text-success" />
```

**SuccessPage icon** — find:
```tsx
<motion.div ... className="w-20 h-20 rounded-full bg-success/20 border-2 border-success/30 flex items-center justify-center mx-auto mb-6 relative">
```
Replace with:
```tsx
<motion.div ... className="flex justify-center mb-6 relative mx-auto">
```
Inside, keep the `CheckCircle2` and the ring `motion.div` sibling (same as forgot-password pattern above, scaled to `h-10 w-10`).

**reset-password logo mark** (`LockKeyhole` inside colored bg at top of main return) — find:
```tsx
<div className="w-12 h-12 rounded-xl bg-crimson/20 border border-crimson/30 flex items-center justify-center mx-auto mb-4">
  <LockKeyhole className="h-5 w-5 text-crimson" />
</div>
```
Replace with:
```tsx
<LockKeyhole className="h-6 w-6 text-crimson mx-auto mb-4" />
```

### Step 3: TypeScript check

```bash
npx tsc --noEmit 2>&1 | grep -E "(forgot|reset)"
```

### Step 4: Commit

```bash
git add src/app/(auth)/forgot-password/page.tsx \
        src/app/(auth)/reset-password/page.tsx
git commit -m "feat(auth): replace colored background icon wrappers with clean monochrome icons

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 4: Login — New SVG Logo Mark (Remove Colored Bg Wrapper)

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

The logo mark component is used in 2 places in login: desktop left panel and mobile logo area.

### Step 1: Create a shared `TitanMark` SVG component inline

This is a geometric SVG mark — two horizontal bars forming an abstract "TJ" ligature:

```tsx
function TitanMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Top bar — full width */}
      <rect x="2" y="4" width="20" height="3" rx="1.5" fill="currentColor" />
      {/* Vertical stem — left aligned */}
      <rect x="2" y="4" width="3" height="16" rx="1.5" fill="currentColor" />
      {/* Bottom accent — right offset, shorter */}
      <rect x="8" y="17" width="14" height="3" rx="1.5" fill="currentColor" />
    </svg>
  );
}
```

Place this function inside `login/page.tsx` (before the `LoginPage` default export).

### Step 2: Replace desktop logo mark

Find:
```tsx
<div className="w-10 h-10 rounded-xl bg-crimson/20 border border-crimson/30 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.2)]">
  <div className="w-4 h-4 bg-crimson rounded-sm shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
</div>
```
Replace with:
```tsx
<TitanMark className="w-9 h-9 text-crimson" />
```

### Step 3: Replace mobile logo mark

Find:
```tsx
<div className="w-12 h-12 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
  <div className="w-5 h-5 bg-crimson rounded-sm" />
</div>
```
Replace with:
```tsx
<TitanMark className="w-10 h-10 text-crimson mb-5" />
```

### Step 4: TypeScript check

```bash
npx tsc --noEmit 2>&1 | grep "login"
```
Expected: no errors on login/page.tsx.

### Step 5: Commit

```bash
git add src/app/(auth)/login/page.tsx
git commit -m "feat(auth/login): replace colored-bg logo mark with clean SVG TitanMark

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 5: Login — Signal Network SVG Left Panel

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

This is the biggest visual change. We add an inline SVG node-and-edge network as an absolutely-positioned overlay inside the left panel.

### Step 1: Add CSS keyframe for node pulse

Check `src/app/globals.css` — if `pulse-node` keyframe is not defined, add it. Look for existing `@keyframes` blocks, then add:

```css
@keyframes pulse-node {
  0%, 100% { opacity: 0.35; r: 0.5; }
  50%       { opacity: 0.85; r: 0.65; }
}
```

(This is in the `@layer base` or after the component utilities section — pick the nearest logical spot.)

### Step 2: Create the `SignalNetwork` component

Add this component inside `login/page.tsx` (above `LoginPage`):

```tsx
function SignalNetwork() {
  // 25 nodes: [cx, cy] as percentages of a 100×100 viewBox
  const nodes = [
    [8, 12], [22, 8], [38, 15], [55, 6], [72, 18], [88, 10],
    [15, 28], [32, 35], [48, 25], [65, 32], [82, 24],
    [5, 48], [20, 55], [36, 45], [52, 52], [68, 44], [85, 50],
    [12, 68], [28, 75], [44, 65], [60, 72], [78, 62],
    [18, 88], [40, 82], [62, 90],
  ] as const;

  // ~28 edges: pairs of node indices
  const edges = [
    [0,1],[1,2],[2,3],[3,4],[4,5],
    [0,6],[1,6],[2,7],[3,8],[4,9],[5,10],
    [6,7],[7,8],[8,9],[9,10],
    [6,11],[7,12],[8,13],[9,14],[10,15],
    [11,12],[12,13],[13,14],[14,15],[15,16],
    [12,17],[13,18],[14,19],[15,20],[16,21],
    [17,18],[18,19],[19,20],[20,21],
    [17,22],[19,23],[21,24],
    [22,23],[23,24],
  ];

  // Indices of "active" pulsing nodes
  const activeNodes = new Set([2, 8, 14, 19]);
  // Index of "glow" focal node
  const glowNode = 13;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    >
      <defs>
        <filter id="node-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="rgba(196,35,45,0.8)" />
        </filter>
      </defs>

      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          className="dark:stroke-[rgba(196,35,45,0.15)] stroke-[rgba(220,38,38,0.07)]"
          strokeWidth="0.15"
        />
      ))}

      {/* Nodes */}
      {nodes.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={i === glowNode ? 0.7 : 0.5}
          className="dark:fill-[rgba(196,35,45,0.35)] fill-[rgba(220,38,38,0.18)]"
          filter={i === glowNode ? "url(#node-glow)" : undefined}
          style={
            activeNodes.has(i)
              ? {
                  animation: `pulse-node 3s ease-in-out infinite`,
                  animationDelay: `${(i % 4) * 0.75}s`,
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}
```

### Step 3: Add `<SignalNetwork />` inside the left panel

Inside the left panel `<div className="hidden lg:flex ... relative ...">`, find the existing `<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">` glow blobs container. Add `<SignalNetwork />` as a sibling immediately after the closing `</div>` of that glow container (still inside the left panel, before `relative z-20` content divs):

```tsx
{/* Existing glow blobs */}
<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
  {/* ... existing blobs ... */}
</div>

{/* Signal Network overlay */}
<SignalNetwork />

{/* Logo area z-20 ... */}
```

### Step 4: Update footer area — replace "SECURE ACCESS PORTAL" with 3 badges

Find:
```tsx
<p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">
  SECURE ACCESS PORTAL
</p>
```
Replace with:
```tsx
<div className="flex items-center gap-2 flex-wrap">
  {["ENCRYPTED", "ZERO TRUST", "SOC2"].map((badge) => (
    <span
      key={badge}
      className="text-[10px] uppercase tracking-widest text-text-muted font-semibold px-2 py-1 rounded border border-border-subtle/50"
    >
      {badge}
    </span>
  ))}
</div>
```

### Step 5: TypeScript check

```bash
npx tsc --noEmit 2>&1 | grep "login"
```
Expected: no errors.

### Step 6: Commit

```bash
git add src/app/(auth)/login/page.tsx src/app/globals.css
git commit -m "feat(auth/login): add Signal Network SVG animation to left panel, badge footer

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 6: Login — Right Panel & Mobile Consistency Pass

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

### Step 1: Verify login card already has top accent line

The current login card has:
```tsx
<div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
```
✅ Keep as-is.

### Step 2: Add crimson glow shadow to login form card

Find the form card div: `className="surface-card relative overflow-hidden p-8 sm:p-10 rounded-2xl shadow-2xl ring-1 ring-border-subtle/50 backdrop-blur-xl"`

Replace `shadow-2xl` with `shadow-[0_0_60px_var(--crimson-glow)]`:
```tsx
className="surface-card relative overflow-hidden p-8 sm:p-10 rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 backdrop-blur-xl"
```

### Step 3: Verify form labels are already uppercase tracking-wide

The login page already has `text-xs font-semibold text-text-secondary uppercase tracking-wide` on labels. ✅ Confirm no inconsistencies.

### Step 4: TypeScript check

```bash
npx tsc --noEmit 2>&1 | grep "login"
```

### Step 5: Commit

```bash
git add src/app/(auth)/login/page.tsx
git commit -m "feat(auth/login): add crimson glow to form card shadow

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 7: Final Visual QA Pass

### Step 1: Start dev server

```bash
pnpm dev
```

### Step 2: Visual QA checklist

Visit each page at `http://localhost:3000`:

| Page | URL | Check |
|---|---|---|
| Login | `/login` | Signal Network visible, logo mark clean, 3 footer badges, glass card glow |
| Login (mobile) | `/login` resize < 1024px | Mobile logo mark clean, no colored bg wrapper |
| Forgot Password | `/forgot-password` | No colored icon bg, top accent line on card, uppercase labels |
| Reset Password | `/reset-password` | No "Demo: Enter 1234" text, no DEMO_OTP_CODE ref, clean icons |
| Setup Account | `/setup-account?token=test&email=test@example.com` | Card glow, uppercase labels |
| **Dark mode** | Toggle theme on each | Signal network visible, crimson glow adapts |
| **Light mode** | Toggle theme on each | Network subtle, cards clean on off-white bg |

### Step 3: Check TypeScript clean build

```bash
npx tsc --noEmit 2>&1
```
Expected: only pre-existing auth-page zod/framer-motion errors (in forgot-password:70, reset-password:70). Zero new errors.

### Step 4: Final commit

```bash
git add -A
git commit -m "feat(auth): complete UI/UX revamp — Signal Network, glass cards, clean icons

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Summary of All Changes

| File | Changes |
|---|---|
| `globals.css` | Add `@keyframes pulse-node` |
| `login/page.tsx` | `TitanMark` SVG component, `SignalNetwork` SVG component, badge footer, logo mark replacements ×2, card glow shadow |
| `forgot-password/page.tsx` | Card shell upgrade, top accent line, label uppercase, input focus, button shimmer, icon wrapper removal ×2 |
| `reset-password/page.tsx` | Remove `DEMO_OTP_CODE`, remove demo label, card shell upgrade ×2, icon wrapper removal ×4, label uppercase, input focus, button shimmer |
| `setup-account/page.tsx` | Card shell upgrade, label uppercase, input focus, button shimmer |

**No new npm packages. No API/logic changes. No layout restructuring.**
