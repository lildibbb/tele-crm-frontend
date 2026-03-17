import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class AuditLogsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await this.goto("/audit-logs");
    await this.expectVisible("audit-logs-page");
  }

  async search(query: string) {
    await this.fillTestId("audit-logs-search", query);
  }

  async expectTableVisible() {
    await this.expectVisible("audit-logs-table");
  }
}
