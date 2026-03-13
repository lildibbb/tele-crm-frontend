import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/login");
    await this.expectVisible("login-form", { timeout: 10_000 });
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillTestId("login-email", email);
    await this.fillTestId("login-password", password);
    await this.clickTestId("login-submit");
  }

  async loginAndWait(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.waitForNavigationAway("/login");
  }

  async expectError(): Promise<void> {
    // After failed login, should stay on /login or show error
    await this.page.waitForTimeout(1_500);
    await this.expectURL(/login/);
  }

  async clickForgotPassword(): Promise<void> {
    await this.clickTestId("login-forgot-password");
  }
}
