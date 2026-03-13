import { test as base, Page } from "@playwright/test";
import * as path from "path";

const AUTH_DIR = path.join(__dirname, "../../artifacts/auth-state");

type AuthFixtures = {
  superadminPage: Page;
  ownerPage: Page;
  anonPage: Page;
};

export const test = base.extend<AuthFixtures>({
  superadminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, "superadmin.json"),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  ownerPage: async ({ browser }, use) => {
    const ownerPath = path.join(AUTH_DIR, "owner.json");
    const storageState = require("fs").existsSync(ownerPath)
      ? ownerPath
      : path.join(AUTH_DIR, "superadmin.json");
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  anonPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
