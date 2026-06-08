import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

export type ServicioFormData = {
  name: string;
  description?: string;
  cost?: string;
  price?: string;
};

/** Create/edit service form (components/servicios/ServiceForm.tsx). */
export class ServicioFormPage {
  constructor(private readonly page: Page) {}

  get nameInput(): Locator {
    return this.page.getByLabel("Nombre del servicio");
  }
  get descriptionInput(): Locator {
    return this.page.getByLabel("Descripción");
  }
  get costInput(): Locator {
    return this.page.getByRole("spinbutton", { name: "Costo (lo que pagás)" });
  }
  get priceInput(): Locator {
    return this.page.getByRole("spinbutton", { name: "Precio (lo que cobrás)" });
  }
  get submitButton(): Locator {
    return this.page.getByRole("button", { name: /Crear servicio|Guardar/ });
  }
  get errorMessage(): Locator {
    return this.page.getByText(/requerid|error|inválid/i);
  }

  /**
   * Open the new-service form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.SERVICIOS_NUEVO);
  }

  /**
   * Fill all provided fields (only keys present are typed).
   * @param {ServicioFormData} data - Service field values (cost/price in pesos).
   * @returns {Promise<void>}
   */
  async fill(data: ServicioFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.description) await this.descriptionInput.fill(data.description);
    if (data.cost) await this.costInput.fill(data.cost);
    if (data.price) await this.priceInput.fill(data.price);
  }

  /**
   * Submit the form and wait for redirect back to the service list.
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.SERVICIOS}`);
  }
}
