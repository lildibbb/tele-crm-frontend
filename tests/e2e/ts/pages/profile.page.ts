import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/profile");
    await this.expectVisible("profile-page", { timeout: 15_000 });
  }

  async expectSessionsCard(): Promise<void> {
    await this.expectVisible("profile-sessions-card");
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.clickTestId(`session-revoke-${sessionId}`);
  }
}
