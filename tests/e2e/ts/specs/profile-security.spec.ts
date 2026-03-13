import { test, expect } from "../fixtures/auth.fixtures";
import { ProfilePage } from "../pages/profile.page";

test.describe("Profile — Security & Preferences @smoke", () => {
  test("profile page loads with tabs @smoke", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.expectTabsListVisible();
  });

  test("security tab is present @smoke", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await expect(superadminPage.getByTestId("profile-tab-security")).toBeVisible();
  });

  test("preferences tab is present @smoke", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await expect(superadminPage.getByTestId("profile-tab-preferences")).toBeVisible();
  });

  test("sessions tab is present @smoke", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await expect(superadminPage.getByTestId("profile-tab-sessions")).toBeVisible();
  });

  test("security form fields are visible @journey", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.clickTab("security");
    await expect(superadminPage.getByTestId("profile-security-form")).toBeVisible({ timeout: 10_000 });
    await expect(superadminPage.getByTestId("profile-current-password")).toBeVisible();
    await expect(superadminPage.getByTestId("profile-new-password")).toBeVisible();
    await expect(superadminPage.getByTestId("profile-confirm-password")).toBeVisible();
    await expect(superadminPage.getByTestId("profile-change-password-btn")).toBeVisible();
  });

  test("security form accepts input @journey", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.clickTab("security");
    await superadminPage.getByTestId("profile-current-password").waitFor({ state: "visible", timeout: 10_000 });
    await profile.fillChangePassword("oldpassword", "newpassword123", "newpassword123");
    await expect(superadminPage.getByTestId("profile-current-password")).toHaveValue("oldpassword");
    await expect(superadminPage.getByTestId("profile-new-password")).toHaveValue("newpassword123");
    await expect(superadminPage.getByTestId("profile-confirm-password")).toHaveValue("newpassword123");
  });

  test("sessions card visible on sessions tab @journey", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.clickTab("sessions");
    await profile.expectSessionsCard();
  });
});
