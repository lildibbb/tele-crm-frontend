import { test, expect } from "../fixtures/auth.fixtures";

test.describe("Broadcasts Compose", () => {
  test("broadcasts page loads @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/broadcasts");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="broadcasts-page"]')).toBeVisible();
  });

  test("message input and send button are visible @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/broadcasts");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="broadcast-message-input"]')).toBeVisible();
    await expect(superadminPage.locator('[data-testid="broadcast-send-button"]')).toBeVisible();
  });

  test("filling message and clicking send opens confirm dialog @journey", async ({ superadminPage }) => {
    await superadminPage.goto("/broadcasts");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.locator('[data-testid="broadcast-message-input"]').fill("Test broadcast message for E2E");
    await superadminPage.locator('[data-testid="broadcast-send-button"]').click();
    await expect(superadminPage.locator('[data-testid="broadcast-confirm-dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test("broadcast confirm dialog cancel button closes dialog @journey", async ({ superadminPage }) => {
    await superadminPage.goto("/broadcasts");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.locator('[data-testid="broadcast-message-input"]').fill("Test broadcast message");
    await superadminPage.locator('[data-testid="broadcast-send-button"]').click();
    await expect(superadminPage.locator('[data-testid="broadcast-confirm-dialog"]')).toBeVisible({ timeout: 5000 });
    await superadminPage.locator('[data-testid="broadcast-confirm-cancel"]').click();
    await expect(superadminPage.locator('[data-testid="broadcast-confirm-dialog"]')).not.toBeVisible();
  });

  test("owner can access broadcasts page @rbac", async ({ ownerPage }) => {
    await ownerPage.goto("/broadcasts");
    await ownerPage.waitForLoadState("networkidle");
    await expect(ownerPage.locator('[data-testid="broadcasts-page"]')).toBeVisible();
  });
});
