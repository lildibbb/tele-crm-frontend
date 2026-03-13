import { test, expect } from "../fixtures/auth.fixtures";

test.describe("Dashboard — Authenticated Access @smoke", () => {
  test("authenticated user lands on dashboard @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/");
    await superadminPage.waitForLoadState("networkidle");
    // Should not redirect to login
    expect(superadminPage.url()).not.toContain("/login");
  });

  test("sidebar is visible after login @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.getByTestId("sidebar-user-menu-trigger")).toBeVisible({ timeout: 15_000 });
  });

  test("unauthenticated user is redirected to login @rbac", async ({ anonPage }) => {
    await anonPage.goto("/");
    await anonPage.waitForLoadState("networkidle");
    expect(anonPage.url()).toContain("/login");
  });

  test("unauthenticated access to leads redirects to login @rbac", async ({ anonPage }) => {
    await anonPage.goto("/leads");
    await anonPage.waitForLoadState("networkidle");
    expect(anonPage.url()).toContain("/login");
  });

  test("unauthenticated access to analytics redirects to login @rbac", async ({ anonPage }) => {
    await anonPage.goto("/analytics");
    await anonPage.waitForLoadState("networkidle");
    expect(anonPage.url()).toContain("/login");
  });

  test("logout button is accessible from sidebar @journey", async ({ superadminPage }) => {
    await superadminPage.goto("/");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.getByTestId("sidebar-user-menu-trigger").click();
    await expect(superadminPage.getByTestId("sidebar-user-menu-logout")).toBeVisible({ timeout: 5_000 });
  });
});
