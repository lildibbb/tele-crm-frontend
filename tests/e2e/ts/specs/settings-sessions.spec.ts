import { test, expect } from "../fixtures/auth.fixtures";

test.describe("Settings Sessions", () => {
  test("sessions settings page loads @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings/sessions");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="settings-sessions-page"]')).toBeVisible();
  });

  test("sessions list is visible @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings/sessions");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="sessions-list"]')).toBeVisible();
  });

  test("current session badge is shown @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings/sessions");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="session-current-badge"]')).toBeVisible({ timeout: 8000 });
  });

  test("revoke all sessions button is visible @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings/sessions");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="sessions-revoke-all-btn"]')).toBeVisible();
  });

  test("revoke single session dialog cancel works @journey", async ({ superadminPage }) => {
    await superadminPage.goto("/settings/sessions");
    await superadminPage.waitForLoadState("networkidle");
    // Find a non-current session revoke button
    const revokeButtons = superadminPage.locator('[data-testid^="session-revoke-btn-"]');
    const count = await revokeButtons.count();
    if (count === 0) {
      test.skip(true, "No revokable sessions");
      return;
    }
    await revokeButtons.first().click();
    await expect(superadminPage.locator('[data-testid="session-revoke-cancel-btn"]')).toBeVisible({ timeout: 5000 });
    await superadminPage.locator('[data-testid="session-revoke-cancel-btn"]').click();
    // Dialog should be gone
    await expect(superadminPage.locator('[data-testid="session-revoke-cancel-btn"]')).not.toBeVisible();
  });
});
