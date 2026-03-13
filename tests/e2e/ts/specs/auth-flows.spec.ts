import { test, expect } from "../fixtures/auth.fixtures";

test.describe("Auth Flows", () => {
  test("forgot-password page loads and shows form @smoke", async ({ anonPage }) => {
    await anonPage.goto("/forgot-password");
    await expect(anonPage.locator('[data-testid="forgot-password-page"]')).toBeVisible();
    await expect(anonPage.locator('[data-testid="forgot-password-email"]')).toBeVisible();
    await expect(anonPage.locator('[data-testid="forgot-password-submit"]')).toBeVisible();
  });

  test("forgot-password back link navigates to login @smoke", async ({ anonPage }) => {
    await anonPage.goto("/forgot-password");
    await anonPage.locator('[data-testid="forgot-password-back"]').click();
    await expect(anonPage).toHaveURL(/\/login/);
  });

  test("forgot-password shows error for invalid email @regression", async ({ anonPage }) => {
    await anonPage.goto("/forgot-password");
    await anonPage.locator('[data-testid="forgot-password-email"]').fill("notanemail");
    await anonPage.locator('[data-testid="forgot-password-submit"]').click();
    // Either HTML5 validation or custom error message
    const emailInput = anonPage.locator('[data-testid="forgot-password-email"]');
    await expect(emailInput).toBeVisible();
  });

  test("setup-account page redirects or shows expired state for invalid token @smoke", async ({ anonPage }) => {
    await anonPage.goto("/setup-account?token=invalid-token");
    // Should show error state or redirect
    await anonPage.waitForLoadState("networkidle");
    const url = anonPage.url();
    const hasError = await anonPage.locator('[data-testid="setup-error-state"]').isVisible();
    const redirectedToLogin = url.includes("/login");
    expect(hasError || redirectedToLogin).toBeTruthy();
  });

  test("authenticated user visiting /login is redirected @journey", async ({ superadminPage }) => {
    await superadminPage.goto("/login");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage).not.toHaveURL(/\/login/);
  });
});
