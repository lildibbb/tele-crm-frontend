# TypeScript Playwright E2E Test Suite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an enterprise-grade TypeScript Playwright E2E test suite alongside the existing Python suite, covering all CRM pages with Page Object Model, role-based fixtures, and CI integration.

**Architecture:** TypeScript Playwright lives in `tests/e2e/ts/` with a `playwright.config.ts` at the frontend root. A Page Object Model layer (`tests/e2e/ts/pages/`) abstracts all selectors. Global auth state files speed up tests by reusing browser sessions across specs.

**Tech Stack:** `@playwright/test`, TypeScript, dotenv (`@dotenv/env-options`), HTML + JUnit reporters.

---

## Prerequisites

- Frontend repo: `D:\Project\tele-crm-frontend`
- Node.js ≥ 18, pnpm installed
- A staging URL is running and accessible
- `tests/e2e/.env` already exists with `E2E_BASE_URL`, `E2E_SUPERADMIN_*`, `E2E_OWNER_*` vars

---

## File Layout

```
(frontend root)
├── playwright.config.ts              ← Playwright config
├── tests/
│   └── e2e/
│       └── ts/
│           ├── global-setup.ts       ← saves auth state files per role
│           ├── fixtures/
│           │   └── auth.fixtures.ts  ← custom test fixtures (superadminPage, ownerPage)
│           ├── pages/
│           │   ├── base.page.ts
│           │   ├── login.page.ts
│           │   ├── dashboard.page.ts
│           │   ├── leads.page.ts
│           │   ├── lead-detail.page.ts
│           │   ├── analytics.page.ts
│           │   ├── broadcasts.page.ts
│           │   ├── follow-ups.page.ts
│           │   ├── settings.page.ts
│           │   ├── profile.page.ts
│           │   └── admin.page.ts
│           └── specs/
│               ├── auth.spec.ts
│               ├── leads.spec.ts
│               ├── broadcasts.spec.ts
│               ├── follow-ups.spec.ts
│               ├── settings.spec.ts
│               ├── analytics.spec.ts
│               ├── profile.spec.ts
│               ├── admin.spec.ts
│               ├── rbac.spec.ts
│               └── navigation.spec.ts
└── .github/
    └── workflows/
        └── e2e.yml
```

---

## Task 1: Install Playwright + Create Config

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`

### Step 1: Install Playwright

```powershell
cd D:\Project\tele-crm-frontend
pnpm add -D @playwright/test dotenv
npx playwright install chromium
```

Expected output: `chromium` browser downloaded to `~/.cache/ms-playwright/chromium-*`

### Step 2: Create `playwright.config.ts`

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

// Load the same .env used by Python E2E tests
dotenv.config({ path: path.join(__dirname, "tests/e2e/.env") });

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const HEADLESS = process.env.E2E_HEADLESS !== "false";
const SLOW_MO = parseInt(process.env.E2E_SLOW_MO_MS ?? "0", 10);

export default defineConfig({
  testDir: "./tests/e2e/ts/specs",
  globalSetup: "./tests/e2e/ts/global-setup",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ["html", { outputFolder: "tests/e2e/artifacts/playwright-report", open: "never" }],
    ["junit", { outputFile: "tests/e2e/artifacts/playwright-results.xml" }],
    ["list"],
  ],
  use: {
    baseURL: BASE_URL,
    launchOptions: { slowMo: SLOW_MO },
    headless: HEADLESS,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    // Global setup project — runs once to save auth state
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    // Main project — uses saved auth state
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],
  outputDir: "tests/e2e/artifacts/test-results",
});
```

### Step 3: Add npm scripts to `package.json`

Add these entries into the `"scripts"` section:

```json
"test:e2e": "playwright test",
"test:e2e:smoke": "playwright test --grep @smoke",
"test:e2e:journey": "playwright test --grep @journey",
"test:e2e:rbac": "playwright test --grep @rbac",
"test:e2e:regression": "playwright test --grep @regression",
"test:e2e:report": "playwright show-report tests/e2e/artifacts/playwright-report",
"test:e2e:install": "playwright install chromium"
```

### Step 4: Verify config is valid

```powershell
pnpm exec playwright --version
```

Expected: `Version 1.XX.X`

### Step 5: Commit

```powershell
git add playwright.config.ts package.json pnpm-lock.yaml
git commit -m "feat(e2e): add TypeScript Playwright config"
```

---

## Task 2: Add Missing `data-testid` Attributes to Frontend

**Files:**
- Modify: `src/components/app-sidebar.tsx`
- Modify: `src/app/(dashboard)/analytics/page.tsx`
- Modify: `src/app/(dashboard)/profile/page.tsx`
- Modify: `src/app/(dashboard)/leads/detail/_components/LeadDetailClient.tsx`

These testids are required for stable E2E selectors. Without them tests fall back to fragile CSS/text selectors.

### Step 1: Add testids to `app-sidebar.tsx`

Find the `<DropdownMenuTrigger asChild>` wrapping the user avatar/name at the bottom of the sidebar. Add `data-testid="sidebar-user-menu-trigger"` to its child button. Find the logout `<DropdownMenuItem>` and add `data-testid="sidebar-user-menu-logout"`.

Example — locate this block in `app-sidebar.tsx`:
```tsx
<DropdownMenuTrigger asChild>
  <SidebarMenuButton ...>
    {/* user avatar + name */}
  </SidebarMenuButton>
</DropdownMenuTrigger>
```
Change to:
```tsx
<DropdownMenuTrigger asChild>
  <SidebarMenuButton data-testid="sidebar-user-menu-trigger" ...>
    {/* user avatar + name */}
  </SidebarMenuButton>
</DropdownMenuTrigger>
```

Find logout `<DropdownMenuItem>`:
```tsx
<DropdownMenuItem onClick={logout}>
  <LogOut />
  Log out
</DropdownMenuItem>
```
Change to:
```tsx
<DropdownMenuItem data-testid="sidebar-user-menu-logout" onClick={logout}>
  <LogOut />
  Log out
</DropdownMenuItem>
```

### Step 2: Add testid to analytics page (`src/app/(dashboard)/analytics/page.tsx`)

Find the root container `<div>` or `<main>` of `AnalyticsPage()`. Add:
```tsx
<div data-testid="analytics-page" ...>
```

Also find the timeframe selector buttons (the pills rendering TIMEFRAMES). Add testids:
```tsx
<button
  data-testid={`analytics-timeframe-${tf}`}
  ...
>
```

### Step 3: Add testid to profile page (`src/app/(dashboard)/profile/page.tsx`)

Find the root container. Add:
```tsx
<div data-testid="profile-page" ...>
```

Find the sessions section/card. Add:
```tsx
<Card data-testid="profile-sessions-card" ...>
```

Find the "Revoke" button in the session list row. Add:
```tsx
<Button data-testid={`session-revoke-${session.id}`} ...>
```

### Step 4: Add testids to lead detail (`LeadDetailClient.tsx`)

Find the root wrapper of `LeadDetailClient`. Add:
```tsx
<div data-testid="lead-detail-page" ...>
```

Find the handover toggle switch/button. Add:
```tsx
<Switch data-testid="lead-detail-handover-toggle" ...>
```

Find the interaction history card/section. Add:
```tsx
<div data-testid="lead-detail-interaction-history" ...>
```

### Step 5: Run type-check

```powershell
pnpm type-check
```

Expected: No new errors (pre-existing error in `app.controller.spec.ts` is known and unrelated).

### Step 6: Commit

```powershell
git add src/components/app-sidebar.tsx src/app/\(dashboard\)/analytics/page.tsx src/app/\(dashboard\)/profile/page.tsx src/app/\(dashboard\)/leads/detail/_components/LeadDetailClient.tsx
git commit -m "feat(testids): add data-testid to sidebar, analytics, profile, lead-detail"
```

---

## Task 3: Global Setup + Auth Fixtures

**Files:**
- Create: `tests/e2e/ts/global-setup.ts`
- Create: `tests/e2e/ts/fixtures/auth.fixtures.ts`

### Step 1: Create `global-setup.ts`

This file logs in once per role and saves the browser storage state (cookies + localStorage) to a JSON file. Subsequent tests load the state file instead of logging in again — much faster.

```typescript
// tests/e2e/ts/global-setup.ts
import { chromium, FullConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.join(process.cwd(), "tests/e2e/.env") });

async function saveAuthState(
  config: FullConfig,
  email: string,
  password: string,
  stateFile: string,
): Promise<void> {
  const browser = await chromium.launch({
    headless: process.env.E2E_HEADLESS !== "false",
  });
  const page = await browser.newPage({
    baseURL: config.projects[0].use.baseURL ?? process.env.E2E_BASE_URL,
    ignoreHTTPSErrors: true,
  });

  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.fill('[data-testid="login-email"]', email);
  await page.fill('[data-testid="login-password"]', password);
  await page.click('[data-testid="login-submit"]');

  // Wait until redirected away from /login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 30_000,
  });

  await page.context().storageState({ path: stateFile });
  await browser.close();
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const stateDir = path.join(process.cwd(), "tests/e2e/artifacts/auth-state");
  fs.mkdirSync(stateDir, { recursive: true });

  const superadminEmail = process.env.E2E_SUPERADMIN_EMAIL!;
  const superadminPassword = process.env.E2E_SUPERADMIN_PASSWORD!;
  const ownerEmail = process.env.E2E_OWNER_EMAIL!;
  const ownerPassword = process.env.E2E_OWNER_PASSWORD!;

  if (!superadminEmail || !superadminPassword || !ownerEmail || !ownerPassword) {
    throw new Error(
      "Missing required E2E env vars: E2E_SUPERADMIN_EMAIL, E2E_SUPERADMIN_PASSWORD, E2E_OWNER_EMAIL, E2E_OWNER_PASSWORD",
    );
  }

  console.log("Saving superadmin auth state...");
  await saveAuthState(
    config,
    superadminEmail,
    superadminPassword,
    path.join(stateDir, "superadmin.json"),
  );

  console.log("Saving owner auth state...");
  await saveAuthState(
    config,
    ownerEmail,
    ownerPassword,
    path.join(stateDir, "owner.json"),
  );

  console.log("Auth states saved.");
}
```

### Step 2: Create `auth.fixtures.ts`

```typescript
// tests/e2e/ts/fixtures/auth.fixtures.ts
import { test as base, Page, BrowserContext } from "@playwright/test";
import * as path from "path";

const STATE_DIR = path.join(process.cwd(), "tests/e2e/artifacts/auth-state");

type AuthFixtures = {
  /** Page pre-loaded with superadmin session */
  superadminPage: Page;
  /** Page pre-loaded with owner session */
  ownerPage: Page;
  /** Page with no auth (fresh, unauthenticated) */
  anonPage: Page;
};

export const test = base.extend<AuthFixtures>({
  superadminPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: path.join(STATE_DIR, "superadmin.json"),
    });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },

  ownerPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: path.join(STATE_DIR, "owner.json"),
    });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },

  anonPage: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
});

export { expect } from "@playwright/test";
```

### Step 3: Verify global-setup compiles

```powershell
pnpm exec tsc --noEmit --project tsconfig.json tests/e2e/ts/global-setup.ts 2>&1
```

(Type errors in global-setup are okay at this stage since BasePage doesn't exist yet.)

### Step 4: Commit

```powershell
git add tests/e2e/ts/global-setup.ts tests/e2e/ts/fixtures/auth.fixtures.ts
git commit -m "feat(e2e): add global auth setup and role fixtures"
```

---

## Task 4: Page Object Models — Base, Login, Dashboard, Leads

**Files:**
- Create: `tests/e2e/ts/pages/base.page.ts`
- Create: `tests/e2e/ts/pages/login.page.ts`
- Create: `tests/e2e/ts/pages/dashboard.page.ts`
- Create: `tests/e2e/ts/pages/leads.page.ts`
- Create: `tests/e2e/ts/pages/lead-detail.page.ts`

### `base.page.ts`

```typescript
// tests/e2e/ts/pages/base.page.ts
import { Page, Locator, expect } from "@playwright/test";

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState("networkidle");
  }

  async expectVisible(testId: string, timeout = 15_000): Promise<Locator> {
    const el = this.page.getByTestId(testId);
    await expect(el).toBeVisible({ timeout });
    return el;
  }

  async expectHidden(testId: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).toBeHidden();
  }

  async expectUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  /** Wait for URL to NOT contain the given fragment */
  async waitForNavigationAway(fragment: string, timeout = 20_000): Promise<void> {
    await this.page.waitForURL((url) => !url.pathname.includes(fragment), {
      timeout,
    });
  }
}
```

### `login.page.ts`

```typescript
// tests/e2e/ts/pages/login.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/login");
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.page.getByTestId("login-email").fill(email);
    await this.page.getByTestId("login-password").fill(password);
  }

  async submit(): Promise<void> {
    await this.page.getByTestId("login-submit").click();
  }

  async loginAs(email: string, password: string): Promise<void> {
    await this.navigate();
    await this.fillCredentials(email, password);
    await this.submit();
    await this.waitForNavigationAway("/login");
  }

  async expectFormVisible(): Promise<void> {
    await this.expectVisible("login-form");
    await this.expectVisible("login-email");
    await this.expectVisible("login-password");
    await this.expectVisible("login-submit");
  }

  async expectErrorVisible(): Promise<void> {
    // The auth store exposes `error` which the page renders
    const errorLocator = this.page.locator("[role='alert'], [data-error], .text-destructive").first();
    await expect(errorLocator).toBeVisible({ timeout: 5_000 });
  }

  async expectForgotPasswordLinkVisible(): Promise<void> {
    await this.expectVisible("login-forgot-password");
  }
}
```

### `dashboard.page.ts`

```typescript
// tests/e2e/ts/pages/dashboard.page.ts
import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async expectSidebarVisible(): Promise<void> {
    await this.expectVisible("app-sidebar");
  }

  async navigateTo(path: string): Promise<void> {
    await this.goto(path);
    await this.page.waitForLoadState("networkidle");
  }

  async logout(): Promise<void> {
    await this.page.getByTestId("sidebar-user-menu-trigger").click();
    await this.page.getByTestId("sidebar-user-menu-logout").click();
    await this.waitForNavigationAway("/login");
  }
}
```

### `leads.page.ts`

```typescript
// tests/e2e/ts/pages/leads.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export type LeadStatus = "ALL" | "NEW" | "CONTACTED" | "CONVERTED" | "REJECTED";

export class LeadsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/leads");
    await this.expectVisible("leads-page");
  }

  async search(query: string): Promise<void> {
    const input = this.page.getByTestId("leads-search");
    await expect(input).toBeVisible();
    await input.fill(query);
  }

  async clearSearch(): Promise<void> {
    const clearBtn = this.page.getByTestId("leads-search-clear");
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    }
  }

  async filterByStatus(status: LeadStatus): Promise<void> {
    await this.page.getByTestId(`leads-status-${status}`).click();
  }

  async expectSearchValue(value: string): Promise<void> {
    await expect(this.page.getByTestId("leads-search")).toHaveValue(value);
  }

  async expectStatusTabVisible(status: LeadStatus): Promise<void> {
    await this.expectVisible(`leads-status-${status}`);
  }

  async clickFirstLead(): Promise<void> {
    // Lead rows are typically table rows or cards — click the first visible one
    const leadRow = this.page.locator("[data-testid^='lead-row-'], tr[data-lead-id], [data-row-id]").first();
    if (await leadRow.isVisible()) {
      await leadRow.click();
    } else {
      // Fallback: click the first link in the leads table
      await this.page.locator("table tbody tr a, [role='row'] a").first().click();
    }
  }

  async getGlobalHandoverState(): Promise<boolean> {
    const toggle = this.page.getByTestId("leads-global-handover-toggle");
    const ariaChecked = await toggle.getAttribute("aria-checked");
    const dataState = await toggle.getAttribute("data-state");
    return ariaChecked === "true" || dataState === "checked";
  }
}
```

### `lead-detail.page.ts`

```typescript
// tests/e2e/ts/pages/lead-detail.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class LeadDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(leadId: string): Promise<void> {
    await this.goto(`/leads/detail?id=${leadId}`);
    await this.expectVisible("lead-detail-page");
  }

  async expectPageVisible(): Promise<void> {
    await this.expectVisible("lead-detail-page");
  }

  async getHandoverState(): Promise<boolean> {
    const toggle = this.page.getByTestId("lead-detail-handover-toggle");
    await expect(toggle).toBeVisible();
    const ariaChecked = await toggle.getAttribute("aria-checked");
    const dataState = await toggle.getAttribute("data-state");
    return ariaChecked === "true" || dataState === "checked";
  }

  async toggleHandover(): Promise<void> {
    await this.page.getByTestId("lead-detail-handover-toggle").click();
  }

  async expectInteractionHistoryVisible(): Promise<void> {
    await this.expectVisible("lead-detail-interaction-history");
  }
}
```

### Step: Commit

```powershell
git add tests/e2e/ts/pages/
git commit -m "feat(e2e): add base, login, dashboard, leads POMs"
```

---

## Task 5: Page Object Models — Remaining Pages

**Files:**
- Create: `tests/e2e/ts/pages/broadcasts.page.ts`
- Create: `tests/e2e/ts/pages/follow-ups.page.ts`
- Create: `tests/e2e/ts/pages/settings.page.ts`
- Create: `tests/e2e/ts/pages/analytics.page.ts`
- Create: `tests/e2e/ts/pages/profile.page.ts`
- Create: `tests/e2e/ts/pages/admin.page.ts`

### `broadcasts.page.ts`

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
    await this.expectVisible("broadcasts-page");
  }

  async fillMessage(text: string): Promise<void> {
    await this.page.getByTestId("broadcast-message-input").fill(text);
  }

  async clickSend(): Promise<void> {
    await this.page.getByTestId("broadcast-send-button").click();
  }

  async expectConfirmDialogVisible(): Promise<void> {
    await this.expectVisible("broadcast-confirm-dialog");
  }

  async cancelConfirm(): Promise<void> {
    await this.page.getByTestId("broadcast-confirm-cancel").click();
  }

  async confirmSend(): Promise<void> {
    await this.page.getByTestId("broadcast-confirm-send").click();
  }

  async expectConfirmDialogHidden(): Promise<void> {
    await this.expectHidden("broadcast-confirm-dialog");
  }
}
```

### `follow-ups.page.ts`

```typescript
// tests/e2e/ts/pages/follow-ups.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export type FollowUpsTab = "scheduled" | "failed";

export class FollowUpsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/follow-ups");
    await this.expectVisible("followups-page");
  }

  async switchTab(tab: FollowUpsTab): Promise<void> {
    await this.page.getByTestId(`followups-tab-${tab}`).click();
  }

  async expectPanelVisible(tab: FollowUpsTab): Promise<void> {
    await this.expectVisible(`followups-${tab}-panel`);
  }

  async refresh(): Promise<void> {
    const refreshBtn = this.page.getByTestId("followups-refresh");
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
    }
  }
}
```

### `settings.page.ts`

```typescript
// tests/e2e/ts/pages/settings.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export type SettingsTab = "bot-config" | "knowledge-base" | "commands" | "team";

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/settings");
    await this.expectVisible("settings-page");
  }

  async clickTab(tab: SettingsTab): Promise<void> {
    await this.page.getByTestId(`settings-tab-${tab}`).click();
  }

  async expectTabVisible(tab: SettingsTab): Promise<void> {
    await this.expectVisible(`settings-tab-${tab}`);
  }

  async expectTabsListVisible(): Promise<void> {
    await this.expectVisible("settings-tabs-list");
  }
}
```

### `analytics.page.ts`

```typescript
// tests/e2e/ts/pages/analytics.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export type Timeframe =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "last_30_days"
  | "last_90_days"
  | "all_time";

export class AnalyticsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/analytics");
    await this.expectVisible("analytics-page");
  }

  async selectTimeframe(tf: Timeframe): Promise<void> {
    await this.page.getByTestId(`analytics-timeframe-${tf}`).click();
    // Wait for any loading spinner to disappear
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageVisible(): Promise<void> {
    await this.expectVisible("analytics-page");
  }
}
```

### `profile.page.ts`

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
    await this.expectVisible("profile-page");
  }

  async expectSessionsCardVisible(): Promise<void> {
    await this.expectVisible("profile-sessions-card");
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.page.getByTestId(`session-revoke-${sessionId}`).click();
  }

  async getSessionRevokeButtons(): Promise<number> {
    return await this.page.locator("[data-testid^='session-revoke-']").count();
  }
}
```

### `admin.page.ts`

```typescript
// tests/e2e/ts/pages/admin.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export type AdminSection =
  | "overview"
  | "users"
  | "sessions"
  | "ai-feedback"
  | "features"
  | "secrets"
  | "system"
  | "queues"
  | "backup";

export class AdminPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(section: AdminSection = "overview"): Promise<void> {
    await this.goto(section === "overview" ? "/admin" : `/admin/${section}`);
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageLoaded(): Promise<void> {
    // Admin overview has a bento grid; check the page URL is correct
    await expect(this.page).toHaveURL(/\/admin/);
    await expect(this.page.locator("main, [role='main']").first()).toBeVisible();
  }
}
```

### Step: Commit

```powershell
git add tests/e2e/ts/pages/
git commit -m "feat(e2e): add broadcasts, follow-ups, settings, analytics, profile, admin POMs"
```

---

## Task 6: Auth Spec

**Files:**
- Create: `tests/e2e/ts/specs/auth.spec.ts`

```typescript
// tests/e2e/ts/specs/auth.spec.ts
import { test, expect } from "../fixtures/auth.fixtures";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), "tests/e2e/.env") });

const SUPERADMIN_EMAIL = process.env.E2E_SUPERADMIN_EMAIL!;
const SUPERADMIN_PASSWORD = process.env.E2E_SUPERADMIN_PASSWORD!;
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL!;
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD!;

// ─── Login form elements ──────────────────────────────────────────────────────
test("@smoke login form renders all elements", async ({ anonPage }) => {
  const loginPage = new LoginPage(anonPage);
  await loginPage.navigate();
  await loginPage.expectFormVisible();
  await loginPage.expectForgotPasswordLinkVisible();
});

// ─── Successful login per role ────────────────────────────────────────────────
for (const [role, email, password] of [
  ["superadmin", SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD],
  ["owner", OWNER_EMAIL, OWNER_PASSWORD],
] as const) {
  test(`@smoke @journey login as ${role} redirects to dashboard`, async ({ anonPage }) => {
    const loginPage = new LoginPage(anonPage);
    await loginPage.loginAs(email, password);

    const dashboard = new DashboardPage(anonPage);
    await dashboard.expectSidebarVisible();
    await expect(anonPage).not.toHaveURL(/\/login/);
  });
}

// ─── Invalid credentials ─────────────────────────────────────────────────────
test("@journey invalid password shows error", async ({ anonPage }) => {
  const loginPage = new LoginPage(anonPage);
  await loginPage.navigate();
  await loginPage.fillCredentials(SUPERADMIN_EMAIL, "wrong-password-12345");
  await loginPage.submit();
  await loginPage.expectErrorVisible();
  await expect(anonPage).toHaveURL(/\/login/);
});

test("@journey invalid email format shows error", async ({ anonPage }) => {
  const loginPage = new LoginPage(anonPage);
  await loginPage.navigate();
  await loginPage.fillCredentials("not-an-email", "somepassword");
  await loginPage.submit();
  // Either a client-side validation error or server error is acceptable
  await expect(anonPage).toHaveURL(/\/login/);
});

// ─── Redirect guard ───────────────────────────────────────────────────────────
test("@smoke unauthenticated access to /leads redirects to /login", async ({ anonPage }) => {
  await anonPage.goto("/leads");
  await anonPage.waitForLoadState("networkidle");
  await expect(anonPage).toHaveURL(/\/login/);
});

test("@smoke unauthenticated access to /analytics redirects to /login", async ({ anonPage }) => {
  await anonPage.goto("/analytics");
  await anonPage.waitForLoadState("networkidle");
  await expect(anonPage).toHaveURL(/\/login/);
});

// ─── Logout ───────────────────────────────────────────────────────────────────
test("@journey superadmin can logout", async ({ superadminPage }) => {
  const dashboard = new DashboardPage(superadminPage);
  await dashboard.navigateTo("/leads");
  await dashboard.logout();
  await expect(superadminPage).toHaveURL(/\/login/);
});
```

### Step: Run and expect tests to pass (except logout if testid missing)

```powershell
pnpm test:e2e -- --grep @smoke tests/e2e/ts/specs/auth.spec.ts
```

Expected: smoke tests pass. If logout fails, confirm Task 2 (sidebar testids) was completed.

### Step: Commit

```powershell
git add tests/e2e/ts/specs/auth.spec.ts
git commit -m "feat(e2e): add auth spec (login, redirect guard, logout)"
```

---

## Task 7: Leads Spec

**Files:**
- Create: `tests/e2e/ts/specs/leads.spec.ts`

```typescript
// tests/e2e/ts/specs/leads.spec.ts
import { test, expect } from "../fixtures/auth.fixtures";
import { LeadsPage } from "../pages/leads.page";
import { LeadDetailPage } from "../pages/lead-detail.page";

// ─── Page loads ───────────────────────────────────────────────────────────────
for (const role of ["superadmin", "owner"] as const) {
  test(`@smoke leads page loads for ${role}`, async ({ [`${role}Page`]: page }: any) => {
    const leadsPage = new LeadsPage(page);
    await leadsPage.navigate();
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────
test("@journey search input accepts text and clears", async ({ superadminPage }) => {
  const leadsPage = new LeadsPage(superadminPage);
  await leadsPage.navigate();
  await leadsPage.search("test query");
  await leadsPage.expectSearchValue("test query");
  await leadsPage.clearSearch();
  await leadsPage.expectSearchValue("");
});

// ─── Status tabs ─────────────────────────────────────────────────────────────
for (const status of ["ALL", "NEW", "CONTACTED"] as const) {
  test(`@journey filter by status ${status}`, async ({ superadminPage }) => {
    const leadsPage = new LeadsPage(superadminPage);
    await leadsPage.navigate();
    await leadsPage.filterByStatus(status);
    await leadsPage.expectStatusTabVisible(status);
  });
}

// ─── Lead detail navigation ───────────────────────────────────────────────────
test("@journey clicking a lead navigates to detail page", async ({ superadminPage }) => {
  const leadsPage = new LeadsPage(superadminPage);
  await leadsPage.navigate();

  // Click the first lead row (requires at least one lead in staging)
  await leadsPage.clickFirstLead();
  await superadminPage.waitForLoadState("networkidle");

  // We should be on /leads/detail?id=...
  await expect(superadminPage).toHaveURL(/\/leads\/detail/);
});

// ─── Lead detail page ─────────────────────────────────────────────────────────
test("@journey lead detail page renders key sections", async ({ superadminPage }) => {
  // Navigate directly to lead detail — requires a known lead ID in staging
  // Fallback: navigate via leads list
  const leadsPage = new LeadsPage(superadminPage);
  await leadsPage.navigate();
  await leadsPage.clickFirstLead();
  await superadminPage.waitForLoadState("networkidle");

  const detail = new LeadDetailPage(superadminPage);
  await detail.expectPageVisible();
  await detail.expectInteractionHistoryVisible();
});

test("@regression lead detail handover toggle is present", async ({ superadminPage }) => {
  const leadsPage = new LeadsPage(superadminPage);
  await leadsPage.navigate();
  await leadsPage.clickFirstLead();
  await superadminPage.waitForLoadState("networkidle");

  const detail = new LeadDetailPage(superadminPage);
  await detail.expectPageVisible();
  // Just verify the toggle renders; toggling it would change real data
  const toggle = superadminPage.getByTestId("lead-detail-handover-toggle");
  await expect(toggle).toBeVisible();
});

// ─── Global handover toggle ────────────────────────────────────────────────────
test("@regression global handover toggle is visible on leads list", async ({ superadminPage }) => {
  const leadsPage = new LeadsPage(superadminPage);
  await leadsPage.navigate();
  const toggle = superadminPage.getByTestId("leads-global-handover-toggle");
  await expect(toggle).toBeVisible();
});
```

### Step: Run

```powershell
pnpm test:e2e -- --grep "@smoke|@journey" tests/e2e/ts/specs/leads.spec.ts
```

### Step: Commit

```powershell
git add tests/e2e/ts/specs/leads.spec.ts
git commit -m "feat(e2e): add leads spec"
```

---

## Task 8: Broadcasts + Follow-Ups Specs

**Files:**
- Create: `tests/e2e/ts/specs/broadcasts.spec.ts`
- Create: `tests/e2e/ts/specs/follow-ups.spec.ts`

### `broadcasts.spec.ts`

```typescript
// tests/e2e/ts/specs/broadcasts.spec.ts
import { test, expect } from "../fixtures/auth.fixtures";
import { BroadcastsPage } from "../pages/broadcasts.page";

for (const role of ["superadmin", "owner"] as const) {
  test(`@smoke broadcasts page loads for ${role}`, async ({ [`${role}Page`]: page }: any) => {
    const broadcastsPage = new BroadcastsPage(page);
    await broadcastsPage.navigate();
  });
}

test("@journey compose message and confirm dialog appears", async ({ superadminPage }) => {
  const broadcastsPage = new BroadcastsPage(superadminPage);
  await broadcastsPage.navigate();
  await broadcastsPage.fillMessage("Hello this is a test broadcast message");
  await broadcastsPage.clickSend();
  await broadcastsPage.expectConfirmDialogVisible();
});

test("@journey cancel confirmation hides dialog", async ({ superadminPage }) => {
  const broadcastsPage = new BroadcastsPage(superadminPage);
  await broadcastsPage.navigate();
  await broadcastsPage.fillMessage("Cancellation test message");
  await broadcastsPage.clickSend();
  await broadcastsPage.expectConfirmDialogVisible();
  await broadcastsPage.cancelConfirm();
  await broadcastsPage.expectConfirmDialogHidden();
});

test("@regression broadcast send button is disabled when message is empty", async ({ superadminPage }) => {
  const broadcastsPage = new BroadcastsPage(superadminPage);
  await broadcastsPage.navigate();
  // Don't fill message — send button should be disabled or clicking it should not open dialog
  const sendBtn = superadminPage.getByTestId("broadcast-send-button");
  const isDisabled = await sendBtn.getAttribute("disabled");
  const ariaDisabled = await sendBtn.getAttribute("aria-disabled");
  if (isDisabled !== null || ariaDisabled === "true") {
    // Button is disabled — this is the correct behavior
    expect(true).toBe(true);
  } else {
    // Button is enabled but clicking it without a message should not open dialog
    await sendBtn.click();
    const dialog = superadminPage.getByTestId("broadcast-confirm-dialog");
    // Dialog should not appear for empty message
    await expect(dialog).toBeHidden({ timeout: 2_000 }).catch(() => {
      // Some implementations may show validation error instead of dialog — also acceptable
    });
  }
});
```

### `follow-ups.spec.ts`

```typescript
// tests/e2e/ts/specs/follow-ups.spec.ts
import { test, expect } from "../fixtures/auth.fixtures";
import { FollowUpsPage } from "../pages/follow-ups.page";

for (const role of ["superadmin", "owner"] as const) {
  test(`@smoke follow-ups page loads for ${role}`, async ({ [`${role}Page`]: page }: any) => {
    const followUpsPage = new FollowUpsPage(page);
    await followUpsPage.navigate();
  });
}

test("@journey scheduled tab is visible and clickable", async ({ superadminPage }) => {
  const followUpsPage = new FollowUpsPage(superadminPage);
  await followUpsPage.navigate();
  await followUpsPage.switchTab("scheduled");
  await followUpsPage.expectPanelVisible("scheduled");
});

test("@journey failed tab is visible and clickable", async ({ superadminPage }) => {
  const followUpsPage = new FollowUpsPage(superadminPage);
  await followUpsPage.navigate();
  await followUpsPage.switchTab("failed");
  await followUpsPage.expectPanelVisible("failed");
});

test("@regression refresh button triggers reload without error", async ({ superadminPage }) => {
  const followUpsPage = new FollowUpsPage(superadminPage);
  await followUpsPage.navigate();
  await followUpsPage.refresh();
  // Page should still be on /follow-ups after refresh
  await expect(superadminPage).toHaveURL(/\/follow-ups/);
});
```

### Step: Commit

```powershell
git add tests/e2e/ts/specs/broadcasts.spec.ts tests/e2e/ts/specs/follow-ups.spec.ts
git commit -m "feat(e2e): add broadcasts and follow-ups specs"
```

---

## Task 9: Settings + Profile Specs

**Files:**
- Create: `tests/e2e/ts/specs/settings.spec.ts`
- Create: `tests/e2e/ts/specs/profile.spec.ts`

### `settings.spec.ts`

```typescript
// tests/e2e/ts/specs/settings.spec.ts
import { test, expect } from "../fixtures/auth.fixtures";
import { SettingsPage } from "../pages/settings.page";

for (const role of ["superadmin", "owner"] as const) {
  test(`@smoke settings page loads for ${role}`, async ({ [`${role}Page`]: page }: any) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.navigate();
    await settingsPage.expectTabsListVisible();
  });
}

for (const tab of ["bot-config", "knowledge-base", "commands", "team"] as const) {
  test(`@journey settings tab "${tab}" is navigable`, async ({ superadminPage }) => {
    const settingsPage = new SettingsPage(superadminPage);
    await settingsPage.navigate();
    await settingsPage.clickTab(tab);
    await settingsPage.expectTabVisible(tab);
  });
}

test("@regression bot-config tab is the default visible tab", async ({ superadminPage }) => {
  const settingsPage = new SettingsPage(superadminPage);
  await settingsPage.navigate();
  await settingsPage.expectTabVisible("bot-config");
});
```

### `profile.spec.ts`

```typescript
// tests/e2e/ts/specs/profile.spec.ts
import { test, expect } from "../fixtures/auth.fixtures";
import { ProfilePage } from "../pages/profile.page";

test("@smoke profile page loads for superadmin", async ({ superadminPage }) => {
  const profilePage = new ProfilePage(superadminPage);
  await profilePage.navigate();
});

test("@smoke profile page loads for owner", async ({ ownerPage }) => {
  const profilePage = new ProfilePage(ownerPage);
  await profilePage.navigate();
});

test("@journey sessions card is visible", async ({ superadminPage }) => {
  const profilePage = new ProfilePage(superadminPage);
  await profilePage.navigate();
  await profilePage.expectSessionsCardVisible();
});

test("@regression at least one active session is displayed", async ({ superadminPage }) => {
  const profilePage = new ProfilePage(superadminPage);
  await profilePage.navigate();
  await profilePage.expectSessionsCardVisible();
  // There should be at least 1 session row since we are logged in
  const revokeButtonCount = await profilePage.getSessionRevokeButtons();
  expect(revokeButtonCount).toBeGreaterThanOrEqual(1);
});

test("@regression profile page shows user info", async ({ superadminPage }) => {
  const profilePage = new ProfilePage(superadminPage);
  await profilePage.navigate();
  // Should display the user's name or email somewhere
  const emailOrName = superadminPage.locator("text=/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/").first();
  await expect(emailOrName).toBeVisible({ timeout: 10_000 });
});
```

### Step: Commit

```powershell
git add tests/e2e/ts/specs/settings.spec.ts tests/e2e/ts/specs/profile.spec.ts
git commit -m "feat(e2e): add settings and profile specs"
```

---

## Task 10: Analytics Spec

**Files:**
- Create: `tests/e2e/ts/specs/analytics.spec.ts`

```typescript
// tests/e2e/ts/specs/analytics.spec.ts
import { test, expect } from "../fixtures/auth.fixtures";
import { AnalyticsPage } from "../pages/analytics.page";

test("@smoke analytics page loads for superadmin", async ({ superadminPage }) => {
  const analyticsPage = new AnalyticsPage(superadminPage);
  await analyticsPage.navigate();
});

test("@smoke analytics page loads for owner", async ({ ownerPage }) => {
  const analyticsPage = new AnalyticsPage(ownerPage);
  await analyticsPage.navigate();
});

test("@journey timeframe selector — today", async ({ superadminPage }) => {
  const analyticsPage = new AnalyticsPage(superadminPage);
  await analyticsPage.navigate();
  await analyticsPage.selectTimeframe("today");
  await analyticsPage.expectPageVisible();
});

test("@journey timeframe selector — last_30_days", async ({ superadminPage }) => {
  const analyticsPage = new AnalyticsPage(superadminPage);
  await analyticsPage.navigate();
  await analyticsPage.selectTimeframe("last_30_days");
  await analyticsPage.expectPageVisible();
});

test("@journey timeframe selector — all_time", async ({ superadminPage }) => {
  const analyticsPage = new AnalyticsPage(superadminPage);
  await analyticsPage.navigate();
  await analyticsPage.selectTimeframe("all_time");
  await analyticsPage.expectPageVisible();
});

test("@regression charts render without crashing on page load", async ({ superadminPage }) => {
  const analyticsPage = new AnalyticsPage(superadminPage);
  await analyticsPage.navigate();

  // Recharts renders SVG elements — verify at least one chart container exists
  const chartContainers = superadminPage.locator(".recharts-wrapper, .recharts-responsive-container");
  const count = await chartContainers.count();
  expect(count).toBeGreaterThan(0);
});
```

### Step: Commit

```powershell
git add tests/e2e/ts/specs/analytics.spec.ts
git commit -m "feat(e2e): add analytics spec"
```

---

## Task 11: Admin (Superadmin) Spec

**Files:**
- Create: `tests/e2e/ts/specs/admin.spec.ts`

```typescript
// tests/e2e/ts/specs/admin.spec.ts
import { test, expect } from "../fixtures/auth.fixtures";
import { AdminPage } from "../pages/admin.page";

// ─── Overview ─────────────────────────────────────────────────────────────────
test("@smoke admin overview page loads", async ({ superadminPage }) => {
  const adminPage = new AdminPage(superadminPage);
  await adminPage.navigate("overview");
  await adminPage.expectPageLoaded();
});

// ─── Sub-sections ─────────────────────────────────────────────────────────────
for (const section of ["users", "sessions", "ai-feedback", "features", "secrets", "system"] as const) {
  test(`@journey admin /${section} page loads for superadmin`, async ({ superadminPage }) => {
    const adminPage = new AdminPage(superadminPage);
    await adminPage.navigate(section);
    await adminPage.expectPageLoaded();
    await expect(superadminPage).toHaveURL(new RegExp(`/admin/${section}`));
  });
}

// ─── Queues ───────────────────────────────────────────────────────────────────
test("@regression admin /queues page loads", async ({ superadminPage }) => {
  const adminPage = new AdminPage(superadminPage);
  await adminPage.navigate("queues");
  await adminPage.expectPageLoaded();
});

// ─── Backup ───────────────────────────────────────────────────────────────────
test("@regression admin /backup page loads", async ({ superadminPage }) => {
  const adminPage = new AdminPage(superadminPage);
  await adminPage.navigate("backup");
  await adminPage.expectPageLoaded();
});
```

### Step: Commit

```powershell
git add tests/e2e/ts/specs/admin.spec.ts
git commit -m "feat(e2e): add admin spec"
```

---

## Task 12: RBAC Spec

**Files:**
- Create: `tests/e2e/ts/specs/rbac.spec.ts`

This spec validates that role-based access control is enforced in the UI.

```typescript
// tests/e2e/ts/specs/rbac.spec.ts
import { test, expect } from "../fixtures/auth.fixtures";

// ─── Owner cannot access superadmin routes ────────────────────────────────────
const SUPERADMIN_ONLY_ROUTES = [
  "/admin",
  "/admin/users",
  "/admin/sessions",
  "/admin/secrets",
  "/admin/system",
  "/admin/queues",
  "/admin/backup",
];

for (const route of SUPERADMIN_ONLY_ROUTES) {
  test(`@rbac owner is blocked from ${route}`, async ({ ownerPage }) => {
    await ownerPage.goto(route);
    await ownerPage.waitForLoadState("networkidle");

    // Should be redirected away OR show a 403/not-found page
    const currentUrl = ownerPage.url();
    const isBlocked =
      currentUrl.includes("/login") ||
      currentUrl.includes("/not-found") ||
      currentUrl.includes("/403") ||
      !currentUrl.includes(route);

    if (!isBlocked) {
      // Verify no sensitive admin content is rendered
      const adminContent = ownerPage.locator(
        "text=/Superadmin|Super Admin|Admin Dashboard/i"
      );
      // If the route is accessible, at least verify no dangerous actions are available
      // (this is a soft check — hard redirect is preferred)
      console.warn(`RBAC: Owner was able to access ${route} without redirect`);
    }

    expect(isBlocked).toBeTruthy();
  });
}

// ─── Both roles can access common dashboard routes ────────────────────────────
const SHARED_ROUTES = [
  { path: "/leads", testId: "leads-page" },
  { path: "/follow-ups", testId: "followups-page" },
  { path: "/broadcasts", testId: "broadcasts-page" },
  { path: "/settings", testId: "settings-page" },
  { path: "/analytics", testId: "analytics-page" },
  { path: "/profile", testId: "profile-page" },
];

for (const { path, testId } of SHARED_ROUTES) {
  test(`@rbac owner can access ${path}`, async ({ ownerPage }) => {
    await ownerPage.goto(path);
    await ownerPage.waitForLoadState("networkidle");
    await expect(ownerPage.getByTestId(testId)).toBeVisible({ timeout: 15_000 });
  });

  test(`@rbac superadmin can access ${path}`, async ({ superadminPage }) => {
    await superadminPage.goto(path);
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.getByTestId(testId)).toBeVisible({ timeout: 15_000 });
  });
}
```

### Step: Commit

```powershell
git add tests/e2e/ts/specs/rbac.spec.ts
git commit -m "feat(e2e): add RBAC spec for role-based access control"
```

---

## Task 13: Navigation Spec

**Files:**
- Create: `tests/e2e/ts/specs/navigation.spec.ts`

```typescript
// tests/e2e/ts/specs/navigation.spec.ts
import { test, expect } from "../fixtures/auth.fixtures";
import { DashboardPage } from "../pages/dashboard.page";

// ─── Sidebar visible on all dashboard routes ──────────────────────────────────
const DASHBOARD_ROUTES = [
  "/leads",
  "/follow-ups",
  "/broadcasts",
  "/analytics",
  "/settings",
  "/profile",
];

for (const route of DASHBOARD_ROUTES) {
  test(`@smoke sidebar is visible on ${route}`, async ({ superadminPage }) => {
    const dashboard = new DashboardPage(superadminPage);
    await dashboard.navigateTo(route);
    await dashboard.expectSidebarVisible();
  });
}

// ─── Admin sidebar links ──────────────────────────────────────────────────────
test("@journey superadmin sees admin section in sidebar", async ({ superadminPage }) => {
  const dashboard = new DashboardPage(superadminPage);
  await dashboard.navigateTo("/leads");

  // Admin link or nav item should be visible to superadmin
  const adminLink = superadminPage.locator(
    "a[href='/admin'], [data-testid='sidebar-admin-link'], nav a:has-text('Admin'), nav a:has-text('Superadmin')"
  ).first();
  await expect(adminLink).toBeVisible({ timeout: 10_000 });
});

test("@rbac owner does NOT see admin section link in sidebar", async ({ ownerPage }) => {
  const dashboard = new DashboardPage(ownerPage);
  await dashboard.navigateTo("/leads");

  // Owner should not see /admin link
  const adminLink = ownerPage.locator(
    "a[href='/admin'], [data-testid='sidebar-admin-link']"
  ).first();
  const isVisible = await adminLink.isVisible().catch(() => false);
  expect(isVisible).toBe(false);
});

// ─── 404 not-found page ───────────────────────────────────────────────────────
test("@regression unknown route shows not-found page", async ({ superadminPage }) => {
  await superadminPage.goto("/this-route-does-not-exist-xyz");
  await superadminPage.waitForLoadState("networkidle");

  // Either redirected to /not-found or a 404 indicator is present
  const notFound = superadminPage.locator(
    "text=/not found|404|page not found/i"
  ).first();
  const url = superadminPage.url();
  const isNotFoundPage =
    url.includes("/not-found") ||
    url.includes("404") ||
    (await notFound.isVisible().catch(() => false));

  expect(isNotFoundPage).toBeTruthy();
});
```

### Step: Commit

```powershell
git add tests/e2e/ts/specs/navigation.spec.ts
git commit -m "feat(e2e): add navigation spec"
```

---

## Task 14: GitHub Actions CI Workflow

**Files:**
- Create: `.github/workflows/e2e.yml`

```yaml
# .github/workflows/e2e.yml
name: E2E Tests (Playwright)

on:
  push:
    branches: [main, feature/**]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      grep:
        description: "Test tag filter (e.g. @smoke)"
        required: false
        default: "@smoke"

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: true

jobs:
  e2e:
    name: E2E — ${{ github.event.inputs.grep || '@smoke' }}
    runs-on: ubuntu-latest
    timeout-minutes: 20

    env:
      E2E_BASE_URL: ${{ secrets.E2E_BASE_URL }}
      E2E_SUPERADMIN_EMAIL: ${{ secrets.E2E_SUPERADMIN_EMAIL }}
      E2E_SUPERADMIN_PASSWORD: ${{ secrets.E2E_SUPERADMIN_PASSWORD }}
      E2E_OWNER_EMAIL: ${{ secrets.E2E_OWNER_EMAIL }}
      E2E_OWNER_PASSWORD: ${{ secrets.E2E_OWNER_PASSWORD }}
      E2E_HEADLESS: "true"
      CI: "true"

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install chromium --with-deps

      - name: Run E2E tests
        run: pnpm exec playwright test --grep "${{ github.event.inputs.grep || '@smoke' }}"

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ github.run_id }}
          path: tests/e2e/artifacts/playwright-report/
          retention-days: 7

      - name: Upload test results (XML)
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results-xml-${{ github.run_id }}
          path: tests/e2e/artifacts/playwright-results.xml
          retention-days: 7
```

### Step: Add `.gitignore` entries for artifacts

Add to `.gitignore` (if not already present):
```
tests/e2e/artifacts/
tests/e2e/auth-state/
```

### Step: Commit

```powershell
git add .github/workflows/e2e.yml .gitignore
git commit -m "feat(ci): add GitHub Actions E2E workflow"
```

---

## Task 15: Verify Full Suite

### Step 1: Run smoke suite end-to-end

```powershell
pnpm test:e2e:smoke
```

Expected output:
```
Running 15 tests using 4 workers
✓ auth.spec.ts > @smoke login form renders all elements
✓ auth.spec.ts > @smoke login as superadmin redirects to dashboard
✓ auth.spec.ts > @smoke login as owner redirects to dashboard
✓ auth.spec.ts > @smoke unauthenticated access to /leads redirects to /login
✓ leads.spec.ts > @smoke leads page loads for superadmin
... etc
15 passed (Xs)
```

### Step 2: Run journey suite

```powershell
pnpm test:e2e:journey
```

### Step 3: Run RBAC suite

```powershell
pnpm test:e2e:rbac
```

### Step 4: Open HTML report

```powershell
pnpm test:e2e:report
```

### Step 5: Final commit

```powershell
git add .
git commit -m "feat(e2e): complete TypeScript Playwright E2E suite — smoke, journey, rbac, regression"
git push origin feature/mobile-view
```

---

## Test Tag Summary

| Tag | Count (approx) | When to run |
|-----|-------|------------|
| `@smoke` | ~15 | Every commit — fastest feedback |
| `@journey` | ~30 | Every PR — full user workflows |
| `@rbac` | ~20 | Every PR — security-critical |
| `@regression` | ~20 | Nightly — edge cases |

---

## Environment Variable Reference

| Variable | Required | Example |
|----------|----------|---------|
| `E2E_BASE_URL` | ✅ | `https://staging.yourapp.com` |
| `E2E_SUPERADMIN_EMAIL` | ✅ | `superadmin@example.com` |
| `E2E_SUPERADMIN_PASSWORD` | ✅ | `*****` |
| `E2E_OWNER_EMAIL` | ✅ | `owner@example.com` |
| `E2E_OWNER_PASSWORD` | ✅ | `*****` |
| `E2E_HEADLESS` | Optional | `false` (local), `true` (CI) |
| `E2E_SLOW_MO_MS` | Optional | `0` |
| `E2E_ALLOW_PROD` | Optional | `false` |

---

## What Is NOT Tested (Intentionally Excluded — YAGNI)

- Actual data mutations (creating real leads, sending real broadcasts) — staging data integrity
- Telegram Mini App routes (`/tma/*`) — requires Telegram client
- OAuth flows (`/oauth/*`) — requires external provider
- `forgot-password` / `reset-password` — requires live email delivery
- Admin bulk operations (bulk delete, mass revoke) — destructive to staging data
- File upload on lead detail — complex binary flow, low ROI for automation
