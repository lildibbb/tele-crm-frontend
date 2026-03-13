import { test, expect } from "../fixtures/auth.fixtures";
import { LeadsPage } from "../pages/leads.page";

test.describe("Leads @smoke", () => {
  test("leads page loads with table @smoke", async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    await leads.expectVisible("leads-page");
  });

  test("search input is present and accepts text @smoke", async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    await leads.search("test");
    await expect(superadminPage.getByTestId("leads-search")).toHaveValue("test");
  });

  test("clear search button works @journey", async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    await leads.search("test");
    await leads.clearSearch();
    await expect(superadminPage.getByTestId("leads-search")).toHaveValue("");
  });

  test("status filter buttons are visible @smoke", async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    // Check at least one status filter exists
    const allFilter = superadminPage.locator('[data-testid^="leads-status-"]').first();
    await expect(allFilter).toBeVisible();
  });

  test("clicking a lead navigates to detail @journey", async ({ superadminPage }) => {
    const leads = new LeadsPage(superadminPage);
    await leads.navigate();
    const firstRow = superadminPage.locator('[data-testid^="lead-row-"]').first();
    const count = await firstRow.count();
    if (count > 0) {
      await firstRow.click();
      await expect(superadminPage).toHaveURL(/\/leads\/detail\//, { timeout: 10_000 });
    }
  });
});
