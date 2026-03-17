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

  async clickTab(tabValue: string): Promise<void> {
    await this.clickTestId(`profile-tab-${tabValue}`);
  }

  async expectTabsListVisible(): Promise<void> {
    await this.expectVisible("profile-tabs-list");
  }

  async fillChangePassword(current: string, newPwd: string, confirm: string): Promise<void> {
    await this.fillTestId("profile-current-password", current);
    await this.fillTestId("profile-new-password", newPwd);
    await this.fillTestId("profile-confirm-password", confirm);
  }

  async submitChangePassword(): Promise<void> {
    await this.clickTestId("profile-change-password-btn");
  }
}
