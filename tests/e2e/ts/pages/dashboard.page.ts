import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/");
    // Wait for sidebar to be visible
    await this.page.waitForSelector('[data-testid="sidebar-user-menu-trigger"]', {
      timeout: 15_000,
    });
  }

  async openUserMenu(): Promise<void> {
    await this.clickTestId("sidebar-user-menu-trigger");
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.clickTestId("sidebar-user-menu-logout");
    await this.page.waitForURL(/login/, { timeout: 10_000 });
  }

  async expectSidebarVisible(): Promise<void> {
    await this.expectVisible("sidebar-user-menu-trigger");
  }
}
