import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class KnowledgeBasePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await this.goto("/settings");
    await this.clickKbTab();
  }

  async clickKbTab() {
    await this.page.getByRole("tab", { name: /knowledge/i }).click();
  }

  async openAddDialog() {
    await this.clickTestId("kb-add-btn");
  }

  async expectEntriesListVisible() {
    await this.expectVisible("kb-entries-list");
  }

  async expectTabVisible() {
    await this.expectVisible("knowledge-base-tab");
  }
}
