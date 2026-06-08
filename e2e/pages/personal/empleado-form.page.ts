import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

export type EmpleadoFormData = {
  name: string;
  role?: string;
  hourlyRate?: string;
};

/** Create/edit staff form (components/personal/StaffForm.tsx). */
export class EmpleadoFormPage {
  constructor(private readonly page: Page) {}

  get nameInput(): Locator {
    return this.page.getByLabel("Nombre");
  }
  get roleInput(): Locator {
    return this.page.getByLabel("Rol");
  }
  get hourlyRateInput(): Locator {
    return this.page.getByRole("spinbutton", { name: "Costo por hora" });
  }
  get submitButton(): Locator {
    return this.page.getByRole("button", { name: /Crear empleado|Guardar/ });
  }
  get errorMessage(): Locator {
    return this.page.getByText(/error|requerid|inválid/i);
  }

  /**
   * Open the new-staff form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.PERSONAL_NUEVO);
  }

  /**
   * Fill all provided fields (only keys present are typed).
   * @param {EmpleadoFormData} data - Staff field values.
   * @returns {Promise<void>}
   */
  async fill(data: EmpleadoFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.role) await this.roleInput.fill(data.role);
    if (data.hourlyRate) await this.hourlyRateInput.fill(data.hourlyRate);
  }

  /**
   * Submit the form and wait for redirect back to the staff list.
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.PERSONAL}`);
  }
}
