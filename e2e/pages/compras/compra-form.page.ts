import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

export type CompraLineInput = { insumoName: string; qty: number; unitCost: number };

/** New-purchase form (components/compras/CompraForm.tsx). */
export class CompraFormPage {
  constructor(private readonly page: Page) {}

  get submitButton(): Locator {
    return this.page.getByRole("button", { name: "Registrar compra" });
  }
  get addLineButton(): Locator {
    return this.page.getByRole("button", { name: "Agregar línea" });
  }

  /**
   * Open the new-purchase form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.COMPRAS_NUEVO);
  }

  /**
   * Pick the supplier in the Radix Select.
   * @param {string} name - Supplier name (visible option label).
   * @returns {Promise<void>}
   */
  async selectProveedor(name: string): Promise<void> {
    await this.page.getByLabel("Proveedor").click();
    await this.page.getByRole("option", { name }).click();
  }

  /**
   * Fill a single line: pick the insumo and type qty + unit cost.
   * @param {number} index - Zero-based line index.
   * @param {CompraLineInput} line - Insumo name, quantity and unit cost (pesos).
   * @returns {Promise<void>}
   */
  async fillLine(index: number, line: CompraLineInput): Promise<void> {
    await this.page.getByLabel(`Insumo línea ${index + 1}`).click();
    await this.page.getByRole("option", { name: line.insumoName }).click();
    await this.page.getByLabel("Cantidad").nth(index).fill(String(line.qty));
    await this.page.getByLabel("Costo unit. ($)").nth(index).fill(String(line.unitCost));
  }

  /**
   * Submit the purchase and wait for redirect back to the compras list.
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(`**${Routes.COMPRAS}`);
  }
}
