import { test, expect } from "../fixtures/auth.fixtures";
import { BroadcastsPage } from "../pages/broadcasts.page";

test.describe("Broadcasts @smoke", () => {
  test("broadcasts page loads @smoke", async ({ superadminPage }) => {
    const broadcasts = new BroadcastsPage(superadminPage);
    await broadcasts.navigate();
    await expect(superadminPage).toHaveURL(/\/broadcasts/);
    await superadminPage.waitForLoadState("networkidle");
  });
});
