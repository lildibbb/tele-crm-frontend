import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class TeamPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await this.goto("/settings");
    await this.clickSettingsTab();
  }

  async clickSettingsTab() {
    await this.page.getByRole("tab", { name: /team/i }).click();
  }

  async openInviteDialog() {
    await this.clickTestId("team-invite-btn");
  }

  async fillInviteEmail(email: string) {
    await this.fillTestId("team-invite-email-input", email);
  }

  async submitInvite() {
    await this.clickTestId("team-invite-submit-btn");
  }

  async expectMembersTableVisible() {
    await this.expectVisible("team-members-table");
  }

  async expectTabVisible() {
    await this.expectVisible("team-tab");
  }
}
