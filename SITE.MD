# Titan Journal CRM — Site Roadmap & Sitemap
> **Version 2.0 — Enterprise Dark Command Center**

---

## 1. Site Vision

**Titan Journal CRM** is a premium, enterprise-grade system for managing a trading-focused IB (Introducing Broker) customer funnel. It features:
- **Admin Dashboard**: Real-time analytics, lead pipeline, AI-powered Telegram bot control, team management
- **Telegram Mini App (TMA)**: Seamless mobile-first registration, deposit proof upload, and status tracking

**Design Theme:** Dark Obsidian Command Center — `#080810` void black + `#C4232D` crimson + `#E8B94F` gold
**TMA Theme:** Light mode, pure white, Telegram-native feel

---

## 2. Global Elements

### Admin Portal
- **Theme**: Dark mode primary — `#080810` page bg, `#141422` cards, `#C4232D` brand
- **Navigation**: 240px fixed left sidebar with collapse to 68px icon-only
- **Sidebar sections**: Command Center | Lead Intelligence | Verification Queue | Settings
- **Header bar**: Page title + date range + Refresh + pulsing LIVE indicator
- **Typography**: Syne (display) + DM Sans (body) + JetBrains Mono (data/IDs)

### TMA (Telegram Mini App)
- **Theme**: Light mode — `#FFFFFF` bg, `#9A1B22` brand
- **Navigation**: None (single-screen flows, back button)
- **Typography**: Same stack, larger touch targets

---

## 3. Backend Data Models Reference

| Model | Key Fields | Used On Pages |
|---|---|---|
| `Lead` | status, hfmBrokerId, depositBalance, registeredAt, verifiedAt, handoverMode | /leads, /leads/:id, /verification |
| `Interaction` | type (MESSAGE_RECEIVED/AUTO_REPLY_SENT/MANUAL_REPLY_SENT/SYSTEM_STATUS_CHANGE) | /leads/:id |
| `Attachment` | fileUrl, mimeType, telegramFileId | /leads/:id, /verification |
| `KnowledgeBase` | type (TEXT/LINK/TEMPLATE), status (PENDING/PROCESSING/READY/FAILED) | /settings/knowledge-base |
| `CommandMenu` | command, label, content (Tiptap JSON), order | /settings/commands |
| `User` | role (SUPERADMIN/OWNER/ADMIN/STAFF), isActive | /settings/team |
| `Session` | deviceId, userAgent, ipAddress, lastActiveAt | /settings/sessions |
| `Invitation` | email, role, token, expiresAt | /settings/team |
| `DailyStats` | newLeads, registeredLeads, depositReported, conversions, tokensUsed | / (dashboard) |

---

## 4. Complete Sitemap

### Admin Portal (`/`)

| Status | Route | Page Name | Description | API Endpoints |
|---|---|---|---|---|
| `[x]` | `/login` | Authentication | Login (email/password + Telegram TMA) | POST /auth/login, POST /auth/tma-login |
| `[ ]` | `/forgot-password` | Forgot Password | Password reset flow | POST /auth/forgot-password |
| `[ ]` | `/reset-password` | Reset Password | New password form (from email link) | POST /auth/reset-password |
| `[ ]` | `/setup-account` | Account Setup | First-time setup for invited users (from Telegram deep link) | POST /auth/setup-account |
| `[x]` | `/` | Command Center | Main dashboard — KPI cards, charts, live activity feed, funnel visualization | GET /analytics/dashboard, GET /analytics/weekly, GET /analytics/monthly |
| `[x]` | `/leads` | Lead Intelligence | CRM lead table — search, filter by status, paginated | GET /leads?status&skip&take |
| `[x]` | `/leads/:id` | Lead Detail | Lead profile, interaction timeline, chat handover interface, attachments viewer | GET /leads/:id, PATCH /leads/:id/handover, PATCH /leads/:id/verify, GET /attachments |
| `[x]` | `/verification` | Verification Queue | Pending deposit proof cards — Approve / Reject / Ask More | GET /leads?status=DEPOSIT_REPORTED, PATCH /leads/:id/verify |
| `[x]` | `/settings` | Settings Hub | Bot configuration, scripts, TMA URL, AI persona toggles | (config stored locally + PATCH endpoints) |
| `[ ]` | `/settings/knowledge-base` | Knowledge Base | KB entry cards — add text/file/link, toggle active, view processing status | GET /knowledge-base, POST /knowledge-base/text, POST /knowledge-base/upload, PATCH /knowledge-base/:id, DELETE /knowledge-base/:id |
| `[ ]` | `/settings/commands` | Command Menu | Telegram bot command list, drag-to-reorder, rich content editor | GET /command-menu, POST /command-menu, PATCH /command-menu/reorder, PATCH /command-menu/:id |
| `[ ]` | `/settings/team` | Team Management | User list, role management, invite system, deactivation | GET /users, PATCH /users/:id/role, POST /users/invite, GET /users/invitations |
| `[ ]` | `/settings/sessions` | Active Sessions | List + revoke JWT sessions | GET /auth/sessions, DELETE /auth/sessions/:sessionId, DELETE /auth/sessions |

### Telegram Mini App (`/tma`)

| Status | Route | Page Name | Description | API Endpoints |
|---|---|---|---|---|
| `[x]` | `/tma/register` | TMA Registration | Mobile form — HFM Broker ID + Email + Phone | POST /leads/submit-info, POST /auth/tma-login |
| `[ ]` | `/tma/deposit` | TMA Deposit Upload | Upload deposit proof (photo/video/PDF) + amount | POST /attachments (via TMA) |
| `[ ]` | `/tma/status` | TMA Verification Status | Current status card (Pending/Confirmed/Rejected) + timeline | GET /leads/:id (by Telegram ID) |

---

## 5. Role-Based Access Matrix

| Page | SUPERADMIN | OWNER | ADMIN | STAFF |
|---|---|---|---|---|
| `/` Dashboard | ✅ Full | ✅ Full | ✅ Read | ❌ |
| `/leads` | ✅ | ✅ | ✅ | ✅ Read |
| `/leads/:id` | ✅ | ✅ | ✅ | ✅ Read + Handover |
| `/verification` | ✅ | ✅ | ✅ | ❌ |
| `/settings/*` | ✅ | ✅ | ❌ | ❌ |
| `/settings/team` | ✅ | ✅ Invite only | ❌ | ❌ |

---

## 6. Visual Asset Integration (Whisk / Veo)

| Asset | Type | Placement | Prompt Reference |
|---|---|---|---|
| Dashboard Hero BG | Static Image (1920×400) | Behind KPI row, faded overlay | DESIGN.md §9A |
| Login Left Panel BG | Static Image (960×1080) | Left 55% of login split | DESIGN.md §9B |
| Dashboard Animated BG | Video Loop (1920×540, 10s) | `<video autoplay loop muted>` behind hero | DESIGN.md §9C |
| Verification Page Texture | Static Image (1920×1080, low opacity) | Page background layer | DESIGN.md §9D |
| TMA Mobile BG | Static Image (390×844) | TMA screen bg gradient | DESIGN.md §9E |
| TMA Confirmed State BG | Static Image (portrait) | Success card backdrop | DESIGN.md §9F |

---

## 7. Pages Already Scaffolded (`[x]`)

The following pages have been scaffolded in the Next.js app:
- `/login` — Auth flow (route group `(auth)`)
- `/` — Dashboard page with KPI cards + Tremor chart + Live Activity table
- `/leads` — Lead table page
- `/verification` — Verification queue page
- `/tma/register` — TMA registration form

---

## 8. Next Build Phase

Priority order for remaining pages:

1. **`/leads/:id`** — Most critical for daily operations (chat handover, attachment viewer)
2. **`/settings/knowledge-base`** — Bot intelligence management
3. **`/settings/commands`** — Telegram menu control
4. **`/settings/team`** — User/invite management
5. **`/tma/deposit`** — Deposit flow completion
6. **`/tma/status`** — User self-service verification check
7. **`/settings/sessions`** — Security feature
8. **`/forgot-password` + `/reset-password`** — Auth completion
9. **`/setup-account`** — Invite flow completion

---

## 9. Creative Direction Notes

- **Real-time live feed**: Use polling or WebSocket to fetch new leads every 30s on the dashboard. New rows should slide in from the top of the Live Activity table with a fade animation.
- **Handover toggle UX**: This is a critical safety control. When toggled ON (human mode), flash the row crimson and show a toast "Bot paused for Ahmed Faris. You are now in control."
- **Verification media lightbox**: Clicking a receipt thumbnail should open a full-screen lightbox with zoom capability. Video receipts should be playable inline.
- **KPI count-up animation**: On dashboard load, all KPI numbers count up from 0 using `requestAnimationFrame` with easeOutExpo. Takes ~1 second.
- **Bot config script editor**: Consider a preview panel showing how the message will look in Telegram (dark chat bubble).
- **Command menu tiptap editor**: The content field should use Tiptap and render a live Telegram-style preview panel alongside the editor.
- **Session IP geolocation badge**: Consider adding a flag emoji based on IP country code to the Sessions page for quick anomaly detection.
