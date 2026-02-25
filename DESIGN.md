# Design System: Titan Journal CRM
> **Version 2.0 — Enterprise Dark Command Center**
> Last updated: 2026-02-23

---

## 1. Brand Identity & Vision

**Titan Journal CRM** is a premium Introducing Broker (IB) funnel management platform. The interface should feel like the command center of a seasoned intelligence analyst — authoritative, information-dense, and alive with real-time data.

**Aesthetic Reference:** Bloomberg Terminal × Vercel Dashboard × Stripe Atlas × Linear.app

**The one thing a user must remember:** *Dark, cinematic, data-forward — with a pulse.*

---

## 2. Design Philosophy: "Dark Obsidian Command Center"

### Primary Mode: Dark Theme
Enterprise financial tools live in the dark. Traders, analysts, and IB managers spend hours staring at dashboards — dark mode reduces eye strain and elevates the premium feel.

### Secondary Mode: Light Theme
A clean, minimal light mode is preserved for TMA (Telegram Mini App) screens and users who prefer it. TMA screens use pure white as they need to feel native within Telegram's UI.

### Core Aesthetic Principles
1. **Information density without chaos** — Pack data intelligently using hierarchy, not clutter.
2. **Alive & reactive** — The UI breathes. Live indicators pulse. New data slides in. The dashboard feels real.
3. **Financial credibility** — Every micro-decision (padding, type size, color) signals precision.
4. **Cinematic depth** — Glass layers, depth shadows, and subtle background visuals create atmosphere.

---

## 3. Color System

### 3A. Dark Mode Palette (Primary)

| Token | Hex | Role |
|---|---|---|
| `--bg-void` | `#080810` | Page background — deep space black |
| `--bg-base` | `#0E0E1A` | App shell background |
| `--bg-card` | `#141422` | Card/panel surface |
| `--bg-elevated` | `#1C1C2E` | Elevated card, modal, dropdown |
| `--bg-overlay` | `#24243A` | Hover state, tooltip bg |
| `--border-subtle` | `#2A2A42` | Dividers, card borders |
| `--border-default` | `#38385A` | Input borders, table lines |
| `--text-primary` | `#F0F0FF` | Headings, critical values |
| `--text-secondary` | `#8888AA` | Labels, captions, helper text |
| `--text-muted` | `#555570` | Placeholder, disabled |
| `--brand-crimson` | `#C4232D` | Primary brand — CTA buttons, active nav |
| `--brand-crimson-hover` | `#E02835` | Button hover state |
| `--brand-crimson-subtle` | `#C4232D1A` | Crimson tint bg (10% opacity) |
| `--brand-crimson-glow` | `#C4232D33` | Glow effect (20% opacity) |
| `--accent-gold` | `#E8B94F` | VIP/premium indicators, depositing clients |
| `--accent-gold-subtle` | `#E8B94F1A` | Gold tint bg |
| `--status-success` | `#22D3A0` | Verified, confirmed, active |
| `--status-warning` | `#F59E0B` | Pending, awaiting review |
| `--status-danger` | `#EF4444` | Rejected, failed, error |
| `--status-info` | `#60A5FA` | Registered, info states |
| `--live-pulse` | `#FF3B47` | Live indicator — animated pulse dot |

### 3B. Light Mode Palette (TMA & Preference)

| Token | Hex | Role |
|---|---|---|
| `--bg-page` | `#F8F8FC` | Page background |
| `--bg-card` | `#FFFFFF` | Card surface |
| `--bg-elevated` | `#F1F1FA` | Sidebar, secondary bg |
| `--border-default` | `#E2E2F0` | Input borders, dividers |
| `--text-primary` | `#1A1A2E` | Headings, critical values |
| `--text-secondary` | `#5A5A7A` | Labels, captions |
| `--text-muted` | `#9A9AB0` | Placeholder, disabled |
| `--brand-crimson` | `#9A1B22` | Kept darker in light mode |
| `--brand-crimson-subtle` | `#9A1B221A` | Tinted bg |
| `--accent-gold` | `#D4A017` | Gold in light mode |
| `--status-success` | `#10B981` | Verified states |
| `--status-warning` | `#F59E0B` | Pending states |
| `--status-danger` | `#EF4444` | Error/rejected states |

---

## 4. Typography System

**NEVER use Inter, Roboto, or system fonts.** These are generic and will make the CRM look like every other SaaS dashboard.

### Font Stack

| Role | Font | Weights | Use |
|---|---|---|---|
| **Display / Heading** | `Space Grotesk` | 500, 600, 700 | Page titles, section headings, dialog titles |
| **Body / UI** | `DM Sans` | 400, 500, 600 | All body copy, form labels, nav links, descriptions |
| **Data / Mono** | `JetBrains Mono` | 400, 500 | KPI numeric values, IDs, balances, timestamps, code values |

> ⚠️ **Space Grotesk replaced Syne** (v3.1). Syne was editorial — wrong for data-dense dashboards. Space Grotesk has sharp geometric numerics ideal for fintech UIs.

### Import (Next.js Font)
```ts
Space_Grotesk: 500, 600, 700  // --font-syne CSS var (backwards compat)
DM_Sans: 400, 500, 600
JetBrains_Mono: 400, 500
```

### Typography Standard — Desktop Dashboard (canonical reference: `admin/page.tsx`)

| Element | Class | Notes |
|---|---|---|
| Page h1 | `text-2xl font-bold text-text-primary` | NO `font-display font-extrabold` |
| Section heading (panel) | `text-sm font-semibold text-text-secondary uppercase tracking-wider` | — |
| Tab sub-heading | `text-xl font-semibold text-text-primary` | — |
| KPI numeric value | `text-2xl font-bold data-mono [accent]` | JetBrains Mono via `data-mono` |
| KPI label | `text-xs text-text-secondary` | — |
| Body | `text-sm text-text-secondary font-sans` | — |
| Caption | `text-xs text-text-muted` | — |
| Dialog/Sheet title | `font-bold text-xl text-text-primary` | — |

### Scale

| Token | Size | Line Height | Font | Use |
|---|---|---|---|---|
| `display-xl` | 32px | 1.2 | Space Grotesk 700 | Page headings (h1) |
| `display-lg` | 24px | 1.3 | Space Grotesk 700 | Section headings, dialog titles |
| `heading-md` | 20px | 1.4 | DM Sans 600 | Card titles, table headers |
| `heading-sm` | 16px | 1.5 | DM Sans 600 | Sub-section headings |
| `body-lg` | 15px | 1.6 | DM Sans 400 | Primary body text |
| `body-md` | 14px | 1.5 | DM Sans 400 | Secondary text, descriptions |
| `body-sm` | 13px | 1.5 | DM Sans 400 | Captions, helper text |
| `label` | 12px | 1.4 | DM Sans 500 | Form labels, table column headers |
| `mono-md` | 13px | 1.5 | JetBrains Mono 400 | IDs, timestamps, balances |
| `mono-sm` | 12px | 1.4 | JetBrains Mono 400 | Inline codes, small data values |

---

## 5. Spatial System & Grid

### Base Unit: 4px

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Micro gaps (icon padding) |
| `space-2` | 8px | Tight spacing (badge padding) |
| `space-3` | 12px | Form element inner padding |
| `space-4` | 16px | Card padding standard |
| `space-5` | 20px | Between related groups |
| `space-6` | 24px | Section internal spacing |
| `space-8` | 32px | Between card rows |
| `space-10` | 40px | Page section gaps |
| `space-12` | 48px | Major layout separators |

### Layout Grid
- **Sidebar**: 240px fixed width (collapsed: 68px icon-only)
- **Content area**: `calc(100vw - 240px)` with `max-width: 1440px`
- **Grid columns**: 12-column fluid, 24px gutter
- **KPI cards**: 4-column on ≥1280px, 2-column on ≥768px, 1-column on mobile
- **Content/sidebar split**: 7/5 ratio for chart + activity panels

### Border Radius
| Token | Value | Use |
|---|---|---|
| `radius-sm` | 6px | Badges, small chips |
| `radius-md` | 10px | Buttons, inputs, small cards |
| `radius-lg` | 14px | Standard cards, panels |
| `radius-xl` | 20px | Large hero cards |
| `radius-full` | 9999px | Pills, avatars, live dots |

---

## 6. Component Library

### 6A. KPI Metric Card (Dark Mode)
- **Background**: `--bg-card` (`#141422`) with `1px solid --border-subtle`
- **Top right**: Small icon in `--brand-crimson-subtle` tinted circle
- **Metric value**: `display-2xl` Syne 800 in `--text-primary`, then tighter for long numbers
- **Label**: `label` DM Sans 500 `--text-secondary`
- **Delta**: `body-sm` with color-coded arrow (green up / red down), `+19%` format
- **Bottom accent line**: 3px left-border in `--brand-crimson` on active/featured card
- **Hover**: Subtle `--brand-crimson-glow` box-shadow, scale(1.01) transition

### 6B. Navigation Sidebar (Dark)
- **Shell**: `--bg-base` background, `1px solid --border-subtle` right border
- **Logo area**: "TITAN JOURNAL" in Syne 700, "CRM" subscript in `--brand-crimson`
- **Nav items**: `body-md` DM Sans 500, `--text-secondary`, hover `--text-primary` + crimson left indicator bar
- **Active item**: `--brand-crimson-subtle` background, `--text-primary` text, 3px crimson left bar
- **Section groups**: Uppercase `label` separator in `--text-muted`
- **Bottom**: User avatar + role badge + logout

### 6C. Data Table
- **Header row**: `--bg-elevated` background, `label` DM Sans 500 `--text-secondary`, uppercase
- **Data rows**: alternating hover `--bg-overlay`, `body-md` DM Sans
- **ID columns**: `mono-md` JetBrains Mono
- **Status badges**: pill-shaped `radius-full`, color-coded bg (10% opacity) + text
- **Row actions**: appear on hover — icon buttons (Edit, View, Verify)
- **Sticky header**: shadows on scroll
- **Pagination**: simple prev/next with page count, `--bg-elevated` pills

### 6D. Status Badges
| Status | Background | Text | Label |
|---|---|---|---|
| NEW | `--status-info` 10% | `--status-info` | New |
| CONTACTED | `--accent-gold` 10% | `--accent-gold` | Contacted |
| REGISTERED | `#A855F7` 10% | `#A855F7` | Registered |
| DEPOSIT_REPORTED | `--status-warning` 10% | `--status-warning` | Proof Pending |
| DEPOSIT_CONFIRMED | `--status-success` 10% | `--status-success` | Confirmed ✓ |

### 6E. Buttons
- **Primary**: `--brand-crimson` fill, white text, `radius-md`, hover `--brand-crimson-hover` + subtle glow
- **Secondary**: `--bg-elevated` fill, `--text-primary` text, `1px solid --border-default`
- **Ghost**: transparent, `--text-secondary`, hover `--bg-overlay`
- **Danger**: `--status-danger` fill for destructive actions
- **Icon button**: square `radius-md`, `--bg-elevated`, `--text-secondary`

### 6F. Live Activity Indicator
- Pulsing dot: `10px` circle, `--live-pulse` color
- CSS keyframe: scale 1→1.8→1, opacity 1→0→1, 2s infinite
- Label: "LIVE" in `label` DM Sans 600, `--live-pulse` color
- Container: `--brand-crimson-subtle` pill

### 6G. Chat / Handover Interface
- **Container**: Full-height panel, `--bg-card`
- **User messages** (lead): Left-aligned bubble, `--bg-elevated`, `--text-primary`
- **Agent/Bot messages**: Right-aligned, `--brand-crimson-subtle` bg, white text
- **Input**: Bottom-docked, `--bg-elevated` bg, input + send button
- **Handover toggle**: Prominent switch at top, red = "Bot Active", green = "Human Active"
- **Timestamp**: `mono-sm` in `--text-muted`

### 6H. Modal / Sheet
- **Overlay**: `rgba(8, 8, 16, 0.8)` backdrop with blur(8px)
- **Panel**: `--bg-elevated`, `radius-xl`, shadow-2xl
- **Header**: title + X close button

### 6I. Form Fields (Dark)
- **Input**: `--bg-elevated` bg, `1px solid --border-default`, `radius-md`
- **Focus state**: `--brand-crimson` border, subtle crimson glow shadow
- **Label**: `label` DM Sans 500 `--text-secondary`
- **Error**: `--status-danger` border + message below

### 6J. Toast / Notification
- **Success**: Left-border `--status-success`, dark card bg
- **Error**: Left-border `--status-danger`
- **Info**: Left-border `--status-info`
- **Position**: Bottom-right, stacks upward

---

## 7. Page Architecture

### Page 1: `/login` — Authentication Screen
**Layout:** Full-screen split — Left 55% cinematic background visual, Right 45% white/dark auth panel
- Left: Google Flow generated background (see §9B), overlaid with "TITAN JOURNAL CRM" logo, tagline, and subtle animated particles
- Right (dark): Centered login card — logo mark, "Welcome back", email/password fields, "Sign In" CTA button, "Forgot password?" link
- Bottom: Telegram Mini App login option (for mobile)

### Page 2: `/` — Main Dashboard ("The Tally")
**Layout:** Sidebar + main content area
- **Top header**: Page title "Command Center", date range selector, refresh button, live indicator
- **Row 1**: 4 KPI cards (New Leads, Registered, Depositing FTD, Total Balance)
- **Row 2**: 7/5 grid — Left: Line chart (leads + conversions, 30 days), Right: Live Activity feed (real-time lead arrivals)
- **Row 3**: 6/6 grid — Left: Funnel conversion chart (NEW→CONFIRMED pipeline), Right: Weekly performance bar chart
- **Bottom**: Quick action strip (View Pending Verifications, Handover Alerts)

### Page 3: `/leads` — CRM Lead Portal
**Layout:** Sidebar + main content
- **Header**: "Lead Intelligence", search bar, status filter tabs (All / New / Registered / Pending / Confirmed), date range, export button
- **Table**: Full-width — columns: Avatar+Name, Telegram ID (mono), HFM Broker ID (mono), Phone, Status badge, Registered date, Deposit balance (gold text), Handover toggle, Actions
- **Pagination**: Bottom, 20/50/100 per page
- **Empty state**: Crimson icon + "No leads yet. Connect your bot."

### Page 4: `/leads/:id` — Lead Detail View
**Layout:** Sidebar + 8/4 grid (detail | activity)
- **Left 8col**: Lead profile card (avatar, name, Telegram ID, contact info, status badge, deposit balance), Attachments gallery (photos/videos inline), Edit info panel
- **Right 4col (full height)**: Chat panel — interaction timeline (auto/manual/system events), bottom-docked reply input, handover mode toggle at top
- **Action bar**: Approve Deposit button, Reject button, Mark Status, Generate Invite Link

### Page 5: `/verification` — Deposit Verification Queue
**Layout:** Sidebar + main content
- **Header**: "Verification Queue", count badge, filter (Pending / All)
- **Cards grid**: Each verification card shows: Lead name + avatar, deposit amount, time submitted, thumbnail of uploaded proof (clickable to lightbox), Approve/Reject/Ask More Info action buttons
- **Detail drawer**: Slide-out from right — full attachment preview, lead history

### Page 6: `/settings` — Settings Hub
**Layout:** Sidebar + settings sub-nav + content
- **Sub-navigation** (top tabs or left sub-nav): Bot Config | Knowledge Base | Command Menu | Team | Sessions
- **Default view (Bot Config)**: Script editor for Welcome message, Follow-up templates, AI persona settings toggle, TMA Registration URL field

### Page 7: `/settings/knowledge-base` — Knowledge Base Manager
**Layout:** Settings layout
- **Header**: "Knowledge Base", "+ Add Content" button, filter (All / Text / Link / Template / PDF / Video)
- **Cards**: Each KB entry card shows title, type badge, status badge (PENDING/PROCESSING/READY/FAILED), content preview, active toggle, edit/delete actions
- **Add Content modal**: Tabs — "Text/Template" (rich text editor), "Upload File" (drag & drop PDF/DOCX), "Add Link" (URL + title form)

### Page 8: `/settings/commands` — Command Menu Manager
**Layout:** Settings layout
- **Header**: "Telegram Command Menu", reorder hint text
- **Drag-and-drop list**: Each command row shows drag handle, `/command` slug (mono), label, description, active toggle, edit/delete
- **Drag to reorder** maps to PATCH /command-menu/reorder
- **Add Command drawer**: command slug, label, description, content editor (Tiptap rich text → rendered in Telegram)

### Page 9: `/settings/team` — Team Management
**Layout:** Settings layout
- **Header**: "Team Members", "+ Invite Member" button
- **Team table**: Avatar, Name, Email, Role badge (OWNER/ADMIN/STAFF), Status (Active/Inactive), Last login (mono), Actions (Change Role, Deactivate, Reset Password)
- **Pending Invitations section**: List of unaccepted invitations with email, role, expiry countdown, revoke button
- **Invite modal**: Email field, Role selector, "Generate Invite Link" CTA — copies deep link to clipboard

### Page 10: `/settings/sessions` — Active Sessions
**Layout:** Settings layout
- **Header**: "Active Sessions", "Revoke All" danger button
- **Session list**: Device icon, browser/device description, IP address (mono), last active timestamp (mono), current session badge, Revoke button

### Page 11: `/tma/register` — TMA Registration Form
**Layout:** Full mobile screen, pure white, no sidebar
- **Header**: Titan Journal logo (crimson), centered
- **Form card**: "Register your Account" heading, HFM Broker ID input, Email input, Phone Number input, full-width crimson Submit button
- **Footer**: "Where can I find my HFM ID?" help link
- **UX**: Large touch targets (48px min), mobile-optimized spacing

### Page 12: `/tma/deposit` — TMA Deposit Proof Upload
**Layout:** Full mobile screen, pure white
- **Header**: Titan Journal logo, "Report Deposit" heading
- **Upload zone**: Large drag/tap area with camera icon, "Tap to upload receipt or video", dashed border crimson
- **Amount field**: "Deposit Amount (USD)" input with $ prefix
- **File preview**: Thumbnail shown after selection
- **Submit button**: Full-width crimson

### Page 13: `/tma/status` — TMA Verification Status
**Layout:** Full mobile screen, pure white
- **Status card (PENDING)**: Clock icon in amber, "Verification Pending" title, submitted time
- **Status card (APPROVED)**: Check circle in green, "Deposit Confirmed!", balance amount in gold
- **Status card (REJECTED)**: X circle in red, rejection reason, "Resubmit" link
- **History accordion**: Timeline of submission events

---

## 8. Animation & Motion Design

### Core Principles
- **One orchestrated reveal** beats scattered micro-interactions
- CSS-only where possible; Framer Motion for complex sequences
- Duration: 150ms micro, 300ms standard, 600ms cinematic

### Animations Catalog

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Page load | Staggered fade-in + slide-up (16px) for each section | 300-600ms | ease-out |
| KPI cards | Stagger 80ms per card, fade + scale(0.97→1) | 400ms | spring |
| Chart draw | Tremor native animation, slow draw on load | 800ms | ease-in-out |
| Live feed | New row slides in from top, pushes others down | 300ms | ease-out |
| Live dot | Pulse: scale(1→1.8), opacity(1→0), repeat | 2s | ease-in-out |
| Status badge | Appear: scale(0.8→1) + fade | 200ms | spring |
| Handover toggle | Smooth color transition, spring snap | 250ms | spring |
| Table row hover | Background fade + right-arrow appears | 150ms | ease |
| Modal open | Scale(0.95→1) + fade, backdrop blur-in | 250ms | ease-out |
| Sidebar collapse | Width transition, icon fade | 200ms | ease-in-out |
| Data number | Count-up animation on first load | 1000ms | ease-out |
| Notification toast | Slide in from bottom-right | 300ms | spring |
| Chat message | Slide up from input, bubble appear | 200ms | ease-out |
| KPI card hover | Crimson glow shadow, scale(1.01) | 200ms | ease |

### Number Count-Up (KPI Cards)
KPI metric values should animate from 0 to their target value on page load using a count-up effect. Use `requestAnimationFrame` with `easeOutExpo` curve.

---

## 9. Google Flow Visual Asset Brief

> **Tool:** Google Flow
> **Image model:** Imagen 4 ("banana pro") — highest quality
> **Video model:** Veo 3.1 Quality — for the dashboard loop; use Veo 3.1 Fast for test previews
> **Available aspect ratios:** 16:9 (landscape) or 9:16 (portrait) — no other options
> **Aesthetic direction:** "Crimson Constellation" — abstract, cosmic, premium. Zero trading/finance iconography.
> **Brand:** Crimson red + deep black (dark mode) / Crimson red + pure white (light mode)

---

### 9A. Dashboard Hero Background (Google Flow / Imagen 4)
**Placement:** Behind KPI row, 100% width, fixed position, overlaid with `linear-gradient(to bottom, transparent 0%, #080810 100%)`
**Aspect Ratio: 16:9** — use `object-fit: cover; object-position: center top` in CSS
**Save as:** `public/assets/bg/dashboard-hero-dark.webp` and `dashboard-hero-light.webp`

**DARK MODE — paste into Google Flow:**
```
A sweeping abstract dark cosmos background. Deep void black (#080810) fills the entire frame.
From the left and right edges, luminous crimson red tendrils of energy flow inward, meeting at
a soft glowing node cluster near the center-left. These are not charts — they are organic,
flowing filaments of pure light, like bioluminescent threads in deep space. Scattered throughout:
dozens of tiny gold (#E8B94F) pinpoint nodes where threads intersect, glowing warmly. Fine white
dust particles drift across the entire frame in slow diagonal motion. The center of the image is
slightly brighter with a very soft diffused crimson halo. Edges fall into pure black. Extreme depth
of field — foreground threads sharp, background layers softly out of focus. No text. No symbols.
No people. No icons. Ultra photorealistic. 8K resolution. Horizontal panoramic composition.
Mood: vast, authoritative, cinematic silence.
```

**LIGHT MODE — paste into Google Flow:**
```
An ultra-clean minimal abstract background for a premium enterprise dashboard, light mode.
Pure white (#FFFFFF) base fills the entire frame. From the top-right corner, an extremely soft
and subtle crimson radial gradient (#9A1B22 at 6% opacity maximum) bleeds inward, barely
perceptible — more felt than seen. Scattered across the white field: a very faint constellation
of tiny crimson dots (1–2px) connected by hairline crimson threads at 4% opacity, forming an
irregular geometric network. The bottom-left corner is pure clean white with no effect.
Composition is horizontal and airy. No text. No symbols. No logos. No people. Hyper minimal.
The image must look almost blank — pure sophistication. 8K resolution.
Mood: clinical precision, luxury restraint.
```

---

### 9B. Login Screen Background (Google Flow / Imagen 4)
**Placement:** Full-bleed left panel (55%) of login split layout
**Aspect Ratio: 9:16** — use `object-fit: cover` to fill the vertical panel
**Save as:** `public/assets/bg/login-cinematic.webp`

**DARK MODE ONLY — paste into Google Flow:**
```
A dramatic luxury cinematic portrait background for a premium enterprise login screen.
Deep obsidian black (#0A0A14) dominates 80% of the frame. From the bottom-center, a single
powerful crimson red (#C4232D) light source radiates upward — not a flame, not an explosion,
but a clean volumetric column of crimson light cutting through the darkness, like a beacon.
On either side of this column: large translucent geometric forms — dark glass monoliths,
angular prisms with crimson light refracting through their edges in thin rainbow-free lines.
The upper 30% of the frame fades completely to absolute black with no detail. Ultra-fine
white and silver micro-particles rise upward throughout the frame, denser near the light source.
No text. No symbols. No people. No icons. No logos. Cinematic quality. Shallow depth of field.
Shot from slightly below, looking up — creating a sense of scale and power. 4K portrait.
Mood: authority, mystery, premium exclusivity.
```

---

### 9C. Animated Video Loop — Dashboard Background (Veo 3.1 Quality)
**Placement:** `<video autoplay loop muted playsinline>` behind dashboard hero, same position as §9A
**Aspect Ratio: 16:9**
**Settings:** Veo 3.1 Quality model. Generate at least 2 attempts, pick smoothest loop.
**Save as:** `public/assets/bg/dashboard-loop.mp4`

**DARK MODE — paste into Google Flow (Veo):**
```
A seamless looping abstract dark animation for a premium enterprise dashboard background.
Deep void black base. From the left edge, thin luminous crimson red filaments slowly drift
rightward — organic, flowing, never repeating the same path. They pulse gently as they move,
brightening slightly at their tips before fading. Where two filaments cross, a small gold
point of light blooms briefly then dims. In the background layer, an ultra-slow drift of
white micro-particles moves diagonally top-left to bottom-right. All motion is slow, meditative,
continuous — no sudden changes, no flash, no cuts. Camera is completely static — no zoom,
no pan. The loop must be seamless with no visible restart. Duration: 10 seconds.
Colors strictly: black bg, #C4232D crimson, #E8B94F gold, #FFFFFF particles.
No text. No charts. No symbols. No icons. No people. Cinematic color grade.
Mood: calm intelligence, deep space authority.
```

---

### 9D. Verification Queue Background (Google Flow / Imagen 4)
**Placement:** Full page background texture, overlaid at 8% opacity in CSS
**Aspect Ratio: 16:9**
**Save as:** `public/assets/bg/verification-dark.webp` and `verification-light.webp`

**DARK MODE — paste into Google Flow:**
```
A very subtle and understated dark abstract background texture for an enterprise verification
interface. Very dark navy-black (#0A0A18) base. In the center of the frame, an extremely faint
warm amber (#F59E0B) light glow sits at the horizon line — soft, distant, diffused, as if far
away. From this center glow, hairline geometric rays extend outward at 3% opacity — barely
visible rays of warm light. The upper and lower portions of the image are pure deep black with
no detail. The entire image is intentionally dark and quiet. No text. No symbols. No charts.
No people. 4K resolution. Photorealistic. The mood is: official, authoritative, review chamber.
This background must not distract — it is a texture, not a focal point.
```

**LIGHT MODE — paste into Google Flow:**
```
An ultra-minimal clean white abstract background texture for a document verification screen.
Pure white (#FFFFFF) base. In the upper-center, an extremely faint amber-warm radial glow
(#F59E0B at 5% opacity maximum). Across the white field: barely visible fine geometric lines
forming a sparse perspective grid receding toward the center horizon — at 3% opacity, almost
invisible. Bottom 30%: pure clean white, no effect. No text. No symbols. No icons. No people.
4K resolution. The image must appear nearly blank — the texture is subliminal.
Mood: clarity, precision, institutional trust.
```

---

### 9E. TMA Mobile Background (Google Flow / Imagen 4)
**Placement:** Full-screen background on all TMA screens (`/tma/register`, `/tma/deposit`, `/tma/status`)
**Aspect Ratio: 9:16** — portrait, native phone dimensions
**Save as:** `public/assets/bg/tma-mobile-bg.webp`

**LIGHT MODE ONLY — paste into Google Flow:**
```
An ultra-clean minimal mobile app background for a premium enterprise registration form.
Pure white (#FFFFFF) fills the entire frame. From the very top-center, an extremely soft and
subtle crimson radial gradient (#9A1B22 at 5% opacity) breathes downward for roughly 20% of
the frame height, then completely disappears into pure white. The remaining 80% is spotless
white. No gradient at the bottom. Across the white area: a barely-there constellation of tiny
crimson dots (1–2px diameter) at 3% opacity — like distant stars in daylight. These dots are
scattered loosely, not in a grid. No connecting lines. No text. No symbols. No icons. No people.
Portrait orientation. 4K resolution. The effect must be imperceptible at first glance —
a background that breathes without competing with form elements above it.
Mood: clean, airy, trustworthy, premium mobile.
```

---

### 9F. TMA Verification Success Background (Google Flow / Imagen 4)
**Placement:** Card background for "Deposit Confirmed" state in `/tma/status`, overlaid with gradient
**Aspect Ratio: 9:16**
**Save as:** `public/assets/bg/tma-confirmed-bg.webp`

**LIGHT MODE / SUCCESS STATE — paste into Google Flow:**
```
A serene and celebratory abstract background for a financial confirmation success screen.
Very deep dark emerald green (#064E3B) at the absolute center of the frame, radiating outward.
This transitions smoothly to deep black (#080810) at all edges and corners — a radial vignette.
At the glowing center: soft emerald light bloom (#22D3A0), diffused and gentle, like sunlight
through deep water. Scattered throughout the entire frame: hundreds of tiny bright white
sparkle points — some sharp, some soft-blurred — distributed unevenly like stars or celebratory
light caught mid-float. No confetti shapes. No text. No symbols. No icons. No people.
Portrait orientation. 4K resolution. Cinematic color grade.
Mood: calm achievement, quiet celebration, financial trust confirmed.
```

---

## 10. Implementation Notes for Stitch MCP

When generating wireframe designs via Stitch MCP, these rules MUST be strictly enforced:

### Critical Rules
1. **Dark mode is primary** for all admin dashboard pages. Light mode only for TMA screens.
2. **Font imports required**: Syne (display), DM Sans (body), JetBrains Mono (mono data)
3. **Background visuals**: Include placeholder rectangles labeled `[FLOW VISUAL ASSET - see §9A/9B/etc]` to indicate where generated images/videos will be embedded
4. **Live indicator**: Every dashboard page header must include the pulsing `LIVE` dot component
5. **Sidebar**: 240px persistent sidebar on all admin pages, `--bg-base` color

### Color Variables (enforce in all Stitch outputs)
```css
Primary brand:    #C4232D  (dark mode) / #9A1B22  (light mode)
Page background:  #080810  (dark mode) / #F8F8FC  (light mode)
Card surface:     #141422  (dark mode) / #FFFFFF  (light mode)
Elevated:         #1C1C2E  (dark mode) / #F1F1FA  (light mode)
Text primary:     #F0F0FF  (dark mode) / #1A1A2E  (light mode)
Text secondary:   #8888AA  (dark mode) / #5A5A7A  (light mode)
Border:           #2A2A42  (dark mode) / #E2E2F0  (light mode)
Success:          #22D3A0  (both modes)
Warning:          #F59E0B  (both modes)
Gold accent:      #E8B94F  (both modes)
```

### Page-Specific Notes
- All IDs (Lead ID, Telegram ID, HFM ID, Session ID) render in **JetBrains Mono 13px**
- Deposit balances render in **gold (`#E8B94F`)** with DM Sans 600
- The "handover" toggle is **always prominent** on lead-facing views
- Status badges are always pill-shaped with soft opacity backgrounds

---

## 11. Mobile Design System — Native App Shell

> **Target viewport:** 390×844px (iPhone 14 Pro reference). All mobile screens must feel like a **native iOS/Android app** within a web container. The mobile shell activates at `max-width: 767px`.

---

### 11A. Mobile Design Principles

The mobile admin shell applies the same dark Obsidian palette but adapts to **thumb-first interaction patterns**:

1. **Thumb Zone First** — Primary actions within the bottom 75% of screen height (natural thumb arc). Destructive actions require confirmation and are never placed in the top-right corner.
2. **Progressive Disclosure** — Show summary → expand to detail. List items show enough context to make decisions without opening. Never paginate with numbered pages — use infinite scroll or "Load More".
3. **Swipe as Language** — Swipe right = approve/confirm (green). Swipe left = reject/dismiss (red). Swipe down = close sheet. These gestures are consistent across all swipeable surfaces.
4. **Velocity Feedback** — Every tap produces a micro-animation (scale 0.97 on press). Cards respond to touch velocity for natural throw gestures.
5. **Role Clarity** — Each role has distinct visual differentiation via the header crown/role badge:
   - `SUPERADMIN`: `#E8B94F` (gold) crown icon — Platform Authority
   - `OWNER`: `#C4232D` (crimson) diamond icon — Org Owner
   - `ADMIN`: `#60A5FA` (blue) shield icon — Elevated Staff
   - `STAFF`: `#8888AA` (muted) circle icon — Standard Access
6. **Information Scent** — List cards always show: name, status, key metric (deposit/date). Never mystery-meat navigation.

---

### 11B. Mobile Navigation Architecture

#### Bottom Tab Bar
- **Height:** 56px + `env(safe-area-inset-bottom)` for iOS home indicator
- **Background:** `#0E0E1A` with `backdrop-filter: blur(20px)` — frosted glass effect
- **Border:** 1px `#2A2A42` top border
- **Active state:** Pill-shaped bg `#C4232D1A` (10% crimson tint) + icon `#C4232D` + label `#F0F0FF` DM Sans 600 11px
- **Inactive state:** Icon + label `#555570` DM Sans 400 11px
- **Badge counter:** 8px circle `#C4232D` solid fill, JetBrains Mono 9px white, scales to pill for 10+ ("9+"), positioned top-right of icon

#### Tab Sets by Role

| Tab Position | SUPERADMIN | OWNER | ADMIN | STAFF |
|---|---|---|---|---|
| Tab 1 (Home) | Platform Overview | Dashboard | Dashboard | My Tasks |
| Tab 2 | Organizations | Leads | Leads | Leads |
| Tab 3 | Admin Panel | Verify | Verify | Verify |
| Tab 4 (More) | More ↑ | More ↑ | More ↑ | More ↑ |

#### More Drawer (Bottom Sheet)
- Slides up from bottom on "More" tab tap
- **Height:** 60vh, `#141422` background, 20px top border-radius
- **Handle:** 4px × 32px pill, `#38385A`, centered at top
- **Content by role:**
  - All roles: Notifications | Profile | Language toggle
  - OWNER/ADMIN: Analytics | Settings
  - SUPERADMIN: Analytics | System Config
- Closes on backdrop tap or swipe-down gesture

#### Mobile Page Header
- **Height:** 52px
- **Background:** `#0E0E1A`
- **Left:** Role badge icon (colored per role, 24px) + Page title DM Sans 600 17px `#F0F0FF`
- **Right:** Bell icon with notification badge count + User avatar (32px circle, taps → Profile)
- **Border-bottom:** 1px `#2A2A42`
- The pulsing `LIVE` dot appears in header right-side on live data pages (Dashboard, Verification)

---

### 11C. Mobile-Specific Component Library

#### C1: Bottom Sheet
Replaces all centered modal dialogs on mobile.
- **Snap points:** 35vh (peek/confirm), 60vh (half/form), 95vh (full-screen/detail)
- **Drag handle:** 4px × 32px pill `#38385A` at top center
- **Backdrop:** `rgba(8,8,16,0.8)` with `backdrop-filter: blur(8px)`
- **Surface:** `#141422`, 20px top border-radius
- Dismiss: swipe down below 30% snap or tap backdrop

#### C2: Swipe Card (Verification Queue)
Directional swipe for approve/reject on verification lead cards:
- **Swipe Right →** Card overlays `#22D3A0` green glow tint + "✓ APPROVE" DM Sans 700 stamp label appearing from left
- **Swipe Left ←** Card overlays `#EF4444` red glow tint + "✗ REJECT" DM Sans 700 stamp label appearing from right
- **Threshold:** 40% of card width triggers action; spring-back animation if released below threshold
- **Confirmation:** After threshold cross, card flies off-screen. Bottom toast confirms: "✓ Lead #1234 approved" or "✗ Lead #1234 rejected"
- **Undo:** Toast includes 4-second "Undo" button before API call commits

#### C3: Floating Action Button (FAB)
- **Size:** 56px circle
- **Color:** `#C4232D` fill, `box-shadow: 0 4px 20px rgba(196,35,45,0.25)`
- **Position:** 20px from right edge, 20px above bottom tab bar (not overlapping tab bar)
- **Icon:** Plus (Phosphor) 24px white
- **Context-aware label:** "New Lead" on Leads page, "Submit Deposit" on Verification (STAFF only)
- **FAB Expand:** Tapping rotates icon to ×, reveals 2-3 mini action buttons stacked above with labels (DM Sans 500 12px)

#### C4: Pull-to-Refresh
- **Trigger zone:** 60px drag distance
- **Indicator:** Crimson spinner (not OS-default), "Syncing..." DM Sans 400 12px `#8888AA`
- **LIVE dot** pulses rapidly during sync, returns to slow pulse when complete

#### C5: Mobile Lead Card
Full-width swipeable list item:
- **Container:** `#141422` bg, `#2A2A42` border, 12px border-radius, 16px padding
- **Left accent bar:** 3px solid, color-coded by status:
  - `#60A5FA` = NEW/Registered
  - `#F59E0B` = DEPOSIT_REPORTED (pending)
  - `#22D3A0` = DEPOSIT_CONFIRMED (verified)
  - `#EF4444` = Rejected
- **Row 1:** Display name DM Sans 600 15px `#F0F0FF` + status pill right-aligned
- **Row 2:** HFM Broker ID JetBrains Mono 13px `#8888AA` + relative date right-aligned `#555570`
- **Row 3** (if deposit): `#E8B94F` gold deposit amount DM Sans 600 + "DEPOSIT" micro-label `#555570` 10px uppercase
- Tap → Lead Detail page (push navigation with slide-left transition)

#### C6: Quick Stat Strip
Horizontal scroll row replacing the desktop 4-column KPI grid:
- Each chip: 120px × 72px, `#141422` bg, `#2A2A42` border, 10px radius
- **Content:** Phosphor icon (24px, tinted circle bg) + value (Syne 700 22px) + label (DM Sans 400 11px `#8888AA`)
- Chips: New Leads | Registered | FTD Count | AUM ($)
- Gold tint (#E8B94F) on financial chips (FTD, AUM)

#### C7: Role-Gated Empty State
When a role has no access to a section:
- Centered illustration placeholder `[FLOW VISUAL — LOCKED STATE]`
- "This section requires Owner access" DM Sans 400 14px `#8888AA`
- No button. No workaround. Clear and respectful.

---

### 11D. Role-Based Screen Maps

#### SUPERADMIN Mobile Flow
```
Home (Platform Overview)
  ├── Header: Gold crown badge + "Platform Overview" + LIVE dot
  ├── Quick Stat Strip: Total Orgs | Active Leads (all orgs) | Platform AUM | Active Users
  ├── Platform Funnel Chart (area chart, 30-day, stacked by org)
  ├── Alert Feed: Platform events (new org, system errors, quota warnings)
  └── Quick CTA row: [+ New Org] [Manage Users]

Tab 2: Organizations
  ├── Search/filter bar
  ├── Org cards: org name, owner name, lead count, AUM, status badge
  └── Org Detail → members list, recent leads, settings shortcuts

Tab 3: Admin Panel
  ├── User management (paginated table, mobile-adapted)
  ├── Invite owner flow (bottom sheet form)
  └── System settings (grouped list)

More Drawer:
  ├── Analytics (cross-org charts, stacked vertically)
  ├── System Config
  ├── Notifications
  └── Profile
```

#### OWNER Mobile Flow
```
Home (CRM Dashboard)
  ├── Header: Crimson diamond badge + "Dashboard" + LIVE dot
  ├── Quick Stat Strip: New Leads | Registered | FTD | AUM
  ├── 7-day Funnel Line Chart (scrollable)
  ├── Recent Leads section (3 lead cards, "View All →")
  └── Pending Verification CTA banner (if count > 0): crimson banner, "N leads need review →"

Tab 2: Leads
  ├── Search bar + filter chips (NEW | REGISTERED | DEPOSITED | ALL)
  ├── FAB: + New Lead
  └── Lead cards (infinite scroll)

Tab 3: Verify
  ├── "N Pending" count header
  ├── Swipe cards stack (front card is active, next card peeking behind)
  ├── Swipe right → Approve | Swipe left → Reject
  └── "Done today: N approved, N rejected" stats row

More Drawer:
  ├── Analytics
  ├── Settings (bot config, KB, commands, team, sessions)
  ├── Notifications
  └── Profile
```

#### ADMIN Mobile Flow
Same as OWNER except:
- Settings in More: bot config + KB only (no team management, no billing)
- Analytics: visible, read-only
- Admin Panel tab: hidden (3-tab version: Home | Leads | Verify | More)

#### STAFF Mobile Flow
```
Home (My Tasks)
  ├── Header: Muted circle badge + "Good morning, {name}" personalized
  ├── Quick Stat Strip: My Leads Today | Pending Verifications
  ├── Assigned Leads (today's new assignments, up to 5)
  └── Quick Action row: [+ Submit Deposit] [View Verification Queue]

Tab 2: Leads (assigned to me only, or all depending on config)
Tab 3: Verify (pending queue)

More Drawer:
  ├── Notifications
  └── Profile
  (No Analytics, No Settings)
```

---

### 11E. New Mobile Pages Inventory

| # | Route | Role Access | Description |
|---|---|---|---|
| M01 | Shell wrapper | All | Bottom tab bar + header + safe area |
| M02 | `/` (SUPERADMIN) | SUPERADMIN | Platform overview home |
| M03 | `/` (OWNER/ADMIN) | OWNER, ADMIN | CRM dashboard home |
| M04 | `/` (STAFF) | STAFF | My tasks / quick actions |
| M05 | `/leads` | All | Lead list with filter chips + FAB |
| M06 | `/leads/[id]` | All | Lead detail (bottom sheet stack) |
| M07 | `/verification` | All | Swipe card verification queue |
| M08 | `/analytics` | SUPERADMIN, OWNER, ADMIN | Vertically stacked charts |
| M09 | More drawer | All | Role-adaptive menu sheet |
| M10 | `/settings` | OWNER, ADMIN | Grouped settings list |
| M11 | `/notifications` | All | Chronological notification feed |
| M12 | `/profile` | All | User profile & account settings |

---

### 11F. Safe Area & Viewport Rules

```css
/* Mobile shell content area */
padding-top: env(safe-area-inset-top);       /* notch / Dynamic Island */
padding-bottom: env(safe-area-inset-bottom); /* home indicator */

/* Bottom tab bar */
height: calc(56px + env(safe-area-inset-bottom));
padding-bottom: env(safe-area-inset-bottom);

/* Scrollable content */
margin-bottom: calc(56px + env(safe-area-inset-bottom) + 16px);

/* FAB position */
bottom: calc(56px + env(safe-area-inset-bottom) + 20px);
```

Reference device: iPhone 14 Pro (390×844px, notch height 59px, home indicator 34px).

---

### 11G. Mobile Animation Principles

All mobile animations use **spring physics** (GSAP already installed), not CSS ease curves:

| Animation | Spring Config |
|---|---|
| Card enter | translateY(20px)→0, opacity 0→1, stiffness 300, damping 24 |
| Bottom sheet open | translateY(100%)→0, stiffness 400, damping 30 |
| Tab switch | icon scale(0.95)→1.05→1 with spring overshoot |
| Swipe card return | spring-back, stiffness 500, damping 35 |
| Swipe card dismiss | momentum release, stiffness 200, damping 20 |
| FAB expand | mini-buttons scale(0)→scale(1) staggered 50ms |
| Pull-to-refresh | spinner rotation continuous 360°, 0.8s/rev |

Never use `transition: all` on mobile — always target specific properties.

---

### 11H. Notification System Design

#### Notification Types (by role)
| Type | Icon | Color | Who Receives |
|---|---|---|---|
| New Lead registered | UserPlus | `#60A5FA` blue | OWNER, ADMIN, STAFF (assigned) |
| Deposit reported | CurrencyDollar | `#F59E0B` amber | OWNER, ADMIN |
| Deposit verified | CheckCircle | `#22D3A0` green | OWNER, ADMIN, STAFF (lead's assignee) |
| Deposit rejected | XCircle | `#EF4444` red | OWNER, ADMIN |
| New team member | Users | `#8888AA` muted | OWNER |
| System alert | Warning | `#EF4444` red | SUPERADMIN only |
| KB processing done | Database | `#60A5FA` | OWNER, ADMIN |

#### `/notifications` Page Layout (Mobile)
- **Header:** "Notifications" Syne 700 20px + "Mark all read" ghost button right-aligned
- **Filter chips:** All | Leads | Verifications | System (horizontal scroll)
- **Notification items:** Full-width rows:
  - Left: colored icon circle (24px, tinted bg)
  - Center: Title DM Sans 600 14px `#F0F0FF` + Body DM Sans 400 13px `#8888AA` (1-line truncated)
  - Right: Relative timestamp JetBrains Mono 11px `#555570`
  - Unread: left 3px `#C4232D` accent bar + slightly lighter bg `#1C1C2E`
  - Read: standard `#141422` bg
- **Empty state:** Bell icon with "All caught up" DM Sans 400 14px `#555570`

---

## 12. Flat Panel Pattern (Light & Dark Mode Friendly)

This is the canonical pattern for all page sections, replacing `<Card>` and `.surface-card` components which have borders and theme-specific shadows.

### Core Rule

> No borders, no left-color stripes. Every surface is a flat `bg-elevated` div with a `bg-card` header strip for 2-tone depth.

### Panel Anatomy

```jsx
<div className="bg-elevated rounded-xl overflow-hidden">
  {/* Header strip — creates 2-tone depth */}
  <div className="px-5 py-4 bg-card rounded-t-xl flex items-center justify-between">
    <h3 className="font-sans font-semibold text-[14px] text-text-primary">Section Title</h3>
    {/* optional action */}
  </div>
  {/* Body */}
  <div className="px-5 pb-5 pt-4">
    {/* content */}
  </div>
</div>
```

### Why it Works in Both Modes

| Mode | `--elevated` | `--card` | Effect |
|---|---|---|---|
| **Dark** | `#1c1c2e` | `#141422` | Header strip is *darker* than body → recessed feel |
| **Light** | `#F5F5FC` | `#FFFFFF` | Header strip is *lighter* (white) than body → raised feel |

The visual relationship inverts naturally between modes — both look intentional.

### KPI Tile Gradient

Use `color-mix()` with CSS variables for accent gradients so they adapt to the theme:

```ts
// ✅ Theme-adaptive (light AND dark mode correct)
grad: "color-mix(in srgb, var(--color-gold) 9%, transparent)"

// ❌ Hardcoded dark-mode hex (breaks in light mode)
grad: "rgba(232,185,79,0.09)"
```

Applied as a `backgroundImage`:
```tsx
style={{ backgroundImage: `linear-gradient(135deg, ${grad} 0%, transparent 65%)` }}
```

### Chart Tooltip Pattern

All recharts tooltips must use CSS variables, not hardcoded dark hex:

```tsx
<div style={{
  background: "var(--elevated)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 12,
  padding: "10px 14px",
}}>
  <p style={{ color: "var(--text-muted)", fontSize: 11 }}>{label}</p>
  <span style={{ color: "var(--text-primary)" }}>{value}</span>
</div>
```

### Chart Axis Ticks

```tsx
tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "inherit" }}
```

### Icon Container (no border)

```tsx
// ✅ Uses overlay bg — no border needed
<div className="w-10 h-10 rounded-xl flex items-center justify-center bg-overlay">
  <Icon className="text-text-secondary" />
</div>

// ❌ Avoid — has border
<div className="bg-elevated border border-border-default">
```

### Inline Color References — Forbidden List

| Bad (hardcoded dark) | Good (CSS var) |
|---|---|
| `rgba(255,255,255,0.35)` | `var(--text-muted)` |
| `rgba(255,255,255,0.55)` | `var(--text-secondary)` |
| `#fff` / `text-white` | `var(--text-primary)` |
| `#0e0e1a` / `#0f0f1c` | `var(--elevated)` |
| `#2a2a42` | `var(--border-subtle)` |
| `rgba(232,185,79,0.09)` | `color-mix(in srgb, var(--color-gold) 9%, transparent)` |
| `rgba(196,35,45,0.12)` | `color-mix(in srgb, var(--color-crimson) 12%, transparent)` |


Accessible via avatar tap in header or More drawer.

#### Layout (Mobile, Full Screen)
- **Top section:** Avatar circle 72px (initials fallback) + name Syne 700 20px + role badge chip
- **Settings sections** (grouped list, iOS-style):
  - **Account:** Change password | Active sessions | Language
  - **Notifications:** Per-type toggle switches
  - **Appearance:** Theme (dark/light system/light)
  - **Danger Zone:** Logout button (crimson, full-width)
- Each row: icon left + label + chevron right (or toggle)
- Row height: 52px minimum (thumb-friendly)
- Section headers: DM Sans 600 11px `#555570` uppercase, 16px padding
