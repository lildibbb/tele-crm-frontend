import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class ForgotPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await this.goto("/forgot-password");
    await this.expectVisible("forgot-password-page");
  }

  async fillEmail(email: string) {
    await this.fillTestId("forgot-password-email", email);
  }

  async submit() {
    await this.clickTestId("forgot-password-submit");
  }

  async expectSuccessState() {
    await this.expectVisible("forgot-password-continue");
  }

  async expectErrorState() {
    await this.expectVisible("forgot-password-error");
  }

  async clickBackToLogin() {
    await this.clickTestId("forgot-password-back");
  }
}
