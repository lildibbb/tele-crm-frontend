import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class SessionsSettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await this.goto("/settings/sessions");
    await this.expectVisible("settings-sessions-page");
  }

  async expectSessionsListVisible() {
    await this.expectVisible("sessions-list");
  }

  async expectCurrentSessionBadge() {
    await this.expectVisible("session-current-badge");
  }

  async clickRevokeAllSessions() {
    await this.clickTestId("sessions-revoke-all-btn");
  }

  async revokeSession(sessionId: string) {
    await this.clickTestId(`session-revoke-btn-${sessionId}`);
    await this.clickTestId("session-revoke-confirm-btn");
  }

  async cancelRevoke() {
    await this.clickTestId("session-revoke-cancel-btn");
  }
}
