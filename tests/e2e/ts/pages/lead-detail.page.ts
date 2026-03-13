import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class LeadDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    await this.expectVisible("lead-detail-page", { timeout: 15_000 });
  }

  async toggleHandover(enable: boolean): Promise<void> {
    const toggle = this.getByTestId("lead-detail-handover-toggle");
    const isChecked = await toggle.isChecked().catch(() => false);
    if (isChecked !== enable) {
      await toggle.click();
      await this.page.waitForTimeout(500);
    }
  }

  async expectInteractionHistory(): Promise<void> {
    await this.expectVisible("lead-detail-interaction-history");
  }

  async expectInteractionHistoryScrollable(): Promise<void> {
    const container = this.getByTestId("lead-detail-interaction-history");
    await expect(container).toBeVisible();
    // Verify the container has overflow scroll (not the full page)
    const overflowY = await container.evaluate((el) => getComputedStyle(el).overflowY);
    expect(["auto", "scroll"]).toContain(overflowY);
  }

  async clickTab(tabValue: string): Promise<void> {
    await this.clickTestId(`lead-detail-tab-${tabValue}`);
  }

  async expectTabsListVisible(): Promise<void> {
    await this.expectVisible("lead-detail-tabs-list");
  }

  async clickBackButton(): Promise<void> {
    await this.clickTestId("lead-detail-back-btn");
  }
}
