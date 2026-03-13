import { Page, Locator, expect } from "@playwright/test";

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async expectVisible(testId: string, options?: { timeout?: number }): Promise<void> {
    await expect(this.page.getByTestId(testId)).toBeVisible(options);
  }

  async expectHidden(testId: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).toBeHidden();
  }

  async expectURL(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  async waitForNavigationAway(from: string): Promise<void> {
    await this.page.waitForURL((url) => !url.pathname.includes(from));
  }

  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  async clickTestId(testId: string): Promise<void> {
    await this.page.getByTestId(testId).click();
  }

  async fillTestId(testId: string, value: string): Promise<void> {
    await this.page.getByTestId(testId).fill(value);
  }
}
