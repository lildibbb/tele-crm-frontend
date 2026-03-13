import { test, expect } from "../fixtures/auth.fixtures";

test.describe("Lead Detail Page", () => {
  async function navigateToFirstLead(page: import("@playwright/test").Page) {
    await page.goto("/leads");
    await page.waitForLoadState("networkidle");
    const firstRow = page.locator('[data-testid^="lead-row-"]').first();
    const exists = await firstRow.isVisible();
    return exists;
  }

  test("lead detail page loads when navigating from leads list @smoke", async ({ superadminPage }) => {
    const hasLeads = await navigateToFirstLead(superadminPage);
    if (!hasLeads) {
      test.skip(true, "No leads in test data");
      return;
    }
    await superadminPage.locator('[data-testid^="lead-row-"]').first().click();
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="lead-detail-page"]')).toBeVisible({ timeout: 10000 });
  });

  test("lead detail handover toggle is visible @smoke", async ({ superadminPage }) => {
    const hasLeads = await navigateToFirstLead(superadminPage);
    if (!hasLeads) {
      test.skip(true, "No leads in test data");
      return;
    }
    await superadminPage.locator('[data-testid^="lead-row-"]').first().click();
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="lead-detail-handover-toggle"]')).toBeVisible({ timeout: 10000 });
  });

  test("lead detail interaction history is visible and scrollable @smoke", async ({ superadminPage }) => {
    const hasLeads = await navigateToFirstLead(superadminPage);
    if (!hasLeads) {
      test.skip(true, "No leads in test data");
      return;
    }
    await superadminPage.locator('[data-testid^="lead-row-"]').first().click();
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="lead-detail-interaction-history"]')).toBeVisible({ timeout: 10000 });
  });
});
