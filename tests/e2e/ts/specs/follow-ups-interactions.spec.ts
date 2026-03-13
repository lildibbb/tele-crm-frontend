import { test, expect } from "../fixtures/auth.fixtures";

test.describe("Follow-Ups Interactions", () => {
  test("follow-ups page loads @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/follow-ups");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="followups-page"]')).toBeVisible();
  });

  test("follow-ups tabs are visible @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/follow-ups");
    await superadminPage.waitForLoadState("networkidle");
    const scheduledTab = superadminPage.locator('[data-testid^="followups-tab-"]').first();
    await expect(scheduledTab).toBeVisible();
  });

  test("scheduled panel visible by default @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/follow-ups");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="followups-scheduled-panel"]')).toBeVisible({ timeout: 8000 });
  });

  test("refresh button triggers reload @journey", async ({ superadminPage }) => {
    await superadminPage.goto("/follow-ups");
    await superadminPage.waitForLoadState("networkidle");
    const refreshBtn = superadminPage.locator('[data-testid="followups-refresh"]');
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    // Page stays on follow-ups after refresh
    await expect(superadminPage).toHaveURL(/\/follow-ups/);
  });

  test("owner can access follow-ups page @rbac", async ({ ownerPage }) => {
    await ownerPage.goto("/follow-ups");
    await ownerPage.waitForLoadState("networkidle");
    await expect(ownerPage.locator('[data-testid="followups-page"]')).toBeVisible();
  });
});
