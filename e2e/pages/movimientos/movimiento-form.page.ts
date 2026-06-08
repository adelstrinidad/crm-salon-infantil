import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";
import { Timeouts } from "../../config/timeouts";

export type MovimientoFormData = {
  /** Type label shown in the "Tipo" Radix Select option (e.g. "Ingreso"). */
  typeLabel: string;
  /** Account name shown in the "Cuenta origen" Radix Select option. */
  accountName: string;
  /** Amount in pesos (whole or decimal string), typed into the "Monto" spinbutton. */
  amountPesos: string;
  /** ISO date (yyyy-mm-dd) for the "Fecha" input. */
  date?: string;
  /** Optional free-text description. */
  description?: string;
};

/**
 * Create/edit movement form (components/finanzas/MovementForm.tsx).
 * "Tipo" and "Cuenta origen" are Radix `Select` controls — drive them by
 * clicking the labelled trigger then picking the `option`, never selectOption().
 * "Monto" is a number input (spinbutton). On success the form redirects to
 * `/finanzas` (the cancelHref default), not to the movements list.
 */
export class MovimientoFormPage {
  constructor(private readonly page: Page) {}

  // Triggers carry an aria-label (MovementForm.tsx) so they resolve by name.
  get typeTrigger(): Locator {
    return this.page.getByRole("combobox", { name: "Tipo" });
  }
  get accountTrigger(): Locator {
    return this.page.getByRole("combobox", { name: "Cuenta origen" });
  }
  get destinationTrigger(): Locator {
    return this.page.getByRole("combobox", { name: "Cuenta destino" });
  }
  get amountInput(): Locator {
    return this.page.getByRole("spinbutton", { name: "Monto" });
  }
  get dateInput(): Locator {
    return this.page.getByLabel("Fecha");
  }
  get descriptionInput(): Locator {
    return this.page.getByLabel("Descripción");
  }
  get submitButton(): Locator {
    return this.page.getByRole("button", { name: /Registrar|Guardar/ });
  }
  get errorMessage(): Locator {
    return this.page.getByText(/requerid|error|inválid/i);
  }

  /**
   * Open the new-movement form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.MOVIMIENTOS_NUEVO);
  }

  /**
   * Pick a value from a Radix Select identified by its trigger label.
   * @param {Locator} trigger - The labelled select trigger.
   * @param {string} optionName - Accessible name of the option to choose.
   * @returns {Promise<void>}
   */
  private async selectOption(trigger: Locator, optionName: string): Promise<void> {
    await trigger.click();
    await this.page.getByRole("option", { name: optionName }).click();
  }

  /**
   * Fill all provided fields (type/account use the Radix Select recipe).
   * @param {MovimientoFormData} data - Movement field values.
   * @returns {Promise<void>}
   */
  async fill(data: MovimientoFormData): Promise<void> {
    await this.selectOption(this.typeTrigger, data.typeLabel);
    await this.selectOption(this.accountTrigger, data.accountName);
    await this.amountInput.fill(data.amountPesos);
    if (data.date) await this.dateInput.fill(data.date);
    if (data.description) await this.descriptionInput.fill(data.description);
  }

  /**
   * Submit the form and wait for the redirect to the finanzas hub.
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.FINANZAS}`, {
      timeout: Timeouts.NAVIGATION,
    });
  }

  /**
   * Generic create flow: open the form, fill it, submit. Reusable by
   * balance-effect e2e flows that need a movement on the books.
   * @param {MovimientoFormData} data - Movement field values.
   * @returns {Promise<void>}
   */
  async createMovement(data: MovimientoFormData): Promise<void> {
    await this.openNew();
    await this.fill(data);
    await this.submit();
  }
}
