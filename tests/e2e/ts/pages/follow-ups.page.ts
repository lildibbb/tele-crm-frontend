import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class FollowUpsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/follow-ups");
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageVisible(): Promise<void> {
    await this.expectVisible("followups-page");
  }

  async clickTab(tabKey: string): Promise<void> {
    await this.clickTestId(`followups-tab-${tabKey}`);
  }

  async expectScheduledPanelVisible(): Promise<void> {
    await this.expectVisible("followups-scheduled-panel");
  }

  async expectFailedPanelVisible(): Promise<void> {
    await this.expectVisible("followups-failed-panel");
  }

  async clickRefresh(): Promise<void> {
    await this.clickTestId("followups-refresh");
  }
}
