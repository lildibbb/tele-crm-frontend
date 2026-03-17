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

  async expectPageVisible(): Promise<void> {
    await this.expectVisible("broadcasts-page");
  }

  async fillMessage(text: string): Promise<void> {
    await this.fillTestId("broadcast-message-input", text);
  }

  async clickSend(): Promise<void> {
    await this.clickTestId("broadcast-send-button");
  }

  async confirmSend(): Promise<void> {
    await this.clickTestId("broadcast-confirm-send");
  }

  async cancelSend(): Promise<void> {
    await this.clickTestId("broadcast-confirm-cancel");
  }

  async expectConfirmDialogVisible(): Promise<void> {
    await this.expectVisible("broadcast-confirm-dialog");
  }
}
