import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";
import { Messages } from "../../enums/app/messages";

// Single seeded admin (auth via env in the app). Override with E2E_ADMIN_* env.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@salon.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "admin1234";

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
  async login(email = ADMIN_EMAIL, password = ADMIN_PASSWORD): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.EVENTOS}`);
  }
}
