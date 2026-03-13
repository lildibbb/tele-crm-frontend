import { test } from "../fixtures/auth.fixtures";
import { ProfilePage } from "../pages/profile.page";

test.describe("Profile @smoke", () => {
  test("profile page loads @smoke", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.expectVisible("profile-page");
  });

  test("sessions card is visible @smoke", async ({ superadminPage }) => {
    const profile = new ProfilePage(superadminPage);
    await profile.navigate();
    await profile.expectSessionsCard();
  });
});
