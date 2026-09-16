import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";
import { Messages } from "../../enums/app/messages";

// "Mi cuenta" (/cuenta): change the password while logged in.
export class CuentaPage {
  constructor(private readonly page: Page) {}

  get currentPasswordInput(): Locator {
    return this.page.getByLabel("Contraseña actual");
  }

  get passwordInput(): Locator {
    return this.page.getByLabel("Nueva contraseña");
  }

  get confirmPasswordInput(): Locator {
    return this.page.getByLabel("Repetir contraseña");
  }

  get submitButton(): Locator {
    return this.page.getByRole("button", { name: Messages.RESET_SUBMIT });
  }

  /**
   * Open the account screen.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.CUENTA);
  }

  /**
   * Submit the change-password form.
   * @param {string} current - Current password.
   * @param {string} next - New password (also used as confirmation).
   * @returns {Promise<void>}
   */
  async changePassword(current: string, next: string): Promise<void> {
    await this.currentPasswordInput.fill(current);
    await this.passwordInput.fill(next);
    await this.confirmPasswordInput.fill(next);
    await this.submitButton.click();
  }
}
