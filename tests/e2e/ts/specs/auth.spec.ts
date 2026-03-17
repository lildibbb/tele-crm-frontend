import { test, expect } from "../fixtures/auth.fixtures";
import { LoginPage } from "../pages/login.page";

const SUPERADMIN_EMAIL = process.env.E2E_SUPERADMIN_EMAIL!;
const SUPERADMIN_PASSWORD = process.env.E2E_SUPERADMIN_PASSWORD!;

test.describe("Authentication @smoke", () => {
  test("login page renders required fields", async ({ anonPage }) => {
    const login = new LoginPage(anonPage);
    await login.navigate();
    await login.expectVisible("login-email");
    await login.expectVisible("login-password");
    await login.expectVisible("login-submit");
  });

  test("successful login redirects to dashboard @smoke", async ({ anonPage }) => {
    const login = new LoginPage(anonPage);
    await login.navigate();
    await login.loginAndWait(SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD);
    await expect(anonPage).not.toHaveURL(/\/login/);
  });

  test("invalid credentials stays on login page @smoke", async ({ anonPage }) => {
    const login = new LoginPage(anonPage);
    await login.navigate();
    await login.login("bad@example.com", "wrongpassword");
    await login.expectError();
  });

  test("unauthenticated user is redirected to login @smoke", async ({ anonPage }) => {
    await anonPage.goto("/leads");
    await expect(anonPage).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test("logout returns to login page @journey", async ({ superadminPage }) => {
    const { DashboardPage } = await import("../pages/dashboard.page");
    const dashboard = new DashboardPage(superadminPage);
    await dashboard.navigate();
    await dashboard.logout();
    await expect(superadminPage).toHaveURL(/\/login/);
  });
});
