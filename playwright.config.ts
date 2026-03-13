import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "tests/e2e/.env") });

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const HEADLESS = process.env.E2E_HEADLESS !== "false";
const SLOW_MO = parseInt(process.env.E2E_SLOW_MO_MS ?? "0", 10);
const AUTH_DIR = path.join(__dirname, "tests/e2e/artifacts/auth-state");

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
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(AUTH_DIR, "superadmin.json"),
      },
      dependencies: ["setup"],
    },
  ],
  outputDir: "tests/e2e/artifacts/test-results",
});
