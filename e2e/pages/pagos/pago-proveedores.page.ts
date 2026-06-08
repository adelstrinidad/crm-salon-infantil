import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/**
 * Pago a proveedores page (app/(dashboard)/pagos/proveedores/page.tsx).
 * Lists supplier service costs owed per event, each row with an inline
 * "Pagar" → "Confirmar" action and a Pendiente/Pagado status badge.
 */
export class PagoProveedoresPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Pago a proveedores" });
  }
  get pendienteBadge(): Locator {
    return this.page.getByText("Pendiente").first();
  }
  get pagadoBadge(): Locator {
    return this.page.getByText(/Pagado/).first();
  }

  /**
   * Open the proveedores payments page.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.PAGOS_PROVEEDORES);
  }

  /**
   * The table row containing the given text (supplier, service or event name).
   * @param {string} text - Text contained in the row.
   * @returns {Locator}
   */
  rowByText(text: string): Locator {
    return this.page.getByRole("row").filter({ hasText: text });
  }

  /**
   * Pay a row: click its "Pagar", then "Confirmar" within the same row.
   * @param {string} rowText - Text identifying the row (supplier/service/event).
   * @returns {Promise<void>}
   */
  async pay(rowText: string): Promise<void> {
    const row = this.rowByText(rowText);
    await row.getByRole("button", { name: "Pagar" }).click();
    await row.getByRole("button", { name: "Confirmar" }).click();
  }
}
