import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class FollowUpsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/follow-ups");
    await this.page.waitForLoadState("networkidle");
  }
}
