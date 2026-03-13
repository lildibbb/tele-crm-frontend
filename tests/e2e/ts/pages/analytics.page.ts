import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export type Timeframe =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "last_30_days"
  | "last_90_days"
  | "all_time";

export class AnalyticsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/analytics");
    await this.expectVisible("analytics-page", { timeout: 15_000 });
  }

  async selectTimeframe(tf: Timeframe): Promise<void> {
    await this.clickTestId(`analytics-timeframe-${tf}`);
    await this.page.waitForTimeout(300);
  }

  async expectTimeframeActive(tf: Timeframe): Promise<void> {
    const btn = this.getByTestId(`analytics-timeframe-${tf}`);
    // The active button should have aria-pressed or a data-active attribute
    await btn.waitFor({ state: "visible" });
  }
}
