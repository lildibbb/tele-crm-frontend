import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class AdminPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateTo(subpath: string): Promise<void> {
    await this.goto(`/admin${subpath}`);
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToOverview(): Promise<void> {
    await this.navigateTo("");
    await this.page.waitForTimeout(500);
  }

  async navigateToUsers(): Promise<void> {
    await this.navigateTo("/users");
  }

  async navigateToSessions(): Promise<void> {
    await this.navigateTo("/sessions");
  }

  async navigateToFeatures(): Promise<void> {
    await this.navigateTo("/features");
  }

  async navigateToAiFeedback(): Promise<void> {
    await this.navigateTo("/ai-feedback");
  }
}
