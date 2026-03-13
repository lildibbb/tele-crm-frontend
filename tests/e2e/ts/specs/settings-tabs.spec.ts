import { test, expect } from "../fixtures/auth.fixtures";

test.describe("Settings Tabs", () => {
  test("settings page loads @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="settings-page"]')).toBeVisible();
  });

  test("settings tabs list is visible @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings");
    await superadminPage.waitForLoadState("networkidle");
    await expect(superadminPage.locator('[data-testid="settings-tabs-list"]')).toBeVisible();
  });

  test("bot config tab loads @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.locator('[data-testid="settings-tabs-list"]').getByRole("tab", { name: /bot/i }).click();
    await expect(superadminPage.locator('[data-testid="bot-config-tab"]')).toBeVisible({ timeout: 8000 });
  });

  test("bot config save button is visible @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.locator('[data-testid="settings-tabs-list"]').getByRole("tab", { name: /bot/i }).click();
    await expect(superadminPage.locator('[data-testid="bot-config-save-btn"]')).toBeVisible({ timeout: 8000 });
  });

  test("team tab loads and shows members table @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.locator('[data-testid="settings-tabs-list"]').getByRole("tab", { name: /team/i }).click();
    await expect(superadminPage.locator('[data-testid="team-tab"]')).toBeVisible({ timeout: 8000 });
    await expect(superadminPage.locator('[data-testid="team-members-table"]')).toBeVisible({ timeout: 8000 });
  });

  test("team invite dialog opens @journey", async ({ superadminPage }) => {
    await superadminPage.goto("/settings");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.locator('[data-testid="settings-tabs-list"]').getByRole("tab", { name: /team/i }).click();
    await superadminPage.locator('[data-testid="team-invite-btn"]').click();
    await expect(superadminPage.locator('[data-testid="team-invite-email-input"]')).toBeVisible({ timeout: 5000 });
  });

  test("commands tab loads @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.locator('[data-testid="settings-tabs-list"]').getByRole("tab", { name: /command/i }).click();
    await expect(superadminPage.locator('[data-testid="commands-tab"]')).toBeVisible({ timeout: 8000 });
  });

  test("knowledge base tab loads @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.locator('[data-testid="settings-tabs-list"]').getByRole("tab", { name: /knowledge/i }).click();
    await expect(superadminPage.locator('[data-testid="knowledge-base-tab"]')).toBeVisible({ timeout: 8000 });
  });

  test("integrations tab loads @smoke", async ({ superadminPage }) => {
    await superadminPage.goto("/settings");
    await superadminPage.waitForLoadState("networkidle");
    await superadminPage.locator('[data-testid="settings-tabs-list"]').getByRole("tab", { name: /integration/i }).click();
    await expect(superadminPage.locator('[data-testid="integrations-tab"]')).toBeVisible({ timeout: 8000 });
  });
});
