import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

export type ProveedorFormData = {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
};

/** Create/edit supplier form (components/proveedores/ProveedorForm.tsx). */
export class ProveedorFormPage {
  constructor(private readonly page: Page) {}

  get nameInput(): Locator {
    return this.page.getByLabel(/Nombre/);
  }
  get descriptionInput(): Locator {
    return this.page.getByLabel("Descripción");
  }
  get phoneInput(): Locator {
    return this.page.getByLabel("Teléfono");
  }
  get emailInput(): Locator {
    return this.page.getByLabel("Email");
  }
  get submitButton(): Locator {
    return this.page.getByRole("button", { name: /Crear proveedor|Guardar/ });
  }
  get errorMessage(): Locator {
    return this.page.getByText(/error|requerid|inválid/i);
  }

  /**
   * Open the new-supplier form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.PROVEEDORES_NUEVO);
  }

  /**
   * Fill all provided fields (only keys present are typed).
   * @param {ProveedorFormData} data - Supplier field values.
   * @returns {Promise<void>}
   */
  async fill(data: ProveedorFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.description) await this.descriptionInput.fill(data.description);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.email) await this.emailInput.fill(data.email);
  }

  /**
   * Submit the form and wait for redirect back to the supplier list.
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.PROVEEDORES}`);
  }
}
