import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class BotConfigPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await this.goto("/settings");
    await this.clickTab("Bot");
  }

  async clickTab(name: string) {
    await this.page.getByRole("tab", { name }).click();
  }

  async saveBotConfig() {
    await this.clickTestId("bot-config-save-btn");
  }

  async fillBotName(name: string) {
    await this.fillTestId("bot-config-bot-name-input", name);
  }

  async fillRegistrationUrl(url: string) {
    await this.fillTestId("bot-config-registration-url-input", url);
  }

  async expectTabVisible() {
    await this.expectVisible("bot-config-tab");
  }
}
