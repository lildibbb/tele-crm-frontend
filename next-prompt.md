# Titan Journal CRM — Stitch MCP Wireframe Prompts
> **For Antigravity → Stitch MCP:** Use each section below as a self-contained prompt.
> All prompts reference the full design system in `DESIGN.md`.
> Theme: Dark Obsidian Command Center. Fonts: Syne + DM Sans + JetBrains Mono.

---

## GLOBAL DESIGN SYSTEM (embed in every Stitch prompt)

```
GLOBAL STYLE RULES (apply to ALL pages):
- Framework: Next.js + Tailwind CSS + shadcn/ui
- Primary theme: DARK MODE
- Page background: #080810 (deep space black)
- Card surfaces: #141422 with 1px solid #2A2A42 border
- Elevated surfaces: #1C1C2E
- Brand color: #C4232D (crimson red)
- Gold accent: #E8B94F (deposit balances, VIP indicators)
- Text primary: #F0F0FF | Text secondary: #8888AA | Muted: #555570
- Success: #22D3A0 | Warning: #F59E0B | Danger: #EF4444 | Info: #60A5FA
- Display font: Syne (700, 800) — page titles, KPI numbers
- Body font: DM Sans (400, 500, 600) — all UI text
- Data font: JetBrains Mono (400, 500) — IDs, timestamps, balances
- Buttons: #C4232D fill, white text, 10px radius; hover adds crimson glow
- Status badges: pill shape (9999px radius), 10% opacity background tint
- Cards: 14px border radius, no harsh shadows — use subtle diffused glow
- Admin layout: 240px fixed left sidebar + full-height main content
- TMA layout: full-screen mobile (390px), pure white (#FFFFFF) background
- Live indicator: animated pulsing red dot with "LIVE" label in all dashboard headers
- All Telegram IDs, Lead IDs, Session IDs: JetBrains Mono 13px
```

---

## PAGE 1: `/login` — Authentication Screen

```
STITCH PROMPT — PAGE: /login (Authentication)

Design a full-screen split-layout login page for Titan Journal CRM enterprise dashboard.

LAYOUT: Two-panel horizontal split.
- LEFT PANEL (55% width): Full-bleed cinematic dark background visual.
  - Place a large rectangular placeholder labeled "[FLOW VISUAL — LOGIN BG: dark obsidian cinematic, crimson light source, floating crystalline shards, particle field]"
  - Overlay: "TITAN JOURNAL" logo in Syne 800 white, uppercase, top-left corner
  - Overlay: Brand tagline "IB Funnel Intelligence Platform" in DM Sans 400 #8888AA, below logo
  - Overlay: Three social proof stats at bottom: "1,284 Leads • 856 Registered • $425K AUM" in JetBrains Mono white
  - Bottom: subtle crimson gradient fade to black

- RIGHT PANEL (45% width): Dark auth card centered vertically, #141422 bg
  - Top: Small Titan Journal crimson shield icon + "TITAN JOURNAL" in Syne 700 #F0F0FF
  - Heading: "Welcome back" in Syne 700 32px #F0F0FF
  - Subtext: "Sign in to your command center" in DM Sans 400 14px #8888AA
  - Divider line #2A2A42
  - Form:
    - Email field (label: "Email Address", placeholder: "owner@titanjournal.com")
    - Password field (label: "Password", with show/hide eye icon)
    - Row: "Forgot password?" link right-aligned in #C4232D
    - Full-width "Sign In" button in #C4232D, white text, DM Sans 600, 14px radius
  - Divider with "or continue with"
  - Full-width Telegram Login button (blue #2AABEE, Telegram logo icon)
  - Bottom: "Need access? Contact your administrator." in DM Sans 400 12px #555570

GLOBAL STYLE RULES APPLY.
```

---

## PAGE 2: `/` — Main Dashboard (The Tally / Command Center)

```
STITCH PROMPT — PAGE: / (Main Dashboard)

Design the primary admin dashboard for Titan Journal CRM — "The Tally / Command Center".

LAYOUT: Persistent left sidebar (240px, #0E0E1A) + main content area.

SIDEBAR (left, full height):
- Top: "TITAN" in Syne 800 white + "JOURNAL" with "CRM" in crimson #C4232D, 16px
- Navigation items (DM Sans 500 14px, active = crimson left bar + #C4232D subtle bg):
  - 📊 Command Center (active)
  - 👥 Lead Intelligence
  - ✅ Verification Queue
  - ⚙️ Settings
- Bottom: User avatar circle + "Owner" role badge in crimson + logout icon

MAIN CONTENT:
- Top bar: "Command Center" in Syne 700 28px #F0F0FF + date range selector + "Refresh" icon + pulsing red LIVE dot with "LIVE" label in crimson
- Background: Place placeholder "[FLOW VISUAL ASSET — DASHBOARD HERO BG: dark data streams]" behind KPI row (full width, fixed, faded)

ROW 1 — KPI Cards (4 columns, equal width, #141422 bg, #2A2A42 border):
  Card 1: Icon (Users, crimson tint circle) | "Total New Leads" DM Sans 14px #8888AA | "1,284" Syne 800 36px #F0F0FF | "+19% from last month" #22D3A0 12px
  Card 2: Icon (UserPlus) | "Registered Accounts" | "856" | "+7% this week" green
  Card 3: Icon (CreditCard, gold tint) | "Depositing Clients (FTD)" | "432" Syne 800 gold #E8B94F | "+2% yesterday" green
  Card 4: Icon (TrendingUp, gold) | "Total AUM Balance" | "$425,000" Syne 800 gold | "+20.1% month" green
  Each card: left-border 3px crimson on Card 3 and 4 to indicate financial importance

ROW 2 — 7/5 grid:
  LEFT (7 col) — Performance Chart Card (#141422):
    Title: "IB Funnel Metrics" DM Sans 600 16px
    Subtitle: "Lead acquisition & conversion — last 30 days" #8888AA
    Area/Line chart: two lines — "Total Leads" (#C4232D) and "Registered" (#22D3A0)
    X-axis: dates. Y-axis: counts
  RIGHT (5 col) — Live Activity Feed Card (#141422):
    Header: "Live Activity" + pulsing dot "LIVE" crimson badge
    Mini-table: Lead name | Status badge | Amount | Time (mono)
    4-5 rows visible. New rows slide in from top.
    Bottom: "View all leads →" crimson link

ROW 3 — 6/6 grid:
  LEFT — Conversion Funnel Card:
    Horizontal funnel bar chart: NEW → CONTACTED → REGISTERED → DEPOSIT_REPORTED → DEPOSIT_CONFIRMED
    Each stage different width showing drop-off. Labels with counts.
  RIGHT — Weekly Performance Bar Chart:
    Grouped bar chart: last 8 weeks, bars for New Leads + Registered + Deposits side by side
    Colors: crimson, #22D3A0, gold

BOTTOM ACTION STRIP: Two cards side by side:
  "⏳ 12 Pending Verifications" amber card with "Review Now →" CTA
  "🤝 3 Leads in Handover Mode" blue card with "View Leads →" CTA

GLOBAL STYLE RULES APPLY.
```

---

## PAGE 3: `/leads` — CRM Lead Portal

```
STITCH PROMPT — PAGE: /leads (CRM Lead Intelligence Portal)

Design the Lead Management data table page for Titan Journal CRM.

LAYOUT: Same sidebar as dashboard + main content.

MAIN CONTENT:
- Header row: "Lead Intelligence" Syne 700 28px + search bar (DM Sans, #1C1C2E bg, #2A2A42 border, search icon) + "Export CSV" ghost button + "+ Import" ghost button
- Filter tabs (DM Sans 500 14px, active = crimson underline, inactive = #555570):
  All Leads (1,284) | NEW (342) | Registered (856) | Proof Pending (76) | Confirmed (432)
- Sub-header row: "Showing 1-20 of 1,284 leads" #8888AA + date range picker + status filter dropdown

LEADS DATA TABLE (full width, #141422 bg):
  COLUMNS (header: DM Sans 500 12px uppercase #8888AA, #1C1C2E bg):
    □ (checkbox) | Lead | Telegram ID | HFM Broker ID | Phone | Status | Registered | Balance | Handover | Actions

  DATA ROW EXAMPLE 1:
    □ | [Avatar circle "AF"] Ahmed Faris #F0F0FF DM Sans 500 | 123456789 JetBrains Mono #8888AA | HFM-88421 mono | +60123456789 mono | [REGISTERED badge: #A855F7 10% bg, #A855F7 text] | Jan 15, 2026 mono | $500 gold #E8B94F DM Sans 600 | [Bot Active toggle: red OFF] | [Eye icon] [Edit icon]

  DATA ROW EXAMPLE 2:
    □ | Sara Mahmoud | 987654321 | HFM-77332 | +60198765432 | [PROOF PENDING badge: amber] | Jan 20, 2026 | $150 gold | [Human Active toggle: green ON] | [Eye] [Approve] [Chat]

  DATA ROW EXAMPLE 3:
    □ | Daniel K. | 555123000 | — | — | [NEW badge: blue] | — | — | [Bot Active] | [Eye]

  Show 5-6 rows. Hover state: row bg lightens to #1C1C2E.

PAGINATION (bottom): ← Prev | 1 2 3 ... 64 | Next → | "20 per page" dropdown

EMPTY STATE (when filtered to empty): Crimson icon + "No leads match this filter." DM Sans + "Clear filters" link

GLOBAL STYLE RULES APPLY.
```

---

## PAGE 4: `/leads/:id` — Lead Detail & Chat Handover

```
STITCH PROMPT — PAGE: /leads/:id (Lead Detail View)

Design the individual lead detail page for Titan Journal CRM. This is a split view.

LAYOUT: Same sidebar + main content in 8-column / 4-column grid split.

BREADCRUMB: "Lead Intelligence / Ahmed Faris" in DM Sans 400 14px #8888AA

LEFT COLUMN (8 col):

  LEAD PROFILE CARD (#141422):
    - Large avatar circle "AF" in crimson bg, 56px
    - "Ahmed Faris" Syne 700 24px #F0F0FF
    - [REGISTERED badge] + [Bot Active badge: crimson pill]
    - Row of data (JetBrains Mono 13px):
      Telegram ID: 123456789 | HFM ID: HFM-88421
      Email: ahmed@gmail.com | Phone: +60123456789
    - "Registered: Jan 15, 2026" | "Verified: Jan 18, 2026" (if verified)
    - Deposit Balance: "$500.00" gold DM Sans 600 20px

  ACTION BUTTONS ROW:
    [✅ Verify Deposit] crimson button | [✏️ Edit Info] secondary | [🔗 Copy Invite Link] ghost | [🚫 Reject] danger

  ATTACHMENTS SECTION (below profile card):
    "Uploaded Proof" heading DM Sans 600
    Grid of 2-3 thumbnail cards: image/video thumbnail + filename + uploaded time + "View Full" link
    Video attachments show play button overlay

  STATUS TIMELINE (below attachments):
    "Interaction History" heading
    Vertical timeline (left dot + line):
      ● Jan 20 14:32 — [AUTO_REPLY_SENT] "Bot sent welcome message" — DM Sans 400 14px
      ● Jan 20 14:35 — [MESSAGE_RECEIVED] "User: Hi, how do I register?" — bubble preview
      ● Jan 20 15:00 — [SYSTEM_STATUS_CHANGE] "Status changed to REGISTERED" — #22D3A0
      ● Jan 21 09:12 — [MANUAL_REPLY_SENT] "Agent: Your account has been..." — crimson dot

RIGHT COLUMN (4 col, full height) — CHAT PANEL (#141422, border-left #2A2A42):

  HANDOVER CONTROL (top of panel):
    "Bot Control" DM Sans 600 14px #8888AA
    Large toggle with label:
      OFF state: "🤖 Bot Active" green background
      ON state: "👤 Human Takeover" crimson background
    Subtext: "Pause bot to reply manually" #555570 12px

  CHAT MESSAGES (scrollable, flex-grow):
    Bot message (left): #1C1C2E bubble, "👋 Welcome to Titan Journal CRM!..." DM Sans 14px
    User message (right): #C4232D 15% bg bubble, "Hi, I want to register" DM Sans 14px
    System event (center): italic, #555570, small — "Status changed to REGISTERED"
    Timestamps: JetBrains Mono 11px #555570 below each bubble

  REPLY INPUT (bottom, docked):
    Text area placeholder "Type a message to Ahmed..." #1C1C2E bg
    Right: Send button (paper plane icon, #C4232D bg)
    Below: "Replies are sent via Telegram bot" #555570 11px

GLOBAL STYLE RULES APPLY.
```

---

## PAGE 5: `/verification` — Deposit Verification Queue

```
STITCH PROMPT — PAGE: /verification (Deposit Verification Queue)

Design the verification management queue for Titan Journal CRM admin.

LAYOUT: Same sidebar + main content.

MAIN CONTENT:
- Header: "Verification Queue" Syne 700 28px + amber badge "76 Pending" (#F59E0B 15% bg)
- Filter tabs: Pending (76) | All Submissions | Approved | Rejected
- Background: Place placeholder "[FLOW VISUAL — VERIFICATION BG: subtle dark grid texture, amber glow horizon]" as very low opacity page texture

VERIFICATION CARDS GRID (2-column on desktop, 1 on mobile):

  CARD EXAMPLE 1 (Pending — amber accent):
    Header: [DEPOSIT_REPORTED badge amber] + "Ahmed Faris" DM Sans 600 + "Submitted 2 hours ago" JetBrains Mono #8888AA
    Body: Receipt thumbnail (large, rounded-lg, clickable → lightbox) showing receipt image placeholder
    Data row: "Amount: $500.00" gold DM Sans 600 | "HFM ID: HFM-88421" mono | Telegram ID mono
    Action row (3 buttons, full width):
      [✅ Approve] #22D3A0 bg, dark text | [❌ Reject] #EF4444 bg, white | [💬 Ask More] #1C1C2E bg, white
    Hover: card lifts with crimson glow shadow

  CARD EXAMPLE 2 (Pending):
    Similar structure, different lead, video receipt (shows video thumbnail with play icon)
    Amount: $1,200. "Submitted 4 hours ago"

  CARD EXAMPLE 3 (Approved — success accent, dimmed):
    Green left-border. "✓ Approved Jan 20" label. Actions grayed out.

APPROVAL CONFIRMATION MODAL (shown when Approve is clicked):
  #1C1C2E card, radius-xl
  "Confirm Verification" Syne 700 20px
  "Mark Ahmed Faris's deposit of $500.00 as verified?"
  Two buttons: [Cancel] secondary, [Confirm & Approve] #22D3A0

GLOBAL STYLE RULES APPLY.
```

---

## PAGE 6: `/settings` — Settings Hub (Bot Configuration)

```
STITCH PROMPT — PAGE: /settings (Settings Hub — Bot Configuration)

Design the settings page for Titan Journal CRM, default showing Bot Configuration.

LAYOUT: Sidebar + horizontal sub-navigation tabs + main settings content.

SUB-NAVIGATION TABS (below page header, horizontal tab row, DM Sans 500 14px):
  [Bot Config (active)] | [Knowledge Base] | [Command Menu] | [Team] | [Sessions]
  Active: crimson underline + #F0F0FF text. Inactive: #8888AA.

MAIN CONTENT (Bot Config):
  Header: "Bot Configuration" Syne 700 24px + "Manage your Telegram bot's behavior and scripts" #8888AA

  SECTION: AI Persona Settings (#141422 card):
    "AI Persona" DM Sans 600 16px #F0F0FF
    Toggle: "Enable AI Auto-Reply" with description "Bot responds automatically using knowledge base"
    Toggle: "Natural Language Mode" — uses AI for conversational responses
    Input: "Bot Display Name" — "Titan Journal CRM"
    Input: "TMA Registration URL" — "https://app.titanjournal.com/tma/register"

  SECTION: Script Templates (#141422 card):
    "Message Scripts" DM Sans 600 16px
    Tab pills: [Welcome Message] [Follow-up 1] [Follow-up 2] [Deposit Prompt]
    Textarea (active = Welcome): Large textarea showing "👋 Welcome to Titan Journal CRM!..." with #1C1C2E bg
    Character count: "287 / 4096" JetBrains Mono #555570
    [Save Script] crimson button

  SECTION: Notification Settings (#141422 card):
    "Admin Notifications" DM Sans 600 16px
    Toggle: "Notify when new lead arrives"
    Toggle: "Notify when deposit proof submitted"
    Input: "Admin Telegram Chat ID" JetBrains Mono field

GLOBAL STYLE RULES APPLY.
```

---

## PAGE 7: `/settings/knowledge-base` — Knowledge Base Manager

```
STITCH PROMPT — PAGE: /settings/knowledge-base (Knowledge Base Manager)

Design the Knowledge Base management page for Titan Journal CRM.

LAYOUT: Sidebar + settings sub-nav (Knowledge Base tab active) + main content.

MAIN CONTENT:
  Header: "Knowledge Base" Syne 700 24px + "+ Add Content" crimson button (right)
  Subtext: "Templates, guides, and links the bot uses to answer questions" #8888AA
  Filter chips (pill-shaped, DM Sans 500 13px): [All] [Text] [Link] [Template] [PDF] [Video Link]

KB ENTRY CARDS LIST (vertical, full width, each card = #141422):

  CARD 1: [READY badge: #22D3A0] [TEMPLATE type badge: purple]
    "HFM Registration Tutorial" DM Sans 600 16px #F0F0FF
    Preview: "Step 1: Visit hfm.com/register... Step 2: Fill in your details..." #8888AA 14px
    Footer row: "Created Jan 15" mono | [Active toggle: ON, green] | [✏️ Edit] [🗑️ Delete] icons

  CARD 2: [READY badge] [LINK type badge: blue]
    "Registration Video Guide (Google Drive)"
    "https://drive.google.com/..." mono truncated
    Footer: "Updated Jan 20" | Active toggle ON | Edit/Delete

  CARD 3: [PROCESSING badge: amber spinner] [PDF type badge]
    "HFM IB Terms & Conditions.pdf"
    "⏳ Processing... Embedding document for AI search" #F59E0B italic
    Footer: Active toggle grayed out (disabled while processing)

  CARD 4: [FAILED badge: red] [PDF type badge]
    "Old_Guide_2024.pdf"
    "❌ Processing failed. Please re-upload." #EF4444
    [Retry Upload] crimson small button

ADD CONTENT MODAL:
  "Add Knowledge Base Content" Syne 700 20px
  Tabs: [Text / Template] [Upload File] [Add Link]
  Active (Text): Title input + rich text editor (Tiptap-like with bold/italic/list toolbar)
  [Cancel] secondary | [Save Content] crimson

GLOBAL STYLE RULES APPLY.
```

---

## PAGE 8: `/settings/commands` — Telegram Command Menu Manager

```
STITCH PROMPT — PAGE: /settings/commands (Command Menu Manager)

Design the Telegram Command Menu configuration page for Titan Journal CRM.

LAYOUT: Sidebar + settings sub-nav (Command Menu tab active) + main content.

MAIN CONTENT:
  Header: "Telegram Command Menu" Syne 700 24px + "+ Add Command" crimson button
  Subtext: "Drag to reorder how commands appear in the Telegram bot menu" #8888AA
  "Changes sync to Telegram automatically on save" info banner: #60A5FA 10% bg, blue text, info icon

DRAG & DROP COMMAND LIST (#141422 container with drag handle rows):

  ROW 1 (draggable):
    [⠿ drag handle #555570] | "1" mono | /register #C4232D DM Sans 500 | "Register Account" DM Sans #F0F0FF | "Opens TMA registration form" #8888AA 13px | [Active toggle: ON] | [✏️ Edit] [🗑️ Delete]

  ROW 2:
    [⠿] | "2" | /deposit | "Report Deposit" | "Upload proof of transfer" | ON | Edit/Delete

  ROW 3:
    [⠿] | "3" | /guidelines | "Guidelines & Tutorials" | "View learning resources" | ON | Edit/Delete

  ROW 4 (inactive):
    [⠿] | "4" | /status | "Check My Status" | "View account verification status" | [OFF: gray toggle] | Edit/Delete

  ADD COMMAND DRAWER (slide-out from right, 480px):
    "New Command" Syne 700 20px | X close
    "Command Slug" input (/command format, JetBrains Mono)
    "Button Label" input (shown in Telegram)
    "Description" input (internal notes)
    "Content" Tiptap rich editor (what bot sends when command triggered)
      Toolbar: Bold | Italic | Link | Ordered List | Unordered List
      Preview: "How it will look in Telegram" toggle
    [Cancel] | [Save Command] crimson

SAVE ORDER STICKY FOOTER (appears when order changed):
  "Order changed. Save to sync with Telegram." | [Save Order] crimson

GLOBAL STYLE RULES APPLY.
```

---

## PAGE 9: `/settings/team` — Team Management

```
STITCH PROMPT — PAGE: /settings/team (Team Management)

Design the team/user management page for Titan Journal CRM.

LAYOUT: Sidebar + settings sub-nav (Team tab active) + main content.

MAIN CONTENT:
  Header: "Team Members" Syne 700 24px + "+ Invite Member" crimson button

  ACTIVE MEMBERS TABLE (#141422):
    Header row (DM Sans 500 12px uppercase #8888AA): Member | Role | Status | Last Login | Actions

    ROW 1 (current user):
      [Avatar "OW" gold bg] | "Ahmad Razali (You)" DM Sans 500 #F0F0FF + email #8888AA mono | [OWNER badge: gold #E8B94F bg] | [ACTIVE badge: green] | "Just now" JetBrains Mono | — (no actions on self)

    ROW 2:
      [Avatar "JK"] | "James Khoo" + james@titanjournal.com | [ADMIN badge: blue] | [ACTIVE] | "Jan 22, 09:14" mono | [Change Role ▾] [Deactivate] [Reset Password] icons

    ROW 3:
      [Avatar "SN"] | "Sarah Ng" + sarah@titanjournal.com | [STAFF badge: gray] | [ACTIVE] | "Jan 21, 14:30" mono | actions

    ROW 4 (deactivated):
      [Avatar "DL" grayed out] | "David Lim" dimmed | [STAFF badge: gray] | [INACTIVE badge: red] | "Jan 10, 11:00" | [Reactivate] green button

  PENDING INVITATIONS SECTION (below table):
    "Pending Invitations" DM Sans 600 16px
    Invitation row: Email (mono) + Role badge + "Expires in 2d 14h" amber countdown + [Revoke] danger ghost button
    Empty state: "No pending invitations"

  INVITE MEMBER MODAL:
    "Invite Team Member" Syne 700 20px
    Email input
    Role selector (ADMIN / STAFF pills — OWNER disabled with tooltip "Only one owner")
    Preview: "They'll receive a Telegram deep link to set up their account"
    [Cancel] | [Generate Invite Link] crimson
    Success state: Shows invite URL in mono field + [Copy Link] button

GLOBAL STYLE RULES APPLY.
```

---

## PAGE 10: `/settings/sessions` — Active Sessions

```
STITCH PROMPT — PAGE: /settings/sessions (Session Management)

Design the active sessions management page for Titan Journal CRM.

LAYOUT: Sidebar + settings sub-nav (Sessions tab active) + main content.

MAIN CONTENT:
  Header: "Active Sessions" Syne 700 24px
  Warning banner: "Revoke all other sessions if you believe your account has been compromised" — amber #F59E0B 10% bg, amber text, shield icon
  "Revoke All Other Sessions" danger button (right-aligned, #EF4444 outline)

  SESSION CARDS LIST:

    CARD 1 (current session — highlight):
      Left border: 3px #22D3A0 green
      "💻 Chrome on macOS" DM Sans 600 16px #F0F0FF + [CURRENT SESSION badge: green pill]
      "IP: 203.121.55.14" JetBrains Mono 13px #8888AA | "Device ID: dev_a9b3c7" mono
      "Last active: Just now" | "Created: Jan 15, 2026"
      Note: "This is your current session — cannot be revoked"

    CARD 2:
      "📱 Telegram TMA on iOS"
      IP: 112.53.22.87 mono | Device ID mono
      "Last active: Jan 20, 14:32" | Created Jan 18
      [Revoke] small danger button (right-aligned)

    CARD 3 (older, potentially suspicious — amber):
      Left border: amber
      "🖥️ Firefox on Windows"
      IP: 45.33.109.22 (different country) — annotated "(Different region ⚠️)" in amber
      "Last active: Jan 10, 08:20"
      [Revoke] danger button

CONFIRM REVOKE MODAL: "Revoke this session? The device will be signed out immediately." [Cancel] [Revoke Session] danger

GLOBAL STYLE RULES APPLY.
```

---

## PAGE 11: `/tma/register` — TMA Registration Form (Mobile)

```
STITCH PROMPT — PAGE: /tma/register (Telegram Mini App Registration)

Design a Telegram Mini App mobile registration form screen. This is a MOBILE layout (390px width).

THEME: LIGHT MODE. Pure white (#FFFFFF) background. This is a TMA screen — no sidebar, no dark mode.

LAYOUT: Full-screen mobile, top-to-bottom stack.

MOBILE SCREEN STRUCTURE:

  HEADER (centered, top 20px padding):
    Small Titan Journal shield icon in #9A1B22 (32px)
    "TITAN JOURNAL" Syne 700 18px #1A1A2E + "CRM" #9A1B22
    Thin divider line #E2E2F0

  HERO TEXT (padding: 24px):
    "Register Your Account" Syne 700 24px #1A1A2E
    "Provide your details below to complete your IB account registration." DM Sans 400 14px #5A5A7A
    Line height spacious.

  FORM (padding: 0 24px):
    Field 1: Label "HFM Broker ID" DM Sans 500 12px #5A5A7A | Input: placeholder "e.g. HFM-12345" | focus border: #9A1B22 | 48px height touch target
    Field 2: Label "Email Address" | Input: placeholder "your@email.com"
    Field 3: Label "Phone Number" | Input: placeholder "+60 12 345 6789" | prefix +60 flag
    Gap: 16px between fields

    Full-width button: "Submit Registration" | bg #9A1B22 | white text DM Sans 600 16px | 16px radius | 52px height

  FOOTER (centered, below button, padding: 20px):
    "Where can I find my HFM ID?" — underlined link in #9A1B22 DM Sans 400 13px
    "Having trouble? Contact support" #9A9AB0 12px

  BACKGROUND: Place "[FLOW VISUAL — TMA MOBILE BG: pure white, faint crimson gradient from top]" as page bg

  All touch targets minimum 48px. Keyboard-friendly layout. Large, legible type. Generous padding.

TMA STYLE OVERRIDES (light mode):
- Bg: #FFFFFF | Text: #1A1A2E | Secondary text: #5A5A7A | Brand: #9A1B22
- Input: #FFFFFF bg, #E2E2F0 border, #9A1B22 focus
- Button: #9A1B22 fill, white text
```

---

## PAGE 12: `/tma/deposit` — TMA Deposit Proof Upload (Mobile)

```
STITCH PROMPT — PAGE: /tma/deposit (Telegram Mini App Deposit Proof)

Design a Telegram Mini App deposit proof upload screen. MOBILE layout, LIGHT MODE.

MOBILE SCREEN (390px, white bg):

  HEADER: Same as /tma/register — Titan Journal logo centered

  HERO:
    "Report Your Deposit" Syne 700 24px #1A1A2E
    "Upload your transfer receipt or a screenshot of your HFM account balance." DM Sans 400 14px #5A5A7A

  DEPOSIT AMOUNT FIELD:
    Label: "Deposit Amount (USD)" DM Sans 500 12px
    Input with "$" prefix icon (gray) — "0.00" placeholder
    Large 48px touch target, JetBrains Mono 16px for the number value

  UPLOAD ZONE (large, prominent):
    Dashed border: 2px dashed #9A1B22 (crimson), 16px radius
    Height: 180px
    Center content:
      📎 icon 32px in #9A1B22
      "Tap to upload receipt or video" DM Sans 500 16px #1A1A2E
      "JPG, PNG, PDF, or MP4 supported" DM Sans 400 12px #9A9AB0
    Background: #9A1B22 at 3% opacity (very faint crimson tint)

  FILE PREVIEW STATE (after file selected):
    Thumbnail of receipt image (rounded-lg) + filename + filesize + [Remove ×] button

  SUBMIT BUTTON:
    Full-width "Submit Proof" #9A1B22 bg, white text, 52px height, 16px radius

  FOOTER: "Your proof will be reviewed within 24 hours." #9A9AB0 12px centered

TMA LIGHT MODE OVERRIDES APPLY.
```

---

## PAGE 13: `/tma/status` — TMA Verification Status (Mobile)

```
STITCH PROMPT — PAGE: /tma/status (Telegram Mini App Verification Status)

Design a Telegram Mini App verification status screen. MOBILE layout, LIGHT MODE.
This page shows 3 different states — design all 3 states stacked vertically (for review), or as tabs.

MOBILE SCREEN:

  HEADER: Titan Journal logo centered (same as other TMA pages)

  HEADING: "Account Status" Syne 700 24px #1A1A2E | "Track your registration & deposit verification" #5A5A7A

  === STATE 1: PENDING ===
  Status card (#FFFBEB bg — very light amber, border: #F59E0B 1px, 20px radius):
    Icon: ⏳ animated clock, 48px, amber #F59E0B
    Title: "Verification Pending" DM Sans 600 18px #1A1A2E
    Subtitle: "Submitted Jan 20, 2026 at 14:32" JetBrains Mono 13px #5A5A7A
    Progress bar: 60% width, amber fill, "Review in Progress"
    CTA ghost: "Contact Support" outline button

  === STATE 2: APPROVED / CONFIRMED ===
  Status card (#ECFDF5 bg — very light green, border: #22D3A0 1px):
    Place "[FLOW VISUAL — SUCCESS BG: dark green center glow, sparkles]" as card bg (very subtle)
    Icon: ✅ 48px green
    Title: "Deposit Confirmed!" Syne 700 20px #064E3B
    Subtitle: "Verified Jan 22, 2026" mono
    Balance: "$500.00" gold #D4A017 Syne 800 32px (prominent)
    "Your IB account is now active" DM Sans 400 14px
    CTA: "Go to Telegram" blue button

  === STATE 3: REJECTED ===
  Status card (#FEF2F2 bg — very light red, border: #EF4444 1px):
    Icon: ❌ 48px red
    Title: "Verification Rejected" DM Sans 600 18px #7F1D1D
    Reason: "Receipt image was unclear. Please resubmit a clearer screenshot." #5A5A7A 14px
    CTA: "Resubmit Proof →" #9A1B22 crimson button

  TIMELINE SECTION (below status card):
    "Submission History" DM Sans 600 14px #5A5A7A
    Vertical timeline:
      ● Jan 20 14:32 — "Proof submitted" #5A5A7A
      ● Jan 20 14:32 — "Under review by team" amber
      ● Jan 22 09:00 — "Approved by Owner" green (or Rejected)

TMA LIGHT MODE OVERRIDES APPLY.
```


---

---

# PART 2: MOBILE NATIVE APP SHELL (Dark Admin — All Role Views)

> **For Antigravity → Stitch MCP:** These prompts define the mobile-first native app experience for the Titan Journal CRM admin interface. Target device: iPhone 14 Pro (390×844px). All screens use DARK MODE (same Obsidian palette as desktop). Activate at max-width: 767px.

## MOBILE GLOBAL STYLE RULES (embed in every mobile Stitch prompt)

```
MOBILE GLOBAL STYLE RULES (apply to ALL mobile pages):
- Viewport: 390px wide, 844px tall (iPhone 14 Pro reference)
- Framework: Next.js + Tailwind CSS + shadcn/ui
- Theme: DARK MODE — same Obsidian palette as desktop
- Page background: #080810
- Card surfaces: #141422 with 1px solid #2A2A42 border, 12px border-radius
- Elevated surfaces: #1C1C2E
- Brand crimson: #C4232D | Gold: #E8B94F
- Text primary: #F0F0FF | Text secondary: #8888AA | Muted: #555570
- Success: #22D3A0 | Warning: #F59E0B | Danger: #EF4444 | Info: #60A5FA
- Fonts: Syne 700/800 (numbers/headings), DM Sans 400/500/600 (body/UI), JetBrains Mono 400/500 (IDs/values)
- BOTTOM TAB BAR: 56px + safe-area-inset-bottom, #0E0E1A bg, 1px #2A2A42 top border
  - Active tab: pill bg #C4232D1A, icon #C4232D, label #F0F0FF DM Sans 600 11px
  - Inactive tab: icon + label #555570 DM Sans 400 11px
  - Badge: 8px circle #C4232D, JetBrains Mono 9px white
- PAGE HEADER: 52px, #0E0E1A bg, 1px #2A2A42 bottom border
  - Left: role badge icon (24px, role-colored) + page title DM Sans 600 17px #F0F0FF
  - Right: bell icon (with badge) + avatar circle 32px
- ROLE BADGE COLORS: SUPERADMIN=#E8B94F (gold crown), OWNER=#C4232D (crimson diamond), ADMIN=#60A5FA (blue shield), STAFF=#8888AA (muted circle)
- LIVE dot: 8px pulsing red circle #FF3B47 with keyframe animation, placed in header right area on data pages
- Safe area: padding-top env(safe-area-inset-top), padding-bottom env(safe-area-inset-bottom)
- Minimum tap target: 44px x 44px for all interactive elements
- Lead status left-accent bars: 3px solid — #60A5FA=NEW, #F59E0B=DEPOSIT_REPORTED, #22D3A0=DEPOSIT_CONFIRMED, #EF4444=REJECTED
```

---

## PAGE 14: Mobile Shell — M01 (Layout Component)

```
STITCH PROMPT — MOBILE PAGE: App Shell / Layout Wrapper

Design the reusable mobile layout shell for Titan Journal CRM. This is not a content page — it shows the structural chrome that wraps all mobile dashboard screens.

SHOW THREE STATES stacked vertically for review:
  STATE A: OWNER role active on "Dashboard" screen
  STATE B: SUPERADMIN role active on "Platform Overview" screen
  STATE C: STAFF role active on "My Tasks" screen

DIMENSIONS: 390x844px for each state

STRUCTURE (same for all 3):
  TOP: Mobile status bar mockup (signal, wifi, battery) — system chrome, not designed, just shown
  HEADER (52px):
    Left: Role badge icon (per role color/shape) + Page title DM Sans 600 17px #F0F0FF
    Right: Bell icon (notification count badge 8px crimson circle) + Avatar circle 32px #1C1C2E bg, initials DM Sans 600 14px #F0F0FF
    Border-bottom: 1px #2A2A42

  CONTENT AREA:
    Show a placeholder grey box labeled "[PAGE CONTENT — see Page 15/16/17]" in #1C1C2E bg
    Content area height = 844px minus 52px header minus 56px tab bar minus safe areas

  BOTTOM TAB BAR (56px + 34px safe area = 90px total from bottom):
    Background: #0E0E1A with backdrop-filter blur(20px)
    Border-top: 1px #2A2A42

    STATE A (OWNER — 4 tabs):
      Tab 1 "Home" SquaresFour icon + label (ACTIVE — pill bg #C4232D1A, icon #C4232D, label #F0F0FF bold)
      Tab 2 "Leads" Users icon + label (inactive #555570)
      Tab 3 "Verify" ShieldCheck icon + label + badge "3" (inactive #555570, badge #C4232D)
      Tab 4 "More" DotsThree icon + label (inactive #555570)

    STATE B (SUPERADMIN — 4 tabs):
      Tab 1 "Overview" ChartBar icon (ACTIVE crimson)
      Tab 2 "Orgs" Buildings icon (inactive)
      Tab 3 "Admin" Crown icon (inactive)
      Tab 4 "More" DotsThree icon (inactive)

    STATE C (STAFF — 4 tabs):
      Tab 1 "Tasks" House icon (ACTIVE crimson)
      Tab 2 "Leads" Users icon (inactive)
      Tab 3 "Verify" ShieldCheck icon + badge "5" (inactive)
      Tab 4 "More" DotsThree icon (inactive)

  HOME INDICATOR: 134px wide x 5px tall pill #8888AA centered at absolute bottom, 8px from bottom

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 15: Mobile Home — M02 (SUPERADMIN Platform Overview)

```
STITCH PROMPT — MOBILE PAGE: / (SUPERADMIN — Platform Overview)

Design the SUPERADMIN home screen for Titan Journal CRM mobile. This role has platform-level visibility across ALL organizations.

DIMENSIONS: 390x844px. DARK MODE.

HEADER: Gold crown icon left + "Platform Overview" DM Sans 600 17px #F0F0FF
  Right: Bell (badge "2") + Avatar (gold ring border indicating SUPERADMIN status)
  Right of title: Pulsing LIVE dot (8px #FF3B47 animated) + "LIVE" DM Sans 500 11px #C4232D

CONTENT AREA (scrollable):

  SECTION 1 — Quick Stat Strip (horizontal scroll, 16px left padding):
    Chip 1: ChartBar icon (gold tint bg) | "14" Syne 700 22px #F0F0FF | "Orgs" 11px #8888AA
    Chip 2: Users icon (crimson tint bg) | "8,421" Syne 700 22px | "Total Leads"
    Chip 3: CurrencyDollar icon (gold tint) | "$2.1M" Syne 700 22px #E8B94F | "Platform AUM"
    Chip 4: Pulse icon (green tint) | "156" Syne 700 22px #22D3A0 | "Active Today"
    Each chip: 120px x 72px, #141422 bg, #2A2A42 border, 10px radius, DM Sans 400 11px labels

  SECTION 2 — Platform Funnel Chart Card (#141422 bg, 16px margin, 12px radius):
    Title: "Platform Funnel — 30 Days" DM Sans 600 14px #F0F0FF
    Subtitle: "All organizations combined" DM Sans 400 12px #8888AA
    Chart area: 358px x 160px area chart placeholder "[RECHARTS — Stacked Area: Leads/Registered/FTD by day]"
    Colors: #C4232D (leads), #60A5FA (registered), #22D3A0 (FTD)
    Chart has NO axis labels (too small) — just the colored bands

  SECTION 3 — Organization Cards (header: "Organizations" DM Sans 600 14px #F0F0FF + "View All ->" crimson 12px right):
    Show 3 org cards, horizontal cards:
      Each: #141422 bg, #2A2A42 border, 12px radius, 12px padding
      Left: Org initial letter circle (24px, crimson bg, Syne 700 14px white)
      Center: Org name DM Sans 600 14px #F0F0FF | "Owner: Alex Tan" DM Sans 400 12px #8888AA
      Right: Lead count Syne 700 16px #F0F0FF | "leads" DM Sans 400 10px #555570
      Bottom row: AUM gold #E8B94F DM Sans 600 13px | Status badge pill "ACTIVE" green

  SECTION 4 — Platform Alerts (header: "System Alerts" + timestamp):
    Alert items (notification-style rows):
      Each: Left icon circle (colored) | title DM Sans 600 13px | body 12px #8888AA | time JetBrains Mono 11px
      Sample: WarningCircle (amber) "Org 'TradeHub' approaching lead quota" "10 min ago"
      Sample: Users (blue) "New org 'ForexPro' created" "2h ago"
      Sample: CheckCircle (green) "KB processing complete for 'Titan Main'" "5h ago"

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 16: Mobile Home — M03 (OWNER/ADMIN Dashboard)

```
STITCH PROMPT — MOBILE PAGE: / (OWNER/ADMIN — CRM Dashboard)

Design the OWNER home screen for Titan Journal CRM mobile. Crimson diamond role badge.

DIMENSIONS: 390x844px. DARK MODE.

HEADER: Crimson diamond icon left + "Dashboard" DM Sans 600 17px #F0F0FF
  Right: Bell (badge "5") + Avatar circle
  Inline right of title: Pulsing LIVE dot + "LIVE" crimson label

CONTENT AREA (scrollable, 16px horizontal padding):

  SECTION 1 — Quick Stat Strip (horizontal scroll):
    Chip 1: Users icon (crimson tint) | "42" Syne 700 22px | "New Leads" #8888AA 11px
    Chip 2: UserCheck icon (blue tint) | "28" Syne 700 22px | "Registered"
    Chip 3: CurrencyDollar icon (gold tint) | "11" Syne 700 22px #E8B94F | "FTD Today"
    Chip 4: TrendUp icon (gold tint) | "$84K" Syne 700 22px #E8B94F | "AUM"

  SECTION 2 — Funnel Chart Card (#141422, 12px radius):
    Title: "IB Funnel — 7 Days" DM Sans 600 14px #F0F0FF
    Right: "Jan 16-22" JetBrains Mono 12px #555570
    Chart: 358px x 140px "[RECHARTS — 3 lines: Leads #C4232D, Registered #60A5FA, FTD #22D3A0]"
    Legend row: 3 colored dots + labels DM Sans 400 11px #8888AA

  SECTION 3 — Pending Verifications Banner (show when count > 0):
    Full-width: #C4232D1A bg, 1px #C4232D border, 12px radius, 14px padding
    ShieldCheck icon 20px #C4232D | "5 leads awaiting verification" DM Sans 600 14px #F0F0FF | Arrow -> #C4232D

  SECTION 4 — Recent Leads (header: "Recent Leads" + "View All ->" crimson):
    3 lead cards (mobile card component):
      Row 1: Name DM Sans 600 15px #F0F0FF | status pill right-aligned
      Row 2: "HFM: 1029384" JetBrains Mono 13px #8888AA | "2h ago" #555570 right
      Row 3 (deposit): "$500.00" DM Sans 600 13px #E8B94F | "DEPOSIT" #555570 10px uppercase

  SECTION 5 — Today summary:
    3 pills: "42 leads today" | "11 FTDs" | "+$12,400 AUM" in respective status colors, 10% opacity bg

FAB: + crimson circle 56px, bottom-right, 20px above tab bar

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 17: Mobile Home — M04 (STAFF My Tasks)

```
STITCH PROMPT — MOBILE PAGE: / (STAFF — My Tasks)

Design the STAFF home screen for Titan Journal CRM mobile. Muted grey circle badge. No analytics. Task-focused.

DIMENSIONS: 390x844px. DARK MODE.

HEADER: Grey circle badge left + "Good morning, Ahmad" DM Sans 600 17px #F0F0FF
  Right: Bell (badge "2") + Avatar circle. NO LIVE dot.

CONTENT AREA (16px padding):

  GREETING:
    "Welcome back" DM Sans 400 13px #555570
    "Ahmad Razali" Syne 700 24px #F0F0FF
    "STAFF" badge chip: DM Sans 500 11px #8888AA, bg #1C1C2E
    "Tuesday, 22 Jan 2026" DM Sans 400 12px #555570

  QUICK ACTION CARDS (2-column grid, 8px gap):
    Card A (#141422, #2A2A42 border, 12px radius):
      ShieldCheck icon 28px #C4232D | "Verification Queue" DM Sans 600 14px #F0F0FF
      "5 pending" pill #F59E0B1A + #F59E0B text | Arrow ->
    Card B:
      Users icon 28px #60A5FA | "My Leads" | "12 assigned" | Arrow ->

  TODAY'S ASSIGNMENTS (header: "Today's New Leads"):
    2-3 compact lead cards: name + status + time. No deposit row.
    "View all 12 assigned leads ->" crimson 13px

  PENDING VERIFICATIONS BANNER (if count > 0):
    #F59E0B1A bg, 1px #F59E0B border
    "3 deposits awaiting your review" DM Sans 600 14px #F0F0FF
    "Tap to open Verification Queue ->" DM Sans 400 12px #8888AA

  RECENT ACTIVITY (4 timeline items):
    colored dot + action text DM Sans 400 13px #8888AA + "3h ago" JetBrains Mono 11px #555570

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 18: Mobile Leads List — M05

```
STITCH PROMPT — MOBILE PAGE: /leads (Mobile Lead Intelligence)

Design the mobile leads list page. Tab 2 in bottom nav.

DIMENSIONS: 390x844px. DARK MODE.

HEADER: Role badge + "Lead Intelligence" DM Sans 600 17px #F0F0FF
  Right: MagnifyingGlass icon + Funnel icon

CONTENT:

  SEARCH BAR (full-width, 16px margin):
    Input: #1C1C2E bg, 1px #2A2A42 border, 12px radius, 44px height
    Left: MagnifyingGlass 16px #555570 | Placeholder: "Search leads, IDs, names..." DM Sans 400 14px #555570

  FILTER CHIPS (horizontal scroll, 16px padding):
    ALL (active: #C4232D1A + #C4232D text) | NEW | REGISTERED | DEPOSIT REPORTED | VERIFIED
    9999px radius, 28px height, DM Sans 500 12px, #141422 bg inactive

  RESULTS HEADER: "284 leads" DM Sans 400 13px #8888AA left | "Newest v" ghost sort right

  LEAD CARDS (4-5 cards, 8px gap, 16px horizontal margin):
    Each card (#141422 bg, #2A2A42 border, 12px radius, 16px padding):
      Left: 3px status accent bar (color per status)
      Row 1: Name DM Sans 600 15px #F0F0FF | Status pill right
      Row 2: "HFM: 1029384" JetBrains Mono 13px #8888AA | "2h ago" #555570
      Row 3 (deposit): "$500.00" DM Sans 600 13px #E8B94F | "DEPOSIT REPORTED" 10px uppercase
    Show: one NEW (blue bar), one DEPOSIT_REPORTED (amber), one DEPOSIT_CONFIRMED (green)

  FAB: + crimson 56px circle, right 20px, above tab bar

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 19: Mobile Lead Detail — M06

```
STITCH PROMPT — MOBILE PAGE: /leads/[id] (Mobile Lead Detail)

Full-screen push page from lead list.

DIMENSIONS: 390x844px. DARK MODE.

HEADER: ChevronLeft + "Leads" #C4232D (back) | "Lead Detail" center | DotsThree right

CONTENT (scrollable):

  HERO CARD (#1C1C2E bg, 16px radius, 20px padding):
    Status badge pill (e.g. "DEPOSIT REPORTED" amber) + date JetBrains Mono 11px right
    Avatar: 56px circle #141422, initials Syne 700 24px #F0F0FF, centered
    Name: "Muhammad Hafiz Bin Ahmad" Syne 700 20px #F0F0FF center
    "@hafiz_trader" DM Sans 400 14px #8888AA center

  INFO GRID (2-column, 8px gap, 16px margin):
    Lead ID: "#TJ-1284" JetBrains Mono | HFM ID: "1029384" | Telegram ID: "987654321"
    Registered: "Jan 20, 2026" | Assigned To: "Ahmad Razali" | Handover: iOS toggle + "ON"
    Each cell: #141422 bg, #2A2A42 border, 10px radius

  DEPOSIT SECTION (if exists):
    #141422 bg, 1px #E8B94F30 border, 12px radius:
    CurrencyDollar #E8B94F + "Deposit Information" DM Sans 600 14px
    "$500.00" Syne 800 32px #E8B94F center
    "Reported Jan 21, 2026" #8888AA center
    Receipt thumbnail: 80px x 80px #1C1C2E bg placeholder

  STICKY ACTION BUTTONS (above tab bar, 16px padding):
    If DEPOSIT_REPORTED: "Verify Deposit" solid #22D3A0 (50%) + "Reject" outline #EF4444 (50%), 52px height
    If NEW/REGISTERED: full-width "Update Status" crimson

  ACTIVITY TIMELINE:
    "Activity History" DM Sans 600 14px #F0F0FF
    Vertical timeline with dots: Lead created | Registered | Deposit submitted

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 20: Mobile Verification Queue — M07 (Swipe Cards)

```
STITCH PROMPT — MOBILE PAGE: /verification (Mobile Verification — Swipe Interface)

Design the mobile verification queue with directional swipe cards (Tinder-style).

DIMENSIONS: 390x844px. DARK MODE.

HEADER: ShieldCheck + "Verification Queue" + badge "5" + LIVE dot right

STATS BAR (full-width, 16px padding):
  "5 Pending" (amber dot) | divider | "8 Today" (green dot) | divider | "23 This Week"
  DM Sans 600/400 14px/13px

SWIPE CARD STACK (centered, 16px margin):
  BACK CARD (peek): scale(0.96), translateY(8px), opacity 0.6, blurred, #1C1C2E bg, 16px radius, 320px height

  MAIN CARD (front, full): #141422 bg, 1px #2A2A42 border, 16px radius, 24px padding, 320px height:
    "#TJ-1284" JetBrains Mono 12px #555570 + date right
    Avatar 52px circle + initials center
    "Muhammad Hafiz" Syne 700 18px #F0F0FF center
    "HFM: 1029384" JetBrains Mono 13px #8888AA center
    Divider 1px #2A2A42
    CurrencyDollar gold + "$500.00" Syne 800 28px #E8B94F center
    "DEPOSIT REPORTED" DM Sans 500 11px #F59E0B center
    Receipt thumbnail 80px x 80px center

  DRAGGING RIGHT STATE (second variant of same card):
    #22D3A040 green overlay on card + "CHECK APPROVE" stamp DM Sans 700 24px #22D3A0 rotated -10deg top-left

  DRAGGING LEFT STATE (third variant):
    #EF444440 red overlay + "X REJECT" stamp DM Sans 700 24px #EF4444 rotated +10deg top-right

SWIPE HINTS (below stack):
  "<- Reject" pill #EF44441A + text | "Approve ->" pill #22D3A01A + text
  DM Sans 500 13px, 32px height

MANUAL BUTTONS:
  "Reject" outline #EF4444 (45%) | "Approve" solid #22D3A0 (45%), 52px height, 12px radius

EMPTY STATE:
  CheckCircle 64px #22D3A0 | "All done!" Syne 700 24px | "No pending verifications" #8888AA
  "8 verified today" #22D3A0 DM Sans 500 13px

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 21: Mobile Analytics — M08

```
STITCH PROMPT — MOBILE PAGE: /analytics (Mobile Analytics)

Vertically stacked charts. Available to OWNER, ADMIN (read-only), SUPERADMIN (cross-org).

DIMENSIONS: 390x844px. DARK MODE.

HEADER: ChartBar icon + "Analytics" DM Sans 600 17px #F0F0FF | Calendar icon + LIVE dot right

DATE RANGE SEGMENTED CONTROL (16px margin):
  "Today" | "7D" (active: #C4232D1A + #C4232D) | "30D" | "Custom"
  9999px radius pills, 36px height, DM Sans 500 13px

QUICK STAT STRIP (horizontal scroll): New Leads | Registered | FTD | AUM chips

LEAD FLOW CHART (#141422 card, 16px margin):
  "Lead Flow — 7 Days" DM Sans 600 14px | "New vs Registered vs Deposited" #8888AA 12px
  358px x 180px "[RECHARTS — Grouped BarChart]" — bars: #C4232D, #60A5FA, #22D3A0
  X-axis: day labels JetBrains Mono 10px #555570

CONVERSION FUNNEL (#141422 card):
  "Conversion Funnel" DM Sans 600 14px
  Horizontal bars:
    "Leads: 284" full width bar #C4232D | "100%"
    "Registered: 184" 65% bar #60A5FA | "65%"
    "Deposited: 89" 31% bar #22D3A0 | "31%"
    "FTD: 42" 15% bar #E8B94F | "15%"
  Each bar: 10px height, 9999px radius, label left DM Sans 400 13px #F0F0FF, % right

AUM OVER TIME (#141422 card):
  "AUM Balance" + "+20.1% this month" green pill right
  358px x 140px "[RECHARTS — AreaChart, #E8B94F stroke, gold fill 20% opacity]"

TOP PERFORMERS (#141422 card, OWNER/SUPERADMIN only):
  "Top Staff by Leads" DM Sans 600 14px
  5 ranked rows: position JetBrains Mono 14px #555570 | name DM Sans 600 14px | count #C4232D Syne 700 16px

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 22: More Drawer — M09

```
STITCH PROMPT — MOBILE PAGE: More Drawer (Bottom Sheet — Role Adaptive)

Bottom sheet sliding up on Tab 4 "More" tap. Show 3 role variants side by side.

DIMENSIONS: 390px x 500px each (60vh). DARK MODE. Bottom-attached.

SHARED STRUCTURE:
  Handle: 4px x 32px pill #38385A centered 12px from top
  BG: #141422, 20px top border-radius, 1px #2A2A42 top border

VARIANT A — OWNER:
  Profile row: Avatar 40px + "Sarah Lim" DM Sans 600 15px + "Owner" crimson diamond chip | chevron ->
  Divider 1px #2A2A42
  Nav rows (52px height, icon left, DM Sans 500 14px #F0F0FF, chevron right):
    ChartBar #60A5FA — "Analytics"
    Sliders #8888AA — "Settings"
    Bell #F59E0B + badge "5" — "Notifications"
    User #8888AA — "Profile"
  Bottom: Language toggle "EN | MY" | SignOut #EF4444 — "Sign Out"

VARIANT B — SUPERADMIN:
  Profile row: Avatar + "Platform Admin" + gold crown chip
  Nav: Analytics (All Orgs) | System Config | Notifications + badge | Profile | Crown #E8B94F Admin Panel
  Bottom: Language toggle + Sign Out

VARIANT C — STAFF:
  Profile row + grey circle badge
  Nav: Bell "Notifications" + badge "2" | User "Profile"
  Bottom: Language toggle + Sign Out
  (No Analytics, No Settings)

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 23: Mobile Settings — M10

```
STITCH PROMPT — MOBILE PAGE: /settings (Mobile Settings)

iOS-style grouped list settings. OWNER and ADMIN (role-gated).

DIMENSIONS: 390x844px. DARK MODE.

HEADER: ChevronLeft back + "Settings" DM Sans 600 17px center

GROUPED SECTIONS (16px margin, 8px gap between sections):

  "BOT CONFIGURATION" section header DM Sans 600 11px #555570 uppercase:
    List card #141422, 12px radius:
      Robot #60A5FA | "Bot Config" DM Sans 500 14px #F0F0FF | chevron right (52px row)
      Divider 1px #2A2A42 (inset 52px from left)
      Brain #8888AA | "Knowledge Base" | chevron
      Divider
      ListBullets | "Command Menu" | chevron

  "TEAM" section header (OWNER only):
    List card: Users #60A5FA | "Team Members" | chevron | Divider | Key | "Active Sessions" | chevron

  "TEAM" section (ADMIN — role-gated, show disabled state):
    List card: Users icon (muted) | "Team Members" | Lock icon + "Owner access required" #555570 right | no chevron (non-tappable)

  "APPEARANCE" section:
    Sun/Moon | "Theme" | "Dark" #555570 right + chevron
    Globe | "Language" | "English" + chevron

  "ACCOUNT" section:
    LockKey | "Change Password" | chevron
    Shield | "Security" | chevron

  DANGER ZONE:
    "Sign Out" #EF44441A bg, 1px #EF4444 border, 12px radius, 52px height, full-width
    SignOut icon + "Sign Out" DM Sans 600 14px #EF4444

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 24: Notifications Center — M11

```
STITCH PROMPT — MOBILE PAGE: /notifications (Notification Center)

Full notification feed page. All roles, role-filtered content.

DIMENSIONS: 390x844px. DARK MODE.

HEADER: Bell icon + "Notifications" DM Sans 600 17px #F0F0FF | "Mark all read" ghost #C4232D 13px right

FILTER CHIPS (horizontal scroll):
  "All" (active) | "Leads" | "Verification 3" (with badge) | "System"
  Active: #C4232D1A + #C4232D, 9999px radius

NOTIFICATION LIST (grouped):
  GROUP HEADER: "Today" DM Sans 600 11px #555570 uppercase, 16px padding

  NOTIFICATION ROWS (64px min height):
    Structure: 40px icon circle (10% tint) + icon 20px | Title DM Sans 600 14px #F0F0FF + Body DM Sans 400 13px #8888AA 2-line | Timestamp JetBrains Mono 11px #555570
    UNREAD: 3px left border #C4232D + #1C1C2E bg
    READ: no border + #141422 bg

  SAMPLE ROWS:
    UNREAD: UserPlus (blue) | "New lead registered" | "Muhammad Hafiz registered via Telegram" | "2h ago"
    UNREAD: CurrencyDollar (amber) | "Deposit reported" | "Siti Aminah submitted $800 deposit receipt" | "4h ago"
    UNREAD: ShieldCheck (green) | "Verification approved" | "Lead #TJ-1279 deposit confirmed" | "5h ago"
    READ: XCircle (red) | "Deposit rejected" | "Lead #TJ-1277 rejected — poor image quality" | "Yesterday"
    READ: Users (muted) | "New team member" | "Ahmad Razali added as Staff" | "Jan 20"
    READ: Database (blue) | "KB processing complete" | "knowledge-base-jan.pdf indexed" | "Jan 19"

  Divider 1px #2A2A42 inset 56px between rows

EMPTY STATE:
  Bell icon 64px #555570 | "All caught up!" Syne 700 20px | "No new notifications" DM Sans 400 14px #555570

MOBILE GLOBAL STYLE RULES APPLY.
```

---

## PAGE 25: Profile & Account — M12

```
STITCH PROMPT — MOBILE PAGE: /profile (User Profile & Account)

User profile and account settings. All roles.

DIMENSIONS: 390x844px. DARK MODE.

HEADER: ChevronLeft back + "Profile" DM Sans 600 17px center

CONTENT (scrollable):

  HERO (center-aligned, 24px padding):
    Avatar circle 80px #1C1C2E + initials Syne 700 32px #F0F0FF
    Camera icon overlay: 24px circle #C4232D bg bottom-right corner of avatar
    "Sarah Lim" Syne 700 22px #F0F0FF
    "OWNER" badge chip: #C4232D1A bg, 1px #C4232D border, DM Sans 600 12px #C4232D
    "sarah@titanjournal.com" DM Sans 400 13px #8888AA
    "Joined Jan 15, 2026" JetBrains Mono 12px #555570

  "ACCOUNT" section (DM Sans 600 11px #555570 uppercase header):
    List #141422, 12px radius:
      PencilSimple #60A5FA | "Edit Profile" | chevron (52px)
      Divider | LockKey #8888AA | "Change Password" | chevron
      Divider | Monitor #8888AA | "Active Sessions" | "3 active" #555570 right + chevron

  "NOTIFICATIONS" section:
    Toggle rows (52px):
      Bell | "New Lead Alerts" | iOS toggle ON #C4232D right
      CurrencyDollar | "Deposit Reports" | toggle ON
      ShieldCheck | "Verification Updates" | toggle ON

  "PREFERENCES" section:
    MoonStars | "Theme" | "Dark" + chevron
    Translate | "Language" | "English (EN)" + chevron

  "DANGER ZONE" (section header #EF444480):
    "Sign Out" full-width: #EF44441A bg, 1px #EF4444 border, 12px radius, 52px height
    SignOut #EF4444 left + "Sign Out" DM Sans 600 14px #EF4444

  "Titan Journal CRM v1.0.0" DM Sans 400 11px #555570 center bottom

MOBILE GLOBAL STYLE RULES APPLY.
```
