import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/settings");
    await this.page.waitForLoadState("networkidle");
  }

  async clickTab(tabName: string): Promise<void> {
    await this.page.getByRole("tab", { name: tabName }).click();
    await this.page.waitForTimeout(300);
  }
}
