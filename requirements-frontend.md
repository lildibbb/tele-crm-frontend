# Frontend UI / UX Requirements: Titan Journal CRM

This document details the specific UI interfaces, features, and capabilities the Frontend (FE) team needs to build, based on the core system requirements and API capabilities.

## 1. Overview & Tech Stack

- **Framework**: React / Next.js (or established FE stack).
- **Styling**: Material UI (MUI) or Tailwind CSS.
- **Micro-Interactions**: Utilize Framer Motion for smooth transitions, real-time feedback, and dynamic animations.
- **Integration**: Telegram Mini App capabilities for mobile-first on-the-go access.
- **Vibe/Aesthetic**: Enterprise-grade, premium feel. Dark mode support, immediate (real-time) updates without manual refreshing.

## 2. Admin / Owner Dashboard

### A. Authentication & Onboarding

- **Hierarchical Login**: Secure login for System Owner / Admins. Support for Telegram seamless authentication.
- **Invite System**: UI for generating and managing invite links (Telegram Deep Links) for team onboarding or new IB registrations without Superadmin intervention.

### B. High-level Analytics & Metrics (The "Tally" Dashboard)

A primary dashboard utilizing cards and charts for quick insights. Data must aggregate Daily, Weekly, and Monthly.

- **KPI Cards**:
  - Total New Leads (messaging the bot).
  - Total Registered Accounts (`registeredAt`).
  - Total Depositing Clients / FTD (First Time Deposit) with total financial balances (`depositBalance`).
  - Overall Conversion Rates (Message → Registered → Deposited).
- **Charts**:
  - Line/Bar charts tracking metrics over custom timeframes.
  - Real-time animated indicator for active/live lead registrations.

### C. Lead Management (CRM Portal)

- **Data Table**: Display list of leads with pagination and sorting.
  - Columns: Telegram ID, Display Name, Phone Number, Account Broker (HFM) ID, Status, Registration Date, Verification Date.
- **Lead Detail View**:
  - Complete history of interaction timestamps.
  - **Media Viewer**: Ability to view uploaded transaction receipts or screen recordings directly in the portal (served via S3/GCS links).
- **Bot Handover Control & Communication**:
  - A prominent toggle to "Pause Bot / Take Over" for any specific lead.
  - **Chat Interface**: An integrated messaging UI allowing the owner to reply directly to the lead via the dashboard (Live "Reply" functionality).

### D. Verification Queue

A specialized view for handling self-reported deposits or registrations.

- **Pending List**: Shows leads who have selected "Dah Depo" and uploaded proof.
- **Action Buttons**: `Approve` (Marks as verified and sets `verifiedAt` timestamp), `Reject`, or `Need More Info`.

### E. Bot Configuration & Script Management

- **Script Editor**: Simple UI forms to manage the bot's auto-reply copy (Welcome, Qualification, Follow-ups).
- **Template Manager**:
  - Upload or link tutorial guides, PDFs, or Google Drive links.
  - Define custom Bot Command Templates that map to these resources.

## 3. User / Lead Facing UI (Telegram Mini App)

To streamline data collection, the bot can direct users to a Mini App interface securely within Telegram.

- **Registration Form**: UI gathering extra fields seamlessly (Email, HFM ID, Phone Number).
- **Deposit / Proof Form**: A simple, mobile-optimized form where users can input their deposit amount and upload receipt/video proof directly.
- **Notification / Status**: Clean UI showing their current verification status.

## 4. Required API Connections (FE <-> BE)

The FE team must consume the following backend REST API endpoints. All protected routes require a Bearer token.

### Authentication & Sessions (`/auth`)

- `POST /auth/login`: Standard email/password login.
- `POST /auth/refresh`: Refresh JWT tokens.
- `POST /auth/logout`: Invalidate current session.
- `POST /auth/tma-login`: Telegram Mini App direct login via initData.
- `POST /auth/setup-account`: Initial account setup for invitees.
- `GET /auth/sessions`: List active sessions.
- `DELETE /auth/sessions/:sessionId`: Invalidate a specific session.
- `DELETE /auth/sessions`: Invalidate all sessions except current.
- `POST /auth/forgot-password` & `POST /auth/reset-password`: Password recovery flow.
- `PATCH /auth/change-own-password`: Change password while authenticated.

### User Management (`/users` & `/superadmin/users`)

- `GET /users/me`: Fetch current logged-in user profile.
- `POST /users/invite`: Generate an invite link (Deep Link) for a new user/agent.
- `GET /users/invitations`: List pending invitations.
- `DELETE /users/invitations/:id`: Revoke an invitation.
- **Admin/Owner Only**:
  - `GET /users` & `GET /users/:id`: List and view team users.
  - `PATCH /users/:id/role`: Change user role.
  - `PATCH /users/:id/deactivate` / `reactivate`: Toggle user access.
  - `PATCH /users/:id/change-password`: Force change a user's password.
  - `POST /superadmin/users`: Create users directly (Superadmin only).

### Leads & CRM (`/leads`)

- `GET /leads`: List leads with filtering and pagination.
- `GET /leads/:id`: Get detailed lead history and data.
- `POST /leads/submit-info`: Mini App form submission (Email, Broker ID, etc.).
- `PATCH /leads/:id/status`: Update lead funnel status manually.
- `PATCH /leads/:id/handover`: Toggle Bot AI vs Manual Chat (Handover mode).
- `PATCH /leads/:id/verify`: Approve/Reject user-uploaded deposit proofs.

### Analytics & Dashboard (`/analytics`)

- `GET /analytics/dashboard`: Base KPI metrics (Total Leads, Registrations, Deposits).
- `GET /analytics/stats`: General tracking statistics.
- `GET /analytics/weekly`: Weekly aggregated funnel metrics.
- `GET /analytics/monthly`: Monthly aggregated funnel metrics.

### Knowledge Base & Bot Templates (`/knowledge-base`)

- `GET /knowledge-base`: List all saved templates and scripts.
- `GET /knowledge-base/active`: List only active scripts usable by the bot.
- `POST /knowledge-base/text`: Add a text-based reply template.
- `POST /knowledge-base/upload`: Upload a document/guide for the bot to use.
- `PATCH /knowledge-base/:id`: Update template content.
- `DELETE /knowledge-base/:id`: Remove a template.

### Telegram Command Menu (`/command-menu`)

- `GET /command-menu`: List custom Telegram commands configured by owner.
- `POST /command-menu`: Create a new Telegram command.
- `PATCH /command-menu/reorder`: Reorder how commands appear in Telegram.
- `PATCH /command-menu/:id` & `DELETE /command-menu/:id`: Edit or remove a command.

### Media & Attachments (`/attachments`)

- `GET /attachments`: Retrieve uploaded attachments/proofs for displaying in the dashboard.
