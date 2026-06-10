import { Locator, Page } from "@playwright/test";

export type StockAdjustOp =
  | "Consumo (−)"
  | "Merma (−)"
  | "Ajuste: sumar (+)"
  | "Ajuste: restar (−)";

/** Insumo detail page (app/(dashboard)/insumos/[id]/page.tsx): current stock,
 * adjust form, and the stock-movement ledger. */
export class InsumoDetailPage {
  constructor(private readonly page: Page) {}

  get stockHeading(): Locator {
    return this.page.getByText("Stock actual");
  }
  get ledgerTable(): Locator {
    return this.page.getByRole("table");
  }

  /**
   * Apply a stock adjustment: pick the op, type qty + optional reason, submit.
   * @param {StockAdjustOp} op - Adjustment kind (visible option label).
   * @param {number} qty - Positive quantity.
   * @param {string} [reason] - Optional note.
   * @returns {Promise<void>}
   */
  async adjust(op: StockAdjustOp, qty: number, reason?: string): Promise<void> {
    await this.page.getByLabel("Tipo de ajuste").click();
    await this.page.getByRole("option", { name: op }).click();
    await this.page.getByLabel("Cantidad").fill(String(qty));
    if (reason) await this.page.getByLabel("Motivo").fill(reason);
    await this.page.getByRole("button", { name: "Aplicar ajuste" }).click();
  }

  /**
   * A ledger row containing the given text (kind, reason, or signed delta).
   * @param {string} text - Text contained in the row.
   * @returns {Locator}
   */
  ledgerRowByText(text: string): Locator {
    return this.page.getByRole("row").filter({ hasText: text });
  }
}
