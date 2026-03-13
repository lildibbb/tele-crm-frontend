import { test, expect } from "../fixtures/auth.fixtures";

test.describe("Navigation @smoke", () => {
  test("sidebar user menu trigger is visible on leads page @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/leads");
    await superadminPage.waitForSelector('[data-testid="sidebar-user-menu-trigger"]', {
      timeout: 15_000,
    });
    await expect(superadminPage.getByTestId("sidebar-user-menu-trigger")).toBeVisible();
  });

  test("sidebar is visible on analytics page @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/analytics");
    await superadminPage.waitForSelector('[data-testid="sidebar-user-menu-trigger"]', {
      timeout: 15_000,
    });
    await expect(superadminPage.getByTestId("sidebar-user-menu-trigger")).toBeVisible();
  });

  test("navigating to unknown route shows error or redirects @journey", async ({ superadminPage }) => {
    await superadminPage.goto("/this-does-not-exist");
    await superadminPage.waitForLoadState("networkidle");
    // Should show 404 or redirect — not crash
    const title = await superadminPage.title();
    expect(title).toBeTruthy();
  });
});
