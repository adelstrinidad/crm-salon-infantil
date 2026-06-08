import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

export type ClienteFormData = {
  name: string;
  phone?: string;
  email?: string;
  dni?: string;
  address?: string;
  notes?: string;
};

/** Create/edit client form (components/clients/ClientForm.tsx). */
export class ClienteFormPage {
  constructor(private readonly page: Page) {}

  get nameInput(): Locator {
    return this.page.getByLabel("Nombre");
  }
  get phoneInput(): Locator {
    return this.page.getByLabel("Teléfono");
  }
  get emailInput(): Locator {
    return this.page.getByLabel("Email");
  }
  get dniInput(): Locator {
    return this.page.getByLabel("DNI");
  }
  get addressInput(): Locator {
    return this.page.getByLabel("Dirección");
  }
  get notesInput(): Locator {
    return this.page.getByLabel("Notas");
  }
  get submitButton(): Locator {
    return this.page.getByRole("button", { name: /Crear cliente|Guardar/ });
  }
  get errorMessage(): Locator {
    return this.page.getByText(/error|requerid|inválid/i);
  }

  /**
   * Open the new-client form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.CLIENTES_NUEVO);
  }

  /**
   * Fill all provided fields (only keys present are typed).
   * @param {ClienteFormData} data - Client field values.
   * @returns {Promise<void>}
   */
  async fill(data: ClienteFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.email) await this.emailInput.fill(data.email);
    if (data.dni) await this.dniInput.fill(data.dni);
    if (data.address) await this.addressInput.fill(data.address);
    if (data.notes) await this.notesInput.fill(data.notes);
  }

  /**
   * Submit the form and wait for redirect back to the client list.
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.CLIENTES}`);
  }
}
