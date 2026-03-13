import { test, expect } from "../fixtures/auth.fixtures";
import { SettingsPage } from "../pages/settings.page";

test.describe("Settings @smoke", () => {
  test("settings page loads @smoke", async ({ superadminPage }) => {
    const settings = new SettingsPage(superadminPage);
    await settings.navigate();
    await expect(superadminPage).toHaveURL(/\/settings/);
    await superadminPage.waitForLoadState("networkidle");
  });
});
