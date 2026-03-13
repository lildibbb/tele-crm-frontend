import { chromium, FullConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const AUTH_DIR = path.join(__dirname, "../../artifacts/auth-state");

async function loginAs(
  baseURL: string,
  email: string,
  password: string,
  storageStatePath: string
): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  await page.goto(`${baseURL}/login`);
  await page.waitForSelector('[data-testid="login-form"]', { timeout: 30_000 });

  await page.fill('[data-testid="login-email"]', email);
  await page.fill('[data-testid="login-password"]', password);
  await page.click('[data-testid="login-submit"]');

  // Wait until we're redirected away from /login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 30_000,
  });

  // Save storage state (cookies + localStorage incl. deviceId)
  await context.storageState({ path: storageStatePath });
  await browser.close();
}

async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL =
    process.env.E2E_BASE_URL ??
    config.projects[0]?.use?.baseURL ??
    "http://localhost:3000";

  if (!process.env.E2E_SUPERADMIN_EMAIL || !process.env.E2E_SUPERADMIN_PASSWORD) {
    throw new Error(
      "E2E_SUPERADMIN_EMAIL and E2E_SUPERADMIN_PASSWORD must be set in tests/e2e/.env"
    );
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });

  console.log(`[global-setup] Logging in as superadmin (${process.env.E2E_SUPERADMIN_EMAIL})...`);
  await loginAs(
    baseURL,
    process.env.E2E_SUPERADMIN_EMAIL,
    process.env.E2E_SUPERADMIN_PASSWORD,
    path.join(AUTH_DIR, "superadmin.json")
  );
  console.log("[global-setup] Superadmin auth state saved.");

  if (process.env.E2E_OWNER_EMAIL && process.env.E2E_OWNER_PASSWORD) {
    console.log(`[global-setup] Logging in as owner (${process.env.E2E_OWNER_EMAIL})...`);
    await loginAs(
      baseURL,
      process.env.E2E_OWNER_EMAIL,
      process.env.E2E_OWNER_PASSWORD,
      path.join(AUTH_DIR, "owner.json")
    );
    console.log("[global-setup] Owner auth state saved.");
  }
}

export default globalSetup;
