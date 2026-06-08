import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/**
 * Pago a personal page (app/(dashboard)/pagos/personal/page.tsx).
 * Lists internal staff hourly costs owed. A row is only payable once its real
 * hours are logged; until then it shows a "Registrá las horas" prompt instead
 * of a "Pagar" button. Payable rows use the inline "Pagar" → "Confirmar" flow.
 */
export class PagoPersonalPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Pago a personal" });
  }
  get pendienteBadge(): Locator {
    return this.page.getByText("Pendiente").first();
  }
  get pagadoBadge(): Locator {
    return this.page.getByText(/Pagado/).first();
  }

  /**
   * Open the personal payments page.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.PAGOS_PERSONAL);
  }

  /**
   * The table row containing the given text (staff or event name).
   * @param {string} text - Text contained in the row.
   * @returns {Locator}
   */
  rowByText(text: string): Locator {
    return this.page.getByRole("row").filter({ hasText: text });
  }

  /**
   * The "Pagar" button within a row (absent until real hours are logged).
   * @param {string} rowText - Text identifying the row.
   * @returns {Locator}
   */
  payButton(rowText: string): Locator {
    return this.rowByText(rowText).getByRole("button", { name: "Pagar" });
  }

  /**
   * The "Registrá las horas" prompt within a row (shown before hours are logged).
   * @param {string} rowText - Text identifying the row.
   * @returns {Locator}
   */
  needsHoursPrompt(rowText: string): Locator {
    return this.rowByText(rowText).getByText("Registrá las horas");
  }

  /**
   * Pay a row: click its "Pagar", then "Confirmar" within the same row.
   * Requires the staff member's real hours to already be logged.
   * @param {string} rowText - Text identifying the row (staff or event name).
   * @returns {Promise<void>}
   */
  async pay(rowText: string): Promise<void> {
    const row = this.rowByText(rowText);
    await row.getByRole("button", { name: "Pagar" }).click();
    await row.getByRole("button", { name: "Confirmar" }).click();
  }
}
