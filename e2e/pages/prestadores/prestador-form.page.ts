import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

export type PrestadorFormData = {
  name: string;
  role?: string;
  cost?: string;
};

/** Create/edit provider form (components/prestadores/ProviderForm.tsx). */
export class PrestadorFormPage {
  constructor(private readonly page: Page) {}

  get nameInput(): Locator {
    return this.page.getByLabel("Nombre");
  }
  get roleInput(): Locator {
    return this.page.getByLabel("Rol");
  }
  get costInput(): Locator {
    return this.page.getByRole("spinbutton", { name: "Costo por evento" });
  }
  get submitButton(): Locator {
    return this.page.getByRole("button", { name: /Crear prestador|Guardar/ });
  }
  get errorMessage(): Locator {
    return this.page.getByText(/error|requerid|inválid/i);
  }

  /**
   * Open the new-provider form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.PRESTADORES_NUEVO);
  }

  /**
   * Fill all provided fields (only keys present are typed).
   * @param {PrestadorFormData} data - Provider field values.
   * @returns {Promise<void>}
   */
  async fill(data: PrestadorFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.role) await this.roleInput.fill(data.role);
    if (data.cost) await this.costInput.fill(data.cost);
  }

  /**
   * Submit the form and wait for redirect back to the provider list.
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.PRESTADORES}`);
  }
}
