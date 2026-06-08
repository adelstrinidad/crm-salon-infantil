import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

export type CuentaFormData = {
  name: string;
  description?: string;
};

/** Create/edit financial account form (components/finanzas/AccountForm.tsx). */
export class CuentaFormPage {
  constructor(private readonly page: Page) {}

  get nameInput(): Locator {
    return this.page.getByLabel("Nombre de la cuenta");
  }
  get descriptionInput(): Locator {
    return this.page.getByLabel("Descripción");
  }
  get submitButton(): Locator {
    return this.page.getByRole("button", { name: /Crear cuenta|Guardar/ });
  }
  get errorMessage(): Locator {
    return this.page.getByText(/requerid|error|inválid/i);
  }

  /**
   * Open the new-account form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.FINANZAS_CUENTAS_NUEVA);
  }

  /**
   * Fill all provided fields (only keys present are typed).
   * @param {CuentaFormData} data - Account field values.
   * @returns {Promise<void>}
   */
  async fill(data: CuentaFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.description) await this.descriptionInput.fill(data.description);
  }

  /**
   * Submit the form and wait for redirect back to the finanzas list.
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.FINANZAS}`);
  }
}
