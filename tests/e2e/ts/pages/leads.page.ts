import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class LeadsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/leads");
    await this.expectVisible("leads-page", { timeout: 15_000 });
  }

  async search(query: string): Promise<void> {
    await this.fillTestId("leads-search", query);
    await this.page.waitForTimeout(600); // debounce
  }

  async clearSearch(): Promise<void> {
    await this.clickTestId("leads-search-clear");
  }

  async filterByStatus(status: string): Promise<void> {
    await this.clickTestId(`leads-status-${status}`);
  }

  async clickFirstLead(): Promise<void> {
    await this.page
      .locator('[data-testid^="lead-row-"]')
      .first()
      .click();
  }

  async toggleGlobalHandover(enable: boolean): Promise<void> {
    const toggle = this.getByTestId("leads-global-handover-toggle");
    const isChecked = await toggle.isChecked();
    if (isChecked !== enable) {
      await toggle.click();
    }
  }
}
