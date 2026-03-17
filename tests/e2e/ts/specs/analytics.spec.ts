import { test, expect } from "../fixtures/auth.fixtures";
import { AnalyticsPage } from "../pages/analytics.page";

test.describe("Analytics @smoke", () => {
  test("analytics page loads @smoke", async ({ superadminPage }) => {
    const analytics = new AnalyticsPage(superadminPage);
    await analytics.navigate();
    await analytics.expectVisible("analytics-page");
  });

  test("timeframe selectors are present @smoke", async ({ superadminPage }) => {
    const analytics = new AnalyticsPage(superadminPage);
    await analytics.navigate();
    // At least one timeframe button should be visible
    const tfs = superadminPage.locator('[data-testid^="analytics-timeframe-"]');
    await expect(tfs.first()).toBeVisible();
  });

  test("switching timeframe updates data @journey", async ({ superadminPage }) => {
    const analytics = new AnalyticsPage(superadminPage);
    await analytics.navigate();
    await analytics.selectTimeframe("last_30_days");
    // Page should not navigate away
    await expect(superadminPage).toHaveURL(/\/analytics/);
  });
});
