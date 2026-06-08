import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/**
 * Pago a prestadores page (app/(dashboard)/pagos/prestadores/page.tsx).
 * Lists per-event provider costs owed, each row with an inline
 * "Pagar" → "Confirmar" action and a Pendiente/Pagado status badge.
 */
export class PagoPrestadoresPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Pago a prestadores" });
  }
  get pendienteBadge(): Locator {
    return this.page.getByText("Pendiente").first();
  }
  get pagadoBadge(): Locator {
    return this.page.getByText(/Pagado/).first();
  }

  /**
   * Open the prestadores payments page.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.PAGOS_PRESTADORES);
  }

  /**
   * The table row containing the given text (provider or event name).
   * @param {string} text - Text contained in the row.
   * @returns {Locator}
   */
  rowByText(text: string): Locator {
    return this.page.getByRole("row").filter({ hasText: text });
  }

  /**
   * Pay a row: click its "Pagar", then "Confirmar" within the same row.
   * @param {string} rowText - Text identifying the row (provider or event name).
   * @returns {Promise<void>}
   */
  async pay(rowText: string): Promise<void> {
    const row = this.rowByText(rowText);
    await row.getByRole("button", { name: "Pagar" }).click();
    await row.getByRole("button", { name: "Confirmar" }).click();
  }
}
