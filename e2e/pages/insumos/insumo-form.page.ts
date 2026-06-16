import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

export type InsumoFormData = {
  name: string;
  stockQty?: number;
  minStock?: number;
  /** "Precio evento" in pesos, as typed into the money input. */
  eventPrice?: string;
  notes?: string;
};

/** Create/edit supply form (components/insumos/InsumoForm.tsx). */
export class InsumoFormPage {
  constructor(private readonly page: Page) {}

  get nameInput(): Locator {
    return this.page.getByLabel(/Nombre/);
  }
  get stockInput(): Locator {
    return this.page.getByLabel("Stock actual");
  }
  get minStockInput(): Locator {
    return this.page.getByLabel("Stock mínimo");
  }
  get eventPriceInput(): Locator {
    return this.page.getByLabel(/Precio evento/);
  }
  get notesInput(): Locator {
    return this.page.getByLabel("Notas");
  }
  get submitButton(): Locator {
    return this.page.getByRole("button", { name: /Crear insumo|Guardar/ });
  }
  get errorMessage(): Locator {
    return this.page.getByText(/error|requerid|inválid|negativo|entero/i);
  }

  /**
   * Open the new-supply form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.INSUMOS_NUEVO);
  }

  /**
   * Fill the provided fields (only keys present are typed). Unit keeps its
   * default ("Unidad"); set it explicitly in a test that needs another unit.
   * @param {InsumoFormData} data - Supply field values.
   * @returns {Promise<void>}
   */
  async fill(data: InsumoFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.stockQty !== undefined) await this.stockInput.fill(String(data.stockQty));
    if (data.minStock !== undefined) await this.minStockInput.fill(String(data.minStock));
    if (data.eventPrice !== undefined) await this.eventPriceInput.fill(data.eventPrice);
    if (data.notes) await this.notesInput.fill(data.notes);
  }

  /**
   * Submit the form and wait for redirect back to the supplies list.
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.INSUMOS}`);
  }
}
