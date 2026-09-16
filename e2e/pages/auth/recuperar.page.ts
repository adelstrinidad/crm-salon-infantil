import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";
import { Messages } from "../../enums/app/messages";

// Password recovery screen (/recuperar): two routes behind a tab switch —
// manager approval code, and an emailed single-use link.
export class RecuperarPage {
  constructor(private readonly page: Page) {}

  get codigoTab(): Locator {
    return this.page.getByRole("tab", { name: "Código de encargado" });
  }

  get emailTab(): Locator {
    return this.page.getByRole("tab", { name: "Enlace por email" });
  }

  get managerCodeInput(): Locator {
    return this.page.getByLabel("Código de encargado");
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

  get emailInput(): Locator {
    return this.page.getByRole("textbox", { name: "Email" });
  }

  get sendLinkButton(): Locator {
    return this.page.getByRole("button", { name: Messages.RESET_SEND_LINK });
  }

  /**
   * Open the recovery screen directly.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.RECUPERAR);
  }

  /**
   * Fill and submit the manager-code reset form.
   * @param {string} code - Manager approval code.
   * @param {string} newPassword - Password to set (also used as confirmation).
   * @returns {Promise<void>}
   */
  async resetWithManagerCode(code: string, newPassword: string): Promise<void> {
    await this.codigoTab.click();
    await this.managerCodeInput.fill(code);
    await this.passwordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.submitButton.click();
  }

  /**
   * Request an emailed reset link.
   * @param {string} email - Address to send the link to.
   * @returns {Promise<void>}
   */
  async requestEmailLink(email: string): Promise<void> {
    await this.emailTab.click();
    await this.emailInput.fill(email);
    await this.sendLinkButton.click();
  }
}
