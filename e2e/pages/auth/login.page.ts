import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";
import { Messages } from "../../enums/app/messages";
import { AdminCredentials } from "../../config/credentials";

export class LoginPage {
  constructor(private readonly page: Page) {}

  get emailInput(): Locator {
    return this.page.getByRole("textbox", { name: "Email" });
  }

  get passwordInput(): Locator {
    return this.page.getByRole("textbox", { name: "Contraseña" });
  }

  get submitButton(): Locator {
    return this.page.getByRole("button", { name: Messages.LOGIN_SUBMIT });
  }

  get errorMessage(): Locator {
    return this.page.getByText(/credenciales|inválid|error/i);
  }

  /**
   * Open the login page.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.LOGIN);
  }

  /**
   * Log in and wait for the post-login redirect to the events list.
   * @param {string} [email] - Defaults to the seeded admin email.
   * @param {string} [password] - Defaults to the seeded admin password.
   * @returns {Promise<void>}
   */
  async login(email = AdminCredentials.email, password = AdminCredentials.password): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.EVENTOS}`);
  }
}
