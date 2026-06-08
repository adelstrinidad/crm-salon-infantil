import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

export type TipoEventoFormData = {
  name: string;
};

/** Create/edit event-type form (components/eventTypes/EventTypeForm.tsx). */
export class TipoEventoFormPage {
  constructor(private readonly page: Page) {}

  get nameInput(): Locator {
    return this.page.getByLabel("Nombre");
  }
  get submitButton(): Locator {
    return this.page.getByRole("button", { name: /Crear tipo|Guardar/ });
  }
  get errorMessage(): Locator {
    return this.page.getByText(/requerid|error|inválid/i);
  }

  /**
   * Open the new-event-type form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.TIPOS_EVENTO_NUEVO);
  }

  /**
   * Fill the form fields.
   * @param {TipoEventoFormData} data - Event-type field values.
   * @returns {Promise<void>}
   */
  async fill(data: TipoEventoFormData): Promise<void> {
    await this.nameInput.fill(data.name);
  }

  /**
   * Submit the form and wait for redirect back to the event-type list.
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.TIPOS_EVENTO}`);
  }
}
