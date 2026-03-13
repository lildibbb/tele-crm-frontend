import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class BroadcastsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/broadcasts");
    await this.page.waitForLoadState("networkidle");
  }
}
