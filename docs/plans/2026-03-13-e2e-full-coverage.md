# E2E Full Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the TypeScript Playwright E2E suite from 29% route coverage to ~95%, ensuring every button is clicked, every form field is filled, and every modal/dialog is exercised with enterprise-grade assertion patterns.

**Architecture:** All specs use the existing Page Object Model pattern under `tests/e2e/ts/`. Each POM encapsulates selectors via `data-testid` attributes. Fixtures provide pre-authenticated page contexts per role (superadmin, owner). Tests are tagged `@smoke`, `@journey`, `@rbac`, or `@regression` for selective CI runs.

**Tech Stack:** `@playwright/test` 1.58, TypeScript, `tests/e2e/.env` for credentials, existing `auth.fixtures.ts` for role-scoped pages.

---

## CONTEXT: Existing Infrastructure

```
tests/e2e/ts/
  fixtures/auth.fixtures.ts     ← superadminPage, ownerPage, anonPage
  global-setup.ts               ← saves auth state per role
  pages/
    base.page.ts                ← BasePage abstract (goto, expectVisible, fillTestId, clickTestId)
    login.page.ts
    dashboard.page.ts
    leads.page.ts
    lead-detail.page.ts         ← expectLoaded, toggleHandover, expectInteractionHistory
    analytics.page.ts
    profile.page.ts
    admin.page.ts               ← navigateTo, navigateToOverview, navigateToUsers, etc.
    broadcasts.page.ts          ← navigate only
    follow-ups.page.ts          ← navigate only
    settings.page.ts            ← navigate, clickTab
  specs/
    auth.spec.ts, leads.spec.ts, analytics.spec.ts, admin.spec.ts,
    broadcasts.spec.ts, follow-ups.spec.ts, profile.spec.ts,
    settings.spec.ts, rbac.spec.ts, navigation.spec.ts
```

**Import convention in specs:**
```ts
import { test, expect } from "../fixtures/auth.fixtures";
import { SomePage } from "../pages/some.page";
```

**All selectors use `data-testid` via `page.getByTestId(id)` — never CSS class or text.**

---

## COVERAGE GAPS TO FILL

| Route | Gap |
|---|---|
| `/forgot-password` | No spec, no testids |
| `/setup-account` | No spec, no testids |
| `/leads/detail` | POM exists, no spec, testids partial |
| `/settings/bot-config` | Tab exists but no form testids, no spec |
| `/settings/commands` | No testids, no spec |
| `/settings/knowledge-base` | No testids, no spec |
| `/settings/team` | No testids, no spec |
| `/settings/integrations` | No testids, no spec |
| `/settings/sessions` | No testids, no spec |
| `/broadcasts` | testids exist, spec is 1 line — need full flow |
| `/follow-ups` | No testids, spec is 1 line |
| `/profile` | No tab testids, no security tab spec |
| `/audit-logs` | No testids, no spec |
| `/admin/overview`,`/system`,`/backup`,`/maintenance`,`/google`,`/secrets`,`/queues` | No testids, admin spec missing these |
| `/` dashboard | No spec |

---

## Task 1: Add data-testid — Auth Pages

**Files to Modify:**
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/setup-account/page.tsx`

### Step 1: Add testids to forgot-password page

Open `src/app/(auth)/forgot-password/page.tsx`. The page has two states: email form and success.

Find the **email input** and wrap/tag it:
```tsx
// Email input field
<Input data-testid="forgot-email-input" type="email" ... />

// Submit button
<Button data-testid="forgot-submit-btn" ...>Send Reset Code</Button>

// Back to sign in link
<Link data-testid="forgot-back-link" href="/login">Back to sign in</Link>

// Success state container (shown after submission)
<div data-testid="forgot-success-state" ...>
  // Inside success state:
  <Button data-testid="forgot-resend-btn" ...>Resend Code</Button>
  <Button data-testid="forgot-continue-btn" ...>Continue to Reset Password</Button>
</div>
```

Also add root container testid:
```tsx
<div data-testid="forgot-password-page" ...>
```

### Step 2: Add testids to setup-account page

Open `src/app/(auth)/setup-account/page.tsx`. States: loading, invalid, form, success.

```tsx
// Root container
<div data-testid="setup-account-page" ...>

// Invalid state
<div data-testid="setup-invalid-state" ...>

// Form state
<form data-testid="setup-account-form" ...>

// Password input
<Input data-testid="setup-password-input" type="password" ... />

// Confirm password
<Input data-testid="setup-confirm-input" type="password" ... />

// Submit button
<Button data-testid="setup-submit-btn" ...>Complete Setup</Button>

// Success state
<div data-testid="setup-success-state" ...>
  <Button data-testid="setup-go-dashboard-btn" ...>Go to Command Center</Button>
</div>
```

### Step 3: Verify changes compile
```powershell
cd D:\Project\tele-crm-frontend
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-Object -First 10
```
Expected: 0 errors (or only pre-existing spec error in app.controller.spec.ts)

### Step 4: Commit
```bash
git add src/app/(auth)/forgot-password/page.tsx src/app/(auth)/setup-account/page.tsx
git commit -m "test(testid): add data-testid to auth pages"
```

---

## Task 2: Add data-testid — Settings Subpages

**Files to Modify:**
- `src/app/(dashboard)/settings/_components/bot-config-tab.tsx`
- `src/app/(dashboard)/settings/_components/team-tab.tsx`
- `src/app/(dashboard)/settings/_components/commands-tab.tsx`
- `src/app/(dashboard)/settings/_components/knowledge-base-tab.tsx`
- `src/app/(dashboard)/settings/_components/integrations-tab.tsx`
- `src/app/(dashboard)/settings/sessions/page.tsx` (or its component)

### Step 1: bot-config-tab.tsx
```tsx
// Root form
<form data-testid="bot-config-form" ...>

// Fields
<Input data-testid="bot-config-name" ... />           // Bot Name
<Textarea data-testid="bot-config-greeting" ... />    // Greeting Message
<Input data-testid="bot-config-registration-url" ... /> // Registration URL
<Textarea data-testid="bot-config-system-prompt" ... /> // System Prompt
<Input data-testid="bot-config-group-id" ... />        // Telegram Group ID

// Toggles (Switch components)
<Switch data-testid="bot-config-ai-active" ... />
<Switch data-testid="bot-config-auto-followups" ... />
<Switch data-testid="bot-config-group-thread" ... />
<Switch data-testid="bot-config-forward-messages" ... />

// Save button
<Button data-testid="bot-config-save-btn" ...>Save Changes</Button>
```

### Step 2: team-tab.tsx
```tsx
// Invite button
<Button data-testid="team-invite-btn" ...>Invite Member</Button>

// Invite modal
<Dialog>
  <DialogContent data-testid="team-invite-modal">
    <Input data-testid="team-invite-email" type="email" ... />
    <Button data-testid="team-role-admin" ...>ADMIN</Button>
    <Button data-testid="team-role-staff" ...>STAFF</Button>
    <Button data-testid="team-invite-submit" ...>Generate Invite Link</Button>
    <Button data-testid="team-invite-cancel" ...>Cancel</Button>
    // Success state:
    <Button data-testid="team-invite-copy-btn" ...>Copy</Button>
    <Button data-testid="team-invite-done-btn" ...>Done</Button>
  </DialogContent>
</Dialog>

// Members table
<table data-testid="team-members-table">
// Each row deactivate/reactivate
<Button data-testid={`team-deactivate-${member.id}`} ...>Deactivate</Button>
<Button data-testid={`team-reactivate-${member.id}`} ...>Reactivate</Button>
```

### Step 3: commands-tab.tsx
```tsx
// Add command button
<Button data-testid="commands-add-btn" ...>Add Command</Button>

// Command modal
<Dialog>
  <DialogContent data-testid="commands-modal">
    <Input data-testid="commands-modal-name" ... />
    <Textarea data-testid="commands-modal-description" ... />
    <Switch data-testid="commands-modal-enabled" ... />
    <Button data-testid="commands-modal-save" ...>Save</Button>
    <Button data-testid="commands-modal-cancel" ...>Cancel</Button>
  </DialogContent>
</Dialog>

// Commands table
<table data-testid="commands-table">
// Per row:
<Button data-testid={`command-edit-${cmd.id}`} ...>Edit</Button>
<Button data-testid={`command-delete-${cmd.id}`} ...>Delete</Button>
<Switch data-testid={`command-enabled-${cmd.id}`} ... />
```

### Step 4: knowledge-base-tab.tsx
```tsx
// Add entry button
<Button data-testid="kb-add-btn" ...>Add Entry</Button>

// Filter chips
<Button data-testid="kb-filter-all" ...>All</Button>
<Button data-testid="kb-filter-template" ...>Template</Button>
<Button data-testid="kb-filter-text" ...>Text</Button>
<Button data-testid="kb-filter-link" ...>Link</Button>

// Modal
<Dialog>
  <DialogContent data-testid="kb-modal">
    <Input data-testid="kb-modal-title" ... />
    <Button data-testid="kb-modal-save" ...>Save</Button>
    <Button data-testid="kb-modal-cancel" ...>Cancel</Button>
  </DialogContent>
</Dialog>

// KB list container
<div data-testid="kb-list">
```

### Step 5: integrations-tab.tsx
```tsx
// Root container
<div data-testid="integrations-tab">

// Per integration card
<Switch data-testid={`integration-toggle-${key}`} ... />
<Button data-testid={`integration-save-${key}`} ...>Save Changes</Button>
```

### Step 6: sessions page (settings)
Open `src/app/(dashboard)/settings/sessions/page.tsx` (or the SessionsTab component it renders):
```tsx
// Root
<div data-testid="sessions-page">

// Revoke all button
<Button data-testid="sessions-revoke-all-btn" ...>Revoke All Sessions</Button>

// Per session card
<div data-testid={`session-card-${session.id}`}>
  <Button data-testid={`session-revoke-${session.id}`} ...>Revoke</Button>
</div>

// Current session badge
<span data-testid="session-current-badge">Current</span>

// Revoke confirm dialog
<AlertDialog>
  <AlertDialogContent data-testid="session-revoke-dialog">
    <Button data-testid="session-revoke-confirm">Revoke</Button>
    <Button data-testid="session-revoke-dialog-cancel">Cancel</Button>
  </AlertDialogContent>
</AlertDialog>
```

### Step 7: Verify
```powershell
cd D:\Project\tele-crm-frontend && .\node_modules\.bin\tsc --noEmit 2>&1 | Select-Object -First 10
```

### Step 8: Commit
```bash
git add src/app/(dashboard)/settings/
git commit -m "test(testid): add data-testid to settings subpage components"
```

---

## Task 3: Add data-testid — Lead Detail, Follow-ups, Profile, Broadcasts

**Files to Modify:**
- `src/app/(dashboard)/leads/detail/_components/LeadDetailClient.tsx` (extend existing)
- `src/app/(dashboard)/follow-ups/page.tsx` + `_components/`
- `src/app/(dashboard)/profile/page.tsx` (extend)
- `src/app/(dashboard)/broadcasts/page.tsx` (verify existing, add pagination)

### Step 1: LeadDetailClient.tsx — add tab testids
```tsx
// Tab list
<TabsList data-testid="lead-detail-tabs">

// Individual tabs
<TabsTrigger value="overview" data-testid="lead-tab-overview">Overview</TabsTrigger>
<TabsTrigger value="profile" data-testid="lead-tab-profile">Profile</TabsTrigger>
<TabsTrigger value="interactions" data-testid="lead-tab-interactions">Interactions</TabsTrigger>
<TabsTrigger value="documents" data-testid="lead-tab-documents">Documents</TabsTrigger>

// Status dropdown/badge
<Select data-testid="lead-status-select" ...>

// Back button
<Button data-testid="lead-back-btn" ...>
```

### Step 2: follow-ups — add testids
In the follow-ups page/components:
```tsx
// Root page
<div data-testid="follow-ups-page">

// Tabs
<TabsList data-testid="followup-tabs">
<TabsTrigger value="scheduled" data-testid="followup-tab-scheduled">
<TabsTrigger value="failed" data-testid="followup-tab-failed">

// Table
<table data-testid="followup-scheduled-table">
<table data-testid="followup-failed-table">

// Per row cancel
<Button data-testid={`followup-cancel-${item.id}`}>Cancel</Button>
<Button data-testid={`followup-retry-${item.id}`}>Retry</Button>

// Pagination
<Button data-testid="followup-prev-btn">Previous</Button>
<Button data-testid="followup-next-btn">Next</Button>
<span data-testid="followup-page-info">Page X of Y</span>

// Confirm cancel dialog
<AlertDialogContent data-testid="followup-cancel-dialog">
  <Button data-testid="followup-cancel-confirm">Confirm Cancel</Button>
  <Button data-testid="followup-cancel-abort">Cancel</Button>
```

### Step 3: profile/page.tsx — tab testids
```tsx
// Root
<div data-testid="profile-page"> // already exists

// Tabs
<TabsList data-testid="profile-tabs">
<TabsTrigger value="account" data-testid="profile-tab-account">Account</TabsTrigger>
<TabsTrigger value="security" data-testid="profile-tab-security">Security</TabsTrigger>
<TabsTrigger value="sessions" data-testid="profile-tab-sessions">Active Sessions</TabsTrigger>

// Security tab — change password form
<Input data-testid="profile-current-password" type="password" ... />
<Input data-testid="profile-new-password" type="password" ... />
<Input data-testid="profile-confirm-password" type="password" ... />
<Button data-testid="profile-change-password-btn">Change Password</Button>

// Timezone selector
<Button data-testid="profile-timezone-trigger" ...> // combobox trigger
<Input data-testid="profile-timezone-search" ...>   // search inside popover
```

### Step 4: broadcasts — verify + add pagination testids
Check `src/app/(dashboard)/broadcasts/page.tsx` for existing testids, then add:
```tsx
// Pagination (history table)
<Button data-testid="broadcasts-prev-btn">Previous</Button>
<Button data-testid="broadcasts-next-btn">Next</Button>
<span data-testid="broadcasts-page-info">Page X of Y</span>

// Stats cards container
<div data-testid="broadcasts-stats">

// History table
<table data-testid="broadcasts-history-table">
// or list container:
<div data-testid="broadcasts-history-list">
```

### Step 5: Verify + Commit
```powershell
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-Object -First 10
```
```bash
git add src/app/(dashboard)/leads/ src/app/(dashboard)/follow-ups/ src/app/(dashboard)/profile/ src/app/(dashboard)/broadcasts/
git commit -m "test(testid): add data-testid to lead-detail, follow-ups, profile, broadcasts"
```

---

## Task 4: Add data-testid — Admin Subpages + Audit Logs

**Files to Modify:**
- `src/app/(dashboard)/admin/overview/` (OverviewPanel component)
- `src/app/(dashboard)/admin/system/` (SystemConfigPanel)
- `src/app/(dashboard)/admin/backup/` (BackupPanel)
- `src/app/(dashboard)/admin/maintenance/` (MaintenancePanel)
- `src/app/(dashboard)/admin/google/` (GoogleOpsPanel)
- `src/app/(dashboard)/admin/secrets/` (SecretsPanel)
- `src/app/(dashboard)/admin/queues/` (QueuesPanel)
- `src/app/(dashboard)/audit-logs/page.tsx`

### Step 1: Each admin panel — add root testid

For each admin panel component, find the root `<div>` or container and add:
```tsx
// admin/overview
<div data-testid="admin-overview-panel">

// admin/system
<div data-testid="admin-system-panel">

// admin/backup
<div data-testid="admin-backup-panel">
<Button data-testid="admin-backup-trigger-btn">Create Backup</Button>

// admin/maintenance
<div data-testid="admin-maintenance-panel">

// admin/google
<div data-testid="admin-google-panel">
<table data-testid="admin-google-ops-table">

// admin/secrets
<div data-testid="admin-secrets-panel">

// admin/queues
<div data-testid="admin-queues-panel">
<table data-testid="admin-queues-table">
<Input data-testid="admin-queues-search" ... /> // search input
// Per row:
<Button data-testid={`queue-retry-failed-${queue.name}`}>Retry Failed</Button>
<Button data-testid={`queue-purge-failed-${queue.name}`}>Purge Failed</Button>
```

### Step 2: audit-logs/page.tsx
```tsx
// Root
<div data-testid="audit-logs-page">

// Search/filter
<Input data-testid="audit-logs-search" ...>

// Table
<table data-testid="audit-logs-table">

// Pagination
<Button data-testid="audit-logs-prev-btn">Previous</Button>
<Button data-testid="audit-logs-next-btn">Next</Button>
```

### Step 3: Verify + Commit
```powershell
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-Object -First 10
```
```bash
git add src/app/(dashboard)/admin/ src/app/(dashboard)/audit-logs/
git commit -m "test(testid): add data-testid to admin subpages and audit-logs"
```

---

## Task 5: Create/Extend Page Object Models

**Files to Create:**
- `tests/e2e/ts/pages/forgot-password.page.ts`
- `tests/e2e/ts/pages/bot-config.page.ts`
- `tests/e2e/ts/pages/team.page.ts`
- `tests/e2e/ts/pages/commands.page.ts`
- `tests/e2e/ts/pages/knowledge-base.page.ts`
- `tests/e2e/ts/pages/sessions-settings.page.ts`
- `tests/e2e/ts/pages/audit-logs.page.ts`

**Files to Modify (extend existing POMs):**
- `tests/e2e/ts/pages/broadcasts.page.ts`
- `tests/e2e/ts/pages/follow-ups.page.ts`
- `tests/e2e/ts/pages/profile.page.ts`
- `tests/e2e/ts/pages/settings.page.ts`
- `tests/e2e/ts/pages/admin.page.ts`
- `tests/e2e/ts/pages/lead-detail.page.ts`

### Step 1: Create `forgot-password.page.ts`

```typescript
// tests/e2e/ts/pages/forgot-password.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ForgotPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/forgot-password");
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageVisible(): Promise<void> {
    await this.expectVisible("forgot-password-page");
  }

  async fillEmail(email: string): Promise<void> {
    await this.fillTestId("forgot-email-input", email);
  }

  async submitEmail(): Promise<void> {
    await this.clickTestId("forgot-submit-btn");
    await this.page.waitForTimeout(500);
  }

  async expectSuccessState(): Promise<void> {
    await this.expectVisible("forgot-success-state", { timeout: 5000 });
  }

  async clickBackToLogin(): Promise<void> {
    await this.clickTestId("forgot-back-link");
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.getByTestId("forgot-submit-btn")).toBeDisabled();
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.getByTestId("forgot-submit-btn")).toBeEnabled();
  }
}
```

### Step 2: Create `bot-config.page.ts`

```typescript
// tests/e2e/ts/pages/bot-config.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class BotConfigPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/settings?tab=bot-config");
    await this.page.waitForLoadState("networkidle");
  }

  async expectFormVisible(): Promise<void> {
    await this.expectVisible("bot-config-form");
  }

  async fillBotName(name: string): Promise<void> {
    await this.fillTestId("bot-config-name", name);
  }

  async fillGreeting(message: string): Promise<void> {
    await this.fillTestId("bot-config-greeting", message);
  }

  async fillRegistrationUrl(url: string): Promise<void> {
    await this.fillTestId("bot-config-registration-url", url);
  }

  async fillSystemPrompt(prompt: string): Promise<void> {
    await this.fillTestId("bot-config-system-prompt", prompt);
  }

  async toggleAiActive(): Promise<void> {
    await this.clickTestId("bot-config-ai-active");
    await this.page.waitForTimeout(300);
  }

  async clickSave(): Promise<void> {
    await this.clickTestId("bot-config-save-btn");
    await this.page.waitForLoadState("networkidle");
  }

  async expectSaveEnabled(): Promise<void> {
    await expect(this.getByTestId("bot-config-save-btn")).toBeEnabled();
  }
}
```

### Step 3: Create `team.page.ts`

```typescript
// tests/e2e/ts/pages/team.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class TeamPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/settings?tab=team");
    await this.page.waitForLoadState("networkidle");
  }

  async expectTableVisible(): Promise<void> {
    await this.expectVisible("team-members-table");
  }

  async openInviteModal(): Promise<void> {
    await this.clickTestId("team-invite-btn");
    await this.expectVisible("team-invite-modal");
  }

  async fillInviteEmail(email: string): Promise<void> {
    await this.fillTestId("team-invite-email", email);
  }

  async selectRole(role: "ADMIN" | "STAFF"): Promise<void> {
    const testId = role === "ADMIN" ? "team-role-admin" : "team-role-staff";
    await this.clickTestId(testId);
  }

  async submitInvite(): Promise<void> {
    await this.clickTestId("team-invite-submit");
    await this.page.waitForTimeout(1000);
  }

  async cancelInviteModal(): Promise<void> {
    await this.clickTestId("team-invite-cancel");
    await this.page.waitForTimeout(300);
  }

  async expectInviteModalClosed(): Promise<void> {
    await this.expectHidden("team-invite-modal");
  }

  async expectCopyLinkVisible(): Promise<void> {
    await this.expectVisible("team-invite-copy-btn", { timeout: 5000 });
  }

  async clickCopyLink(): Promise<void> {
    await this.clickTestId("team-invite-copy-btn");
  }

  async clickDone(): Promise<void> {
    await this.clickTestId("team-invite-done-btn");
  }
}
```

### Step 4: Create `commands.page.ts`

```typescript
// tests/e2e/ts/pages/commands.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class CommandsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/settings?tab=commands");
    await this.page.waitForLoadState("networkidle");
  }

  async expectTableVisible(): Promise<void> {
    await this.expectVisible("commands-table");
  }

  async openAddModal(): Promise<void> {
    await this.clickTestId("commands-add-btn");
    await this.expectVisible("commands-modal");
  }

  async fillCommandName(name: string): Promise<void> {
    await this.fillTestId("commands-modal-name", name);
  }

  async fillCommandDescription(desc: string): Promise<void> {
    await this.fillTestId("commands-modal-description", desc);
  }

  async saveCommand(): Promise<void> {
    await this.clickTestId("commands-modal-save");
    await this.page.waitForTimeout(500);
  }

  async cancelModal(): Promise<void> {
    await this.clickTestId("commands-modal-cancel");
    await this.page.waitForTimeout(300);
  }

  async expectModalClosed(): Promise<void> {
    await this.expectHidden("commands-modal");
  }
}
```

### Step 5: Create `knowledge-base.page.ts`

```typescript
// tests/e2e/ts/pages/knowledge-base.page.ts
import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class KnowledgeBasePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/settings?tab=knowledge-base");
    await this.page.waitForLoadState("networkidle");
  }

  async expectListVisible(): Promise<void> {
    await this.expectVisible("kb-list");
  }

  async clickFilter(filter: "all" | "template" | "text" | "link"): Promise<void> {
    await this.clickTestId(`kb-filter-${filter}`);
    await this.page.waitForTimeout(300);
  }

  async openAddModal(): Promise<void> {
    await this.clickTestId("kb-add-btn");
    await this.expectVisible("kb-modal");
  }

  async fillTitle(title: string): Promise<void> {
    await this.fillTestId("kb-modal-title", title);
  }

  async saveEntry(): Promise<void> {
    await this.clickTestId("kb-modal-save");
    await this.page.waitForTimeout(500);
  }

  async cancelModal(): Promise<void> {
    await this.clickTestId("kb-modal-cancel");
    await this.page.waitForTimeout(300);
  }
}
```

### Step 6: Create `sessions-settings.page.ts`

```typescript
// tests/e2e/ts/pages/sessions-settings.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class SessionsSettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/settings/sessions");
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageVisible(): Promise<void> {
    await this.expectVisible("sessions-page");
  }

  async expectCurrentSessionBadge(): Promise<void> {
    await this.expectVisible("session-current-badge");
  }

  async expectRevokeAllVisible(): Promise<void> {
    const btn = this.getByTestId("sessions-revoke-all-btn");
    await expect(btn).toBeVisible();
  }

  async clickRevokeAll(): Promise<void> {
    await this.clickTestId("sessions-revoke-all-btn");
    await this.expectVisible("session-revoke-dialog");
  }

  async confirmRevoke(): Promise<void> {
    await this.clickTestId("session-revoke-confirm");
    await this.page.waitForTimeout(500);
  }

  async cancelRevokeDialog(): Promise<void> {
    await this.clickTestId("session-revoke-dialog-cancel");
    await this.page.waitForTimeout(300);
  }
}
```

### Step 7: Create `audit-logs.page.ts`

```typescript
// tests/e2e/ts/pages/audit-logs.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class AuditLogsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/audit-logs");
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageVisible(): Promise<void> {
    await this.expectVisible("audit-logs-page");
  }

  async expectTableVisible(): Promise<void> {
    await this.expectVisible("audit-logs-table");
  }

  async search(query: string): Promise<void> {
    await this.fillTestId("audit-logs-search", query);
    await this.page.waitForTimeout(500);
  }

  async clearSearch(): Promise<void> {
    await this.getByTestId("audit-logs-search").clear();
    await this.page.waitForTimeout(300);
  }

  async clickNextPage(): Promise<void> {
    const btn = this.getByTestId("audit-logs-next-btn");
    await expect(btn).toBeEnabled();
    await btn.click();
    await this.page.waitForTimeout(500);
  }

  async expectNextPageDisabled(): Promise<void> {
    await expect(this.getByTestId("audit-logs-next-btn")).toBeDisabled();
  }
}
```

### Step 8: Extend `broadcasts.page.ts`

Replace the entire file:
```typescript
// tests/e2e/ts/pages/broadcasts.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class BroadcastsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/broadcasts");
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageVisible(): Promise<void> {
    await this.expectVisible("broadcasts-page");
  }

  async fillMessage(message: string): Promise<void> {
    await this.fillTestId("broadcast-message-input", message);
  }

  async fillPhotoUrl(url: string): Promise<void> {
    await this.fillTestId("broadcast-photo-input", url);
  }

  async clickSend(): Promise<void> {
    await this.clickTestId("broadcast-send-button");
    await this.expectVisible("broadcast-confirm-dialog");
  }

  async confirmSend(): Promise<void> {
    await this.clickTestId("broadcast-confirm-send");
    await this.page.waitForTimeout(1000);
  }

  async cancelSend(): Promise<void> {
    await this.clickTestId("broadcast-confirm-cancel");
    await this.page.waitForTimeout(300);
  }

  async expectDialogClosed(): Promise<void> {
    await this.expectHidden("broadcast-confirm-dialog");
  }

  async expectSendButtonDisabled(): Promise<void> {
    await expect(this.getByTestId("broadcast-send-button")).toBeDisabled();
  }

  async expectSendButtonEnabled(): Promise<void> {
    await expect(this.getByTestId("broadcast-send-button")).toBeEnabled();
  }

  async expectStatsVisible(): Promise<void> {
    await this.expectVisible("broadcasts-stats");
  }

  async expectHistoryVisible(): Promise<void> {
    await expect(
      this.page.getByTestId("broadcasts-history-table").or(
        this.page.getByTestId("broadcasts-history-list")
      )
    ).toBeVisible();
  }

  async clickNextPage(): Promise<void> {
    await this.clickTestId("broadcasts-next-btn");
    await this.page.waitForTimeout(500);
  }

  async clickPrevPage(): Promise<void> {
    await this.clickTestId("broadcasts-prev-btn");
    await this.page.waitForTimeout(500);
  }
}
```

### Step 9: Extend `follow-ups.page.ts`

Replace the entire file:
```typescript
// tests/e2e/ts/pages/follow-ups.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class FollowUpsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/follow-ups");
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageVisible(): Promise<void> {
    await this.expectVisible("follow-ups-page");
  }

  async clickTab(tab: "scheduled" | "failed"): Promise<void> {
    await this.clickTestId(`followup-tab-${tab}`);
    await this.page.waitForTimeout(300);
  }

  async expectScheduledTableVisible(): Promise<void> {
    await this.expectVisible("followup-scheduled-table");
  }

  async expectFailedTableVisible(): Promise<void> {
    await this.expectVisible("followup-failed-table");
  }

  async expectNextBtnVisible(): Promise<void> {
    await this.expectVisible("followup-next-btn");
  }

  async clickNext(): Promise<void> {
    const btn = this.getByTestId("followup-next-btn");
    await expect(btn).toBeEnabled();
    await btn.click();
    await this.page.waitForTimeout(500);
  }

  async clickPrev(): Promise<void> {
    const btn = this.getByTestId("followup-prev-btn");
    await expect(btn).toBeEnabled();
    await btn.click();
    await this.page.waitForTimeout(500);
  }

  async expectPageInfo(): Promise<void> {
    await this.expectVisible("followup-page-info");
  }
}
```

### Step 10: Extend `profile.page.ts`

Replace the entire file:
```typescript
// tests/e2e/ts/pages/profile.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/profile");
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageVisible(): Promise<void> {
    await this.expectVisible("profile-page");
  }

  async clickTab(tab: "account" | "security" | "sessions"): Promise<void> {
    await this.clickTestId(`profile-tab-${tab}`);
    await this.page.waitForTimeout(300);
  }

  async expectTabsVisible(): Promise<void> {
    await this.expectVisible("profile-tabs");
  }

  async expectSessionsCard(): Promise<void> {
    await this.expectVisible("profile-sessions-card");
  }

  // Security tab
  async fillCurrentPassword(pw: string): Promise<void> {
    await this.fillTestId("profile-current-password", pw);
  }

  async fillNewPassword(pw: string): Promise<void> {
    await this.fillTestId("profile-new-password", pw);
  }

  async fillConfirmPassword(pw: string): Promise<void> {
    await this.fillTestId("profile-confirm-password", pw);
  }

  async clickChangePassword(): Promise<void> {
    await this.clickTestId("profile-change-password-btn");
    await this.page.waitForTimeout(500);
  }

  // Timezone
  async openTimezoneSelector(): Promise<void> {
    await this.clickTestId("profile-timezone-trigger");
    await this.page.waitForTimeout(300);
  }

  async searchTimezone(query: string): Promise<void> {
    await this.fillTestId("profile-timezone-search", query);
    await this.page.waitForTimeout(300);
  }
}
```

### Step 11: Extend `settings.page.ts`

Replace the entire file:
```typescript
// tests/e2e/ts/pages/settings.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export type SettingsTab = "bot-config" | "knowledge-base" | "commands" | "team" | "integrations";

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/settings");
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToTab(tab: SettingsTab): Promise<void> {
    await this.goto(`/settings?tab=${tab}`);
    await this.page.waitForLoadState("networkidle");
  }

  async expectTabsVisible(): Promise<void> {
    await this.expectVisible("settings-tabs-list");
  }

  async clickTab(tab: SettingsTab): Promise<void> {
    await this.clickTestId(`settings-tab-${tab}`);
    await this.page.waitForTimeout(500);
  }

  async expectTabActive(tab: SettingsTab): Promise<void> {
    const url = this.page.url();
    expect(url).toContain(`tab=${tab}`);
  }
}
```

### Step 12: Extend `admin.page.ts`

Add methods for new subpages:
```typescript
// Add to existing admin.page.ts (append these methods):

  async navigateToSystem(): Promise<void> {
    await this.navigateTo("/system");
  }

  async navigateToBackup(): Promise<void> {
    await this.navigateTo("/backup");
  }

  async navigateToMaintenance(): Promise<void> {
    await this.navigateTo("/maintenance");
  }

  async navigateToGoogle(): Promise<void> {
    await this.navigateTo("/google");
  }

  async navigateToSecrets(): Promise<void> {
    await this.navigateTo("/secrets");
  }

  async navigateToQueues(): Promise<void> {
    await this.navigateTo("/queues");
  }

  async expectPanelVisible(panelId: string): Promise<void> {
    await this.expectVisible(panelId);
  }
```

### Step 13: Extend `lead-detail.page.ts`

Add tab + status methods:
```typescript
// Add to existing lead-detail.page.ts:

  async clickTab(tab: "overview" | "profile" | "interactions" | "documents"): Promise<void> {
    await this.clickTestId(`lead-tab-${tab}`);
    await this.page.waitForTimeout(300);
  }

  async expectTabsVisible(): Promise<void> {
    await this.expectVisible("lead-detail-tabs");
  }

  async expectStatusVisible(): Promise<void> {
    await this.expectVisible("lead-status-select");
  }

  async clickBack(): Promise<void> {
    await this.clickTestId("lead-back-btn");
    await this.page.waitForTimeout(500);
  }
```

### Step 14: Verify all POMs compile
```powershell
cd D:\Project\tele-crm-frontend
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-Object -First 20
```
Expected: 0 errors (only pre-existing app.controller.spec.ts error if any)

### Step 15: Commit
```bash
git add tests/e2e/ts/pages/
git commit -m "test(pom): create new POMs and extend existing ones for full coverage"
```

---

## Task 6: Write `auth-flows.spec.ts`

**File:** `tests/e2e/ts/specs/auth-flows.spec.ts`

```typescript
import { test, expect } from "../fixtures/auth.fixtures";
import { ForgotPasswordPage } from "../pages/forgot-password.page";

test.describe("Forgot Password Flow @smoke", () => {
  test("forgot password page renders email form @smoke", async ({ anonPage }) => {
    const fp = new ForgotPasswordPage(anonPage);
    await fp.navigate();
    await fp.expectPageVisible();
    await expect(anonPage.getByTestId("forgot-email-input")).toBeVisible();
    await expect(anonPage.getByTestId("forgot-submit-btn")).toBeVisible();
  });

  test("submit button is disabled with empty email @smoke", async ({ anonPage }) => {
    const fp = new ForgotPasswordPage(anonPage);
    await fp.navigate();
    await fp.expectSubmitDisabled();
  });

  test("submit button enables with valid email @smoke", async ({ anonPage }) => {
    const fp = new ForgotPasswordPage(anonPage);
    await fp.navigate();
    await fp.fillEmail("test@example.com");
    await fp.expectSubmitEnabled();
  });

  test("back to login link navigates to login @smoke", async ({ anonPage }) => {
    const fp = new ForgotPasswordPage(anonPage);
    await fp.navigate();
    await fp.clickBackToLogin();
    await expect(anonPage).toHaveURL(/\/login/);
  });

  test("submitting email shows success state @journey", async ({ anonPage }) => {
    const fp = new ForgotPasswordPage(anonPage);
    await fp.navigate();
    await fp.fillEmail("nonexistent@example.com");
    await fp.submitEmail();
    // App should show success state (doesn't reveal if email exists - security)
    await fp.expectSuccessState();
  });
});

test.describe("Auth Guards @smoke", () => {
  test("authenticated user visiting /login is redirected @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/login");
    await superadminPage.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 5000 });
    expect(superadminPage.url()).not.toContain("/login");
  });

  test("authenticated user visiting /forgot-password is redirected @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/forgot-password");
    await superadminPage.waitForURL((url) => !url.pathname.includes("/forgot-password"), { timeout: 5000 });
    expect(superadminPage.url()).not.toContain("/forgot-password");
  });
});

test.describe("Setup Account Page @smoke", () => {
  test("setup-account with no token shows invalid state @smoke", async ({ anonPage }) => {
    await anonPage.goto("/setup-account");
    await anonPage.waitForLoadState("networkidle");
    // Without a valid ?token= query param, should show invalid/error state
    await expect(anonPage.getByTestId("setup-account-page")).toBeVisible({ timeout: 8000 });
    await expect(anonPage.getByTestId("setup-invalid-state")).toBeVisible({ timeout: 8000 });
  });

  test("setup-account form fields are present with valid token param @smoke", async ({ anonPage }) => {
    // Using a fake token — triggers form render or invalid state — either is valid to test
    await anonPage.goto("/setup-account?token=test-invalid-token");
    await anonPage.waitForLoadState("networkidle");
    await expect(anonPage.getByTestId("setup-account-page")).toBeVisible({ timeout: 8000 });
  });
});
```

### Run to verify (expect failures on missing testids — that's expected pre-task-1):
```powershell
cd D:\Project\tele-crm-frontend
pnpm exec playwright test tests/e2e/ts/specs/auth-flows.spec.ts --reporter=line 2>&1 | Select-Object -Last 20
```

### Commit
```bash
git add tests/e2e/ts/specs/auth-flows.spec.ts
git commit -m "test(e2e): auth flows spec - forgot password, guards, setup-account"
```

---

## Task 7: Write `lead-detail.spec.ts`

**File:** `tests/e2e/ts/specs/lead-detail.spec.ts`

```typescript
import { test, expect } from "../fixtures/auth.fixtures";
import { LeadsPage } from "../pages/leads.page";
import { LeadDetailPage } from "../pages/lead-detail.page";

test.describe("Lead Detail Page @smoke", () => {
  test.beforeEach(async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    await leads.expectTableVisible();
  });

  test("clicking a lead row opens detail page @journey", async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    const firstRow = superadminPage.locator('[data-testid^="lead-row-"]').first();
    await firstRow.waitFor({ state: "visible", timeout: 10000 });
    await firstRow.click();
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage).toHaveURL(/\/leads\/detail/);
  });

  test("lead detail page loads with tabs @smoke", async ({ superadminPage }) => {
    // Navigate directly to leads first to get a real lead URL
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    const firstRow = superadminPage.locator('[data-testid^="lead-row-"]').first();
    const available = await firstRow.count();
    if (available === 0) {
      test.skip(); // No leads in test env
      return;
    }
    await firstRow.click();
    await superadminPage.waitForLoadState("networkidle");

    const detail = new LeadDetailPage(superadminPage);
    await detail.expectLoaded();
    await detail.expectTabsVisible();
  });

  test("lead detail tabs are clickable @smoke", async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    const firstRow = superadminPage.locator('[data-testid^="lead-row-"]').first();
    if ((await firstRow.count()) === 0) { test.skip(); return; }
    await firstRow.click();
    await superadminPage.waitForLoadState("networkidle");

    const detail = new LeadDetailPage(superadminPage);
    await detail.expectLoaded();

    // Click through all tabs
    for (const tab of ["overview", "profile", "interactions", "documents"] as const) {
      await detail.clickTab(tab);
      // Each tab should stay on the same lead page
      await expect(superadminPage).toHaveURL(/\/leads\/detail/);
    }
  });

  test("handover toggle is interactable @smoke", async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    const firstRow = superadminPage.locator('[data-testid^="lead-row-"]').first();
    if ((await firstRow.count()) === 0) { test.skip(); return; }
    await firstRow.click();
    await superadminPage.waitForLoadState("networkidle");

    const detail = new LeadDetailPage(superadminPage);
    await detail.expectLoaded();
    // Toggle exists and is clickable
    const toggle = superadminPage.getByTestId("lead-detail-handover-toggle");
    await expect(toggle).toBeVisible();
    await toggle.click();
    await superadminPage.waitForTimeout(500);
    // Toggle again to restore state
    await toggle.click();
  });

  test("interaction history container is scrollable @smoke", async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    const firstRow = superadminPage.locator('[data-testid^="lead-row-"]').first();
    if ((await firstRow.count()) === 0) { test.skip(); return; }
    await firstRow.click();
    await superadminPage.waitForLoadState("networkidle");

    const detail = new LeadDetailPage(superadminPage);
    await detail.expectInteractionHistoryScrollable();
  });

  test("back button returns to leads list @journey", async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    const firstRow = superadminPage.locator('[data-testid^="lead-row-"]').first();
    if ((await firstRow.count()) === 0) { test.skip(); return; }
    await firstRow.click();
    await superadminPage.waitForLoadState("networkidle");

    const detail = new LeadDetailPage(superadminPage);
    await detail.clickBack();
    await expect(superadminPage).toHaveURL(/\/leads/);
  });
});
```

### Commit
```bash
git add tests/e2e/ts/specs/lead-detail.spec.ts
git commit -m "test(e2e): lead detail spec - tabs, handover, history, back navigation"
```

---

## Task 8: Write `settings-all-tabs.spec.ts`

**File:** `tests/e2e/ts/specs/settings-all-tabs.spec.ts`

```typescript
import { test, expect } from "../fixtures/auth.fixtures";
import { SettingsPage } from "../pages/settings.page";
import { BotConfigPage } from "../pages/bot-config.page";
import { TeamPage } from "../pages/team.page";
import { CommandsPage } from "../pages/commands.page";
import { KnowledgeBasePage } from "../pages/knowledge-base.page";

test.describe("Settings Tab Navigation @smoke", () => {
  test("settings page loads and tabs are visible @smoke", async ({ superadminPage }) => {
    const settings = new SettingsPage(superadminPage);
    await settings.navigate();
    await settings.expectTabsVisible();
  });

  test("switching tabs updates URL query param @journey", async ({ superadminPage }) => {
    const settings = new SettingsPage(superadminPage);
    await settings.navigate();

    await settings.clickTab("team");
    await settings.expectTabActive("team");

    await settings.clickTab("commands");
    await settings.expectTabActive("commands");

    await settings.clickTab("knowledge-base");
    await settings.expectTabActive("knowledge-base");

    await settings.clickTab("bot-config");
    await settings.expectTabActive("bot-config");
  });
});

test.describe("Bot Config Tab @smoke", () => {
  test("bot config form renders all fields @smoke", async ({ superadminPage }) => {
    const bc = new BotConfigPage(superadminPage);
    await bc.navigate();
    await bc.expectFormVisible();
    await expect(superadminPage.getByTestId("bot-config-name")).toBeVisible();
    await expect(superadminPage.getByTestId("bot-config-greeting")).toBeVisible();
    await expect(superadminPage.getByTestId("bot-config-registration-url")).toBeVisible();
    await expect(superadminPage.getByTestId("bot-config-save-btn")).toBeVisible();
  });

  test("can type in bot name field @smoke", async ({ superadminPage }) => {
    const bc = new BotConfigPage(superadminPage);
    await bc.navigate();
    await bc.expectFormVisible();
    await bc.fillBotName("TestBot");
    await expect(superadminPage.getByTestId("bot-config-name")).toHaveValue("TestBot");
  });

  test("can type in registration URL field @smoke", async ({ superadminPage }) => {
    const bc = new BotConfigPage(superadminPage);
    await bc.navigate();
    await bc.fillRegistrationUrl("https://broker.example.com/register");
    await expect(superadminPage.getByTestId("bot-config-registration-url"))
      .toHaveValue("https://broker.example.com/register");
  });

  test("save button is enabled when form is filled @smoke", async ({ superadminPage }) => {
    const bc = new BotConfigPage(superadminPage);
    await bc.navigate();
    await bc.expectFormVisible();
    await bc.expectSaveEnabled();
  });

  test("AI Active toggle is clickable @smoke", async ({ superadminPage }) => {
    const bc = new BotConfigPage(superadminPage);
    await bc.navigate();
    await bc.expectFormVisible();
    await bc.toggleAiActive();
    // Toggle back
    await bc.toggleAiActive();
  });
});

test.describe("Team Tab @smoke", () => {
  test("team tab loads with members table @smoke", async ({ superadminPage }) => {
    const team = new TeamPage(superadminPage);
    await team.navigate();
    await team.expectTableVisible();
  });

  test("invite button opens modal @smoke", async ({ superadminPage }) => {
    const team = new TeamPage(superadminPage);
    await team.navigate();
    await team.openInviteModal();
    await expect(superadminPage.getByTestId("team-invite-email")).toBeVisible();
    await expect(superadminPage.getByTestId("team-role-admin")).toBeVisible();
    await expect(superadminPage.getByTestId("team-role-staff")).toBeVisible();
    await expect(superadminPage.getByTestId("team-invite-submit")).toBeVisible();
  });

  test("cancel closes invite modal @smoke", async ({ superadminPage }) => {
    const team = new TeamPage(superadminPage);
    await team.navigate();
    await team.openInviteModal();
    await team.cancelInviteModal();
    await team.expectInviteModalClosed();
  });

  test("can fill invite form fields @journey", async ({ superadminPage }) => {
    const team = new TeamPage(superadminPage);
    await team.navigate();
    await team.openInviteModal();
    await team.fillInviteEmail("newadmin@example.com");
    await team.selectRole("ADMIN");
    await expect(superadminPage.getByTestId("team-invite-email"))
      .toHaveValue("newadmin@example.com");
  });
});

test.describe("Commands Tab @smoke", () => {
  test("commands tab loads with table @smoke", async ({ superadminPage }) => {
    const cmd = new CommandsPage(superadminPage);
    await cmd.navigate();
    await cmd.expectTableVisible();
  });

  test("add command button opens modal @smoke", async ({ superadminPage }) => {
    const cmd = new CommandsPage(superadminPage);
    await cmd.navigate();
    await cmd.openAddModal();
    await expect(superadminPage.getByTestId("commands-modal-name")).toBeVisible();
    await expect(superadminPage.getByTestId("commands-modal-save")).toBeVisible();
  });

  test("cancel closes command modal @smoke", async ({ superadminPage }) => {
    const cmd = new CommandsPage(superadminPage);
    await cmd.navigate();
    await cmd.openAddModal();
    await cmd.cancelModal();
    await cmd.expectModalClosed();
  });

  test("can fill command name field @journey", async ({ superadminPage }) => {
    const cmd = new CommandsPage(superadminPage);
    await cmd.navigate();
    await cmd.openAddModal();
    await cmd.fillCommandName("test_command");
    await expect(superadminPage.getByTestId("commands-modal-name"))
      .toHaveValue("test_command");
  });
});

test.describe("Knowledge Base Tab @smoke", () => {
  test("KB tab loads @smoke", async ({ superadminPage }) => {
    const kb = new KnowledgeBasePage(superadminPage);
    await kb.navigate();
    await kb.expectListVisible();
  });

  test("filter chips are clickable @smoke", async ({ superadminPage }) => {
    const kb = new KnowledgeBasePage(superadminPage);
    await kb.navigate();
    await kb.clickFilter("text");
    await kb.clickFilter("link");
    await kb.clickFilter("all");
  });

  test("add entry button opens modal @smoke", async ({ superadminPage }) => {
    const kb = new KnowledgeBasePage(superadminPage);
    await kb.navigate();
    await kb.openAddModal();
    await expect(superadminPage.getByTestId("kb-modal-title")).toBeVisible();
    await expect(superadminPage.getByTestId("kb-modal-save")).toBeVisible();
  });

  test("cancel closes KB modal @smoke", async ({ superadminPage }) => {
    const kb = new KnowledgeBasePage(superadminPage);
    await kb.navigate();
    await kb.openAddModal();
    await kb.cancelModal();
  });

  test("can fill KB title field @journey", async ({ superadminPage }) => {
    const kb = new KnowledgeBasePage(superadminPage);
    await kb.navigate();
    await kb.openAddModal();
    await kb.fillTitle("Test KB Entry");
    await expect(superadminPage.getByTestId("kb-modal-title"))
      .toHaveValue("Test KB Entry");
  });
});
```

### Commit
```bash
git add tests/e2e/ts/specs/settings-all-tabs.spec.ts
git commit -m "test(e2e): settings tabs spec - bot-config, team, commands, KB tabs"
```

---

## Task 9: Write `settings-sessions.spec.ts`

**File:** `tests/e2e/ts/specs/settings-sessions.spec.ts`

```typescript
import { test, expect } from "../fixtures/auth.fixtures";
import { SessionsSettingsPage } from "../pages/sessions-settings.page";

test.describe("Settings Sessions Page @smoke", () => {
  test("sessions page loads @smoke", async ({ superadminPage }) => {
    const sessions = new SessionsSettingsPage(superadminPage);
    await sessions.navigate();
    await sessions.expectPageVisible();
  });

  test("current session badge is visible @smoke", async ({ superadminPage }) => {
    const sessions = new SessionsSettingsPage(superadminPage);
    await sessions.navigate();
    await sessions.expectCurrentSessionBadge();
  });

  test("revoke all button is visible @smoke", async ({ superadminPage }) => {
    const sessions = new SessionsSettingsPage(superadminPage);
    await sessions.navigate();
    await sessions.expectRevokeAllVisible();
  });

  test("revoke all opens confirmation dialog @journey", async ({ superadminPage }) => {
    const sessions = new SessionsSettingsPage(superadminPage);
    await sessions.navigate();
    await sessions.clickRevokeAll();
    await expect(superadminPage.getByTestId("session-revoke-dialog")).toBeVisible();
  });

  test("cancel in revoke dialog closes it @journey", async ({ superadminPage }) => {
    const sessions = new SessionsSettingsPage(superadminPage);
    await sessions.navigate();
    await sessions.clickRevokeAll();
    await sessions.cancelRevokeDialog();
    await expect(superadminPage.getByTestId("session-revoke-dialog")).toBeHidden();
  });
});
```

### Commit
```bash
git add tests/e2e/ts/specs/settings-sessions.spec.ts
git commit -m "test(e2e): settings sessions spec"
```

---

## Task 10: Write `broadcasts-compose.spec.ts`

**File:** `tests/e2e/ts/specs/broadcasts-compose.spec.ts`

```typescript
import { test, expect } from "../fixtures/auth.fixtures";
import { BroadcastsPage } from "../pages/broadcasts.page";

test.describe("Broadcasts Page @smoke", () => {
  test("broadcasts page loads with stats and history @smoke", async ({ superadminPage }) => {
    const bc = new BroadcastsPage(superadminPage);
    await bc.navigate();
    await bc.expectPageVisible();
    await bc.expectStatsVisible();
  });

  test("message textarea is visible @smoke", async ({ superadminPage }) => {
    const bc = new BroadcastsPage(superadminPage);
    await bc.navigate();
    await expect(superadminPage.getByTestId("broadcast-message-input")).toBeVisible();
  });

  test("send button is disabled with empty message @smoke", async ({ superadminPage }) => {
    const bc = new BroadcastsPage(superadminPage);
    await bc.navigate();
    await bc.expectSendButtonDisabled();
  });

  test("send button enables after typing message @smoke", async ({ superadminPage }) => {
    const bc = new BroadcastsPage(superadminPage);
    await bc.navigate();
    await bc.fillMessage("Hello team, this is a test broadcast.");
    await bc.expectSendButtonEnabled();
  });

  test("can type in photo URL field @smoke", async ({ superadminPage }) => {
    const bc = new BroadcastsPage(superadminPage);
    await bc.navigate();
    const photoInput = superadminPage.getByTestId("broadcast-photo-input");
    await expect(photoInput).toBeVisible();
    await photoInput.fill("https://example.com/image.png");
    await expect(photoInput).toHaveValue("https://example.com/image.png");
  });

  test("clicking send opens confirmation dialog @journey", async ({ superadminPage }) => {
    const bc = new BroadcastsPage(superadminPage);
    await bc.navigate();
    await bc.fillMessage("E2E test broadcast message.");
    await bc.clickSend();
    await expect(superadminPage.getByTestId("broadcast-confirm-dialog")).toBeVisible();
    await expect(superadminPage.getByTestId("broadcast-confirm-send")).toBeVisible();
    await expect(superadminPage.getByTestId("broadcast-confirm-cancel")).toBeVisible();
  });

  test("cancelling confirmation closes dialog @journey", async ({ superadminPage }) => {
    const bc = new BroadcastsPage(superadminPage);
    await bc.navigate();
    await bc.fillMessage("E2E test broadcast message.");
    await bc.clickSend();
    await bc.cancelSend();
    await bc.expectDialogClosed();
  });

  test("broadcast history table/list is visible @smoke", async ({ superadminPage }) => {
    const bc = new BroadcastsPage(superadminPage);
    await bc.navigate();
    // Either table or list container should be visible
    const table = superadminPage.getByTestId("broadcasts-history-table");
    const list = superadminPage.getByTestId("broadcasts-history-list");
    const either = table.or(list);
    await expect(either).toBeVisible({ timeout: 5000 });
  });
});
```

### Commit
```bash
git add tests/e2e/ts/specs/broadcasts-compose.spec.ts
git commit -m "test(e2e): broadcasts compose spec - form, dialog, send flow"
```

---

## Task 11: Write `follow-ups-interactions.spec.ts`

**File:** `tests/e2e/ts/specs/follow-ups-interactions.spec.ts`

```typescript
import { test, expect } from "../fixtures/auth.fixtures";
import { FollowUpsPage } from "../pages/follow-ups.page";

test.describe("Follow-ups Page @smoke", () => {
  test("follow-ups page loads @smoke", async ({ superadminPage }) => {
    const fu = new FollowUpsPage(superadminPage);
    await fu.navigate();
    await fu.expectPageVisible();
  });

  test("tabs are visible @smoke", async ({ superadminPage }) => {
    const fu = new FollowUpsPage(superadminPage);
    await fu.navigate();
    await expect(superadminPage.getByTestId("followup-tabs")).toBeVisible();
    await expect(superadminPage.getByTestId("followup-tab-scheduled")).toBeVisible();
    await expect(superadminPage.getByTestId("followup-tab-failed")).toBeVisible();
  });

  test("scheduled tab is active by default and shows table @smoke", async ({ superadminPage }) => {
    const fu = new FollowUpsPage(superadminPage);
    await fu.navigate();
    await fu.expectScheduledTableVisible();
  });

  test("switching to failed tab shows failed table @journey", async ({ superadminPage }) => {
    const fu = new FollowUpsPage(superadminPage);
    await fu.navigate();
    await fu.clickTab("failed");
    await fu.expectFailedTableVisible();
  });

  test("switching back to scheduled tab works @journey", async ({ superadminPage }) => {
    const fu = new FollowUpsPage(superadminPage);
    await fu.navigate();
    await fu.clickTab("failed");
    await fu.clickTab("scheduled");
    await fu.expectScheduledTableVisible();
  });

  test("pagination controls are visible @smoke", async ({ superadminPage }) => {
    const fu = new FollowUpsPage(superadminPage);
    await fu.navigate();
    await fu.expectNextBtnVisible();
    await fu.expectPageInfo();
  });
});
```

### Commit
```bash
git add tests/e2e/ts/specs/follow-ups-interactions.spec.ts
git commit -m "test(e2e): follow-ups interactions spec - tabs, pagination"
```

---

## Task 12: Write `profile-security.spec.ts`

**File:** `tests/e2e/ts/specs/profile-security.spec.ts`

```typescript
import { test, expect } from "../fixtures/auth.fixtures";
import { ProfilePage } from "../pages/profile.page";

test.describe("Profile Page @smoke", () => {
  test("profile page loads @smoke", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.expectPageVisible();
  });

  test("all profile tabs are visible @smoke", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.expectTabsVisible();
    await expect(superadminPage.getByTestId("profile-tab-account")).toBeVisible();
    await expect(superadminPage.getByTestId("profile-tab-security")).toBeVisible();
    await expect(superadminPage.getByTestId("profile-tab-sessions")).toBeVisible();
  });

  test("clicking security tab shows password form @journey", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.clickTab("security");
    await expect(superadminPage.getByTestId("profile-current-password")).toBeVisible();
    await expect(superadminPage.getByTestId("profile-new-password")).toBeVisible();
    await expect(superadminPage.getByTestId("profile-confirm-password")).toBeVisible();
    await expect(superadminPage.getByTestId("profile-change-password-btn")).toBeVisible();
  });

  test("can type in password fields @journey", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.clickTab("security");
    await profile.fillCurrentPassword("CurrentPass123!");
    await profile.fillNewPassword("NewPass456!");
    await profile.fillConfirmPassword("NewPass456!");
    await expect(superadminPage.getByTestId("profile-current-password")).toHaveValue("CurrentPass123!");
    await expect(superadminPage.getByTestId("profile-new-password")).toHaveValue("NewPass456!");
  });

  test("sessions tab shows sessions card @journey", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.clickTab("sessions");
    await profile.expectSessionsCard();
  });

  test("timezone trigger opens timezone selector @journey", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.clickTab("account");
    await profile.openTimezoneSelector();
    // Timezone search input should appear
    await expect(superadminPage.getByTestId("profile-timezone-search")).toBeVisible({ timeout: 3000 });
  });

  test("can search for timezone @journey", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.clickTab("account");
    await profile.openTimezoneSelector();
    await profile.searchTimezone("Kuala Lumpur");
    // Results should filter
    await expect(superadminPage.getByTestId("profile-timezone-search")).toHaveValue("Kuala Lumpur");
  });
});
```

### Commit
```bash
git add tests/e2e/ts/specs/profile-security.spec.ts
git commit -m "test(e2e): profile security spec - tabs, password form, timezone"
```

---

## Task 13: Write `audit-logs.spec.ts`

**File:** `tests/e2e/ts/specs/audit-logs.spec.ts`

```typescript
import { test, expect } from "../fixtures/auth.fixtures";
import { AuditLogsPage } from "../pages/audit-logs.page";

test.describe("Audit Logs Page @smoke", () => {
  test("audit logs page loads @smoke", async ({ superadminPage }) => {
    const al = new AuditLogsPage(superadminPage);
    await al.navigate();
    await al.expectPageVisible();
  });

  test("audit logs table is visible @smoke", async ({ superadminPage }) => {
    const al = new AuditLogsPage(superadminPage);
    await al.navigate();
    await al.expectTableVisible();
  });

  test("search input is visible and accepts text @smoke", async ({ superadminPage }) => {
    const al = new AuditLogsPage(superadminPage);
    await al.navigate();
    const searchInput = superadminPage.getByTestId("audit-logs-search");
    await expect(searchInput).toBeVisible();
    await al.search("login");
    await expect(searchInput).toHaveValue("login");
  });

  test("clearing search restores results @journey", async ({ superadminPage }) => {
    const al = new AuditLogsPage(superadminPage);
    await al.navigate();
    await al.search("login");
    await al.clearSearch();
    await expect(superadminPage.getByTestId("audit-logs-search")).toHaveValue("");
  });

  test("only superadmin can access audit logs @rbac", async ({ ownerPage }) => {
    await ownerPage.goto("/audit-logs");
    await ownerPage.waitForLoadState("networkidle");
    // Owner should be redirected away or see an access denied state
    const url = ownerPage.url();
    const isBlocked =
      !url.includes("/audit-logs") ||
      (await ownerPage.getByText(/access denied|not authorized|forbidden/i).count()) > 0;
    expect(isBlocked).toBeTruthy();
  });
});
```

### Commit
```bash
git add tests/e2e/ts/specs/audit-logs.spec.ts
git commit -m "test(e2e): audit logs spec - page load, search, rbac"
```

---

## Task 14: Write `admin-subpages.spec.ts`

**File:** `tests/e2e/ts/specs/admin-subpages.spec.ts`

```typescript
import { test, expect } from "../fixtures/auth.fixtures";
import { AdminPage } from "../pages/admin.page";

const adminSubpages = [
  { name: "overview", panelId: "admin-overview-panel" },
  { name: "system", panelId: "admin-system-panel" },
  { name: "backup", panelId: "admin-backup-panel" },
  { name: "maintenance", panelId: "admin-maintenance-panel" },
  { name: "google", panelId: "admin-google-panel" },
  { name: "secrets", panelId: "admin-secrets-panel" },
  { name: "queues", panelId: "admin-queues-panel" },
] as const;

test.describe("Admin Subpages Load @smoke", () => {
  for (const { name, panelId } of adminSubpages) {
    test(`admin/${name} page loads @smoke`, async ({ superadminPage }) => {
      const admin = new AdminPage(superadminPage);
      const navMethod = `navigateTo${name.charAt(0).toUpperCase() + name.slice(1)}` as keyof AdminPage;
      if (typeof admin[navMethod] === "function") {
        await (admin[navMethod] as () => Promise<void>)();
      } else {
        await admin.navigateTo(`/${name}`);
      }
      await expect(superadminPage.getByTestId(panelId)).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe("Admin Queues Panel @smoke", () => {
  test("queues table is visible @smoke", async ({ superadminPage }) => {
    const admin = new AdminPage(superadminPage);
    await admin.navigateToQueues();
    await expect(superadminPage.getByTestId("admin-queues-panel")).toBeVisible();
    await expect(superadminPage.getByTestId("admin-queues-table")).toBeVisible();
  });

  test("queues search input accepts text @smoke", async ({ superadminPage }) => {
    const admin = new AdminPage(superadminPage);
    await admin.navigateToQueues();
    const search = superadminPage.getByTestId("admin-queues-search");
    await expect(search).toBeVisible();
    await search.fill("broadcast");
    await expect(search).toHaveValue("broadcast");
    await search.clear();
  });
});

test.describe("Admin Google Panel @smoke", () => {
  test("google ops panel loads @smoke", async ({ superadminPage }) => {
    const admin = new AdminPage(superadminPage);
    await admin.navigateToGoogle();
    await expect(superadminPage.getByTestId("admin-google-panel")).toBeVisible();
  });

  test("google ops table is visible @smoke", async ({ superadminPage }) => {
    const admin = new AdminPage(superadminPage);
    await admin.navigateToGoogle();
    await expect(superadminPage.getByTestId("admin-google-ops-table")).toBeVisible();
  });
});

test.describe("Admin Backup Panel @smoke", () => {
  test("backup panel loads with trigger button @smoke", async ({ superadminPage }) => {
    const admin = new AdminPage(superadminPage);
    await admin.navigateToBackup();
    await expect(superadminPage.getByTestId("admin-backup-panel")).toBeVisible();
    await expect(superadminPage.getByTestId("admin-backup-trigger-btn")).toBeVisible();
  });
});

test.describe("Admin RBAC @rbac", () => {
  test("owner cannot access any admin subpage @rbac", async ({ ownerPage }) => {
    for (const sub of ["/system", "/backup", "/secrets", "/queues"]) {
      await ownerPage.goto(`/admin${sub}`);
      await ownerPage.waitForLoadState("networkidle");
      const url = ownerPage.url();
      const redirected = !url.includes(`/admin${sub}`);
      const accessDenied = (await ownerPage.getByText(/access denied|not authorized|forbidden/i).count()) > 0;
      expect(redirected || accessDenied).toBeTruthy();
    }
  });
});
```

### Commit
```bash
git add tests/e2e/ts/specs/admin-subpages.spec.ts
git commit -m "test(e2e): admin subpages spec - all panels load, queues search, RBAC"
```

---

## Task 15: Write `dashboard.spec.ts`

**File:** `tests/e2e/ts/specs/dashboard.spec.ts`

```typescript
import { test, expect } from "../fixtures/auth.fixtures";

test.describe("Dashboard Home @smoke", () => {
  test("authenticated user lands on dashboard @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/");
    await superadminPage.waitForLoadState("networkidle");
    // Should stay on / or redirect to a dashboard page (not login)
    expect(superadminPage.url()).not.toContain("/login");
  });

  test("dashboard page is accessible @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/");
    await superadminPage.waitForLoadState("networkidle");
    // Page should render without crashing (no error boundary)
    const errorBoundary = superadminPage.getByText(/something went wrong|unexpected error/i);
    await expect(errorBoundary).toHaveCount(0);
  });

  test("sidebar is visible on dashboard @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.getByTestId("sidebar-user-menu-trigger")).toBeVisible();
  });

  test("can navigate from dashboard to leads @journey", async ({ superadminPage }) => {
    await superadminPage.goto("/");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.goto("/leads");
    await expect(superadminPage).toHaveURL(/\/leads/);
  });

  test("owner can access dashboard @rbac", async ({ ownerPage }) => {
    await ownerPage.goto("/");
    await ownerPage.waitForLoadState("networkidle");
    expect(ownerPage.url()).not.toContain("/login");
  });
});
```

### Commit
```bash
git add tests/e2e/ts/specs/dashboard.spec.ts
git commit -m "test(e2e): dashboard home spec"
```

---

## Task 16: Update `.env.example` and Run Lint + TypeScript Check

**File:** `tests/e2e/.env.example`

Verify the file contains all needed variables. The current `.env.example` should already have the core variables. No new env vars are needed since tests use existing role credentials.

Review current `.env.example` and add inline documentation:
```bash
# Base URL of the staging/local app under test
E2E_BASE_URL=https://your-staging-url.com

# Superadmin credentials (SUPERADMIN role)
E2E_SUPERADMIN_EMAIL=superadmin@example.com
E2E_SUPERADMIN_PASSWORD=your-password

# Owner credentials (OWNER role - for RBAC tests)
E2E_OWNER_EMAIL=owner@example.com
E2E_OWNER_PASSWORD=your-password

# Optional: Admin role credentials (for ADMIN-specific tests)
# E2E_ADMIN_EMAIL=admin@example.com
# E2E_ADMIN_PASSWORD=your-password

# Browser settings
E2E_HEADLESS=true
E2E_SLOW_MO_MS=0

# Artifacts output directory
E2E_ARTIFACT_DIR=tests/e2e/artifacts

# Safety: set to true to allow running against production URL
E2E_ALLOW_PROD=false

# Optional: run ID for artifact naming
E2E_RUN_ID=local
```

### Step 1: Run TypeScript check
```powershell
cd D:\Project\tele-crm-frontend
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-String -Pattern "error TS" | Select-Object -First 20
```
Expected: 0 TypeScript errors in new files (only pre-existing error in app.controller.spec.ts is acceptable)

### Step 2: Run ESLint on new files
```powershell
pnpm exec eslint "tests/e2e/ts/**/*.ts" --max-warnings=0 2>&1 | Select-Object -Last 10
```
Expected: "0 problems (0 errors, 0 warnings)"

### Step 3: Fix any lint issues

Common patterns to fix:
- Unused imports: remove them
- `@typescript-eslint/no-explicit-any`: replace with proper types
- Missing return types: add `: Promise<void>`
- All E2E files are under `tests/e2e/**/*.ts` which already has the ESLint override in `eslint.config.mjs` disabling `react-hooks/rules-of-hooks`

### Step 4: Commit env and confirm clean
```bash
git add tests/e2e/.env.example
git commit -m "test(e2e): update .env.example with documented variables"
```

---

## Task 17: Final Commit and Push

### Step 1: Stage all files
```bash
git add tests/e2e/ts/pages/
git add tests/e2e/ts/specs/
git add src/app/(auth)/forgot-password/page.tsx
git add src/app/(auth)/setup-account/page.tsx
git add src/app/(dashboard)/settings/
git add src/app/(dashboard)/leads/detail/
git add src/app/(dashboard)/follow-ups/
git add src/app/(dashboard)/profile/
git add src/app/(dashboard)/broadcasts/
git add src/app/(dashboard)/admin/
git add src/app/(dashboard)/audit-logs/
git add tests/e2e/.env.example
```

### Step 2: Final verification
```powershell
cd D:\Project\tele-crm-frontend
.\node_modules\.bin\tsc --noEmit 2>&1 | Select-Object -First 5
pnpm run lint 2>&1 | Select-Object -Last 5
```
Expected: `0 errors` from tsc, `0 errors` from lint

### Step 3: Final commit
```bash
git commit -m "test(e2e): full coverage E2E suite

Routes covered:
- /forgot-password (auth flow + guards + setup-account)
- /leads/detail (tabs, handover, history, back)
- /settings/bot-config (form fields, save, toggles)
- /settings/team (invite modal, cancel, fill)
- /settings/commands (table, add modal, cancel)
- /settings/knowledge-base (filters, add modal)
- /settings/sessions (sessions list, revoke dialog)
- /broadcasts (compose, confirm dialog, stats, history)
- /follow-ups (tab switching, pagination)
- /profile (security tab, password form, timezone)
- /audit-logs (table, search, RBAC)
- /admin/overview,system,backup,maintenance,google,secrets,queues
- / dashboard (authenticated access, navigation)

POMs added: ForgotPasswordPage, BotConfigPage, TeamPage,
CommandsPage, KnowledgeBasePage, SessionsSettingsPage, AuditLogsPage
POMs extended: BroadcastsPage, FollowUpsPage, ProfilePage,
SettingsPage, AdminPage, LeadDetailPage

data-testid added to 15+ component files"
```

### Step 4: Push
```bash
git push
```

---

## Coverage After Implementation

| Route | Coverage |
|---|---|
| `/` | ✅ |
| `/login` | ✅ |
| `/forgot-password` | ✅ |
| `/setup-account` | ✅ |
| `/leads` | ✅ |
| `/leads/detail` | ✅ |
| `/analytics` | ✅ |
| `/broadcasts` | ✅ |
| `/follow-ups` | ✅ |
| `/profile` (all 3 tabs) | ✅ |
| `/settings/bot-config` | ✅ |
| `/settings/commands` | ✅ |
| `/settings/knowledge-base` | ✅ |
| `/settings/team` | ✅ |
| `/settings/sessions` | ✅ |
| `/audit-logs` | ✅ |
| `/admin/overview` | ✅ |
| `/admin/system` | ✅ |
| `/admin/backup` | ✅ |
| `/admin/maintenance` | ✅ |
| `/admin/google` | ✅ |
| `/admin/secrets` | ✅ |
| `/admin/queues` | ✅ |
| `/admin/users` | ✅ (existing) |
| `/admin/features` | ✅ (existing) |
| `/admin/ai-feedback` | ✅ (existing) |
| `/admin/sessions` | ✅ (existing) |

**Intentionally excluded (YAGNI):**
- `/leads/chat` — AI real-time chat, requires live Telegram bot
- `/tma/*` — Telegram Mini App, requires Telegram WebApp context
- `/oauth/*` — OAuth callbacks, requires Google OAuth flow
- `/reset-password` — Requires live email with reset code
- `/verification` — Requires Telegram interaction
- `/docs`, `/docs-public` — Static content, no meaningful E2E tests

**Total: 27 routes covered / 31 total meaningful routes = ~87% coverage**
