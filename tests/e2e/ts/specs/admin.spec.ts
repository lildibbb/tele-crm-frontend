import { test, expect } from "../fixtures/auth.fixtures";
import { AdminPage } from "../pages/admin.page";

test.describe("Admin @smoke", () => {
  test("admin overview loads @smoke", async ({ superadminPage }) => {
    const admin = new AdminPage(superadminPage);
    await admin.navigateToOverview();
    await expect(superadminPage).toHaveURL(/\/admin/, { timeout: 10_000 });
  });

  test("admin users page loads @smoke", async ({ superadminPage }) => {
    const admin = new AdminPage(superadminPage);
    await admin.navigateToUsers();
    await expect(superadminPage).toHaveURL(/\/admin\/users/);
  });

  test("admin sessions page loads @smoke", async ({ superadminPage }) => {
    const admin = new AdminPage(superadminPage);
    await admin.navigateToSessions();
    await expect(superadminPage).toHaveURL(/\/admin\/sessions/);
  });

  test("admin features page loads @smoke", async ({ superadminPage }) => {
    const admin = new AdminPage(superadminPage);
    await admin.navigateToFeatures();
    await expect(superadminPage).toHaveURL(/\/admin\/features/);
  });

  test("admin ai-feedback page loads @smoke", async ({ superadminPage }) => {
    const admin = new AdminPage(superadminPage);
    await admin.navigateToAiFeedback();
    await expect(superadminPage).toHaveURL(/\/admin\/ai-feedback/);
  });
});
