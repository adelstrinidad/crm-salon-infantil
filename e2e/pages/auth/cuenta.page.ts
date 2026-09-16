import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";
import { Messages } from "../../enums/app/messages";

// "Mi cuenta" (/cuenta): shows the login email and rotates the manager code.
// The password is not set here — it is chosen through /recuperar.
export class CuentaPage {
  constructor(private readonly page: Page) {}

  /**
   * Open the account screen.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.CUENTA);
  }

  get currentCodeInput(): Locator {
    return this.page.getByLabel("Código actual", { exact: true });
  }

  get codeInput(): Locator {
    return this.page.getByLabel("Código nuevo", { exact: true });
  }

  get confirmCodeInput(): Locator {
    return this.page.getByLabel("Repetir código", { exact: true });
  }

  get submitCodeButton(): Locator {
    return this.page.getByRole("button", { name: Messages.MANAGER_CODE_SUBMIT });
  }

  get forgotCodeButton(): Locator {
    return this.page.getByRole("button", { name: Messages.FORGOT_MANAGER_CODE });
  }

  /**
   * The reveal toggle next to a secret field, named after that field.
   * @param {string} fieldLabel - Visible label of the field (e.g. "Código nuevo").
   * @returns {Locator}
   */
  revealToggle(fieldLabel: string): Locator {
    return this.page.getByRole("button", { name: `Mostrar ${fieldLabel}` });
  }

  /**
   * Submit the change-manager-code form.
   * @param {string} current - Current manager code.
   * @param {string} next - New code (also used as confirmation).
   * @returns {Promise<void>}
   */
  async changeManagerCode(current: string, next: string): Promise<void> {
    await this.currentCodeInput.fill(current);
    await this.codeInput.fill(next);
    await this.confirmCodeInput.fill(next);
    await this.submitCodeButton.click();
  }
}
