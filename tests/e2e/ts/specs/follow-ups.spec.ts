import { test, expect } from "../fixtures/auth.fixtures";
import { FollowUpsPage } from "../pages/follow-ups.page";

test.describe("Follow-Ups @smoke", () => {
  test("follow-ups page loads @smoke", async ({ superadminPage }) => {
    const followUps = new FollowUpsPage(superadminPage);
    await followUps.navigate();
    await expect(superadminPage).toHaveURL(/\/follow-ups/);
    await superadminPage.waitForLoadState("networkidle");
  });
});
