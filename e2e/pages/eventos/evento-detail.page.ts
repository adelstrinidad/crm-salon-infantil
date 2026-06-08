import { Locator, Page } from "@playwright/test";

/** Read-only event detail page (/eventos/{id}) with the financial summary. */
export class EventoDetailPage {
  constructor(private readonly page: Page) {}

  get registrarCobroButton(): Locator {
    return this.page.getByRole("button", { name: "Registrar cobro" });
  }

  /**
   * Open an event's detail page.
   * @param {string} id - Event id.
   * @returns {Promise<void>}
   */
  async open(id: string): Promise<void> {
    await this.page.goto(`/eventos/${id}`);
  }

  /**
   * The event-state badge text (e.g. "Reservado", "Señado", "Pagado").
   * @param {string} label - State label.
   * @returns {Locator}
   */
  stateBadge(label: string): Locator {
    return this.page.getByText(label).first();
  }

  /**
   * A financial-summary row whose accessible name matches the pattern, e.g.
   * `/Saldo \$10\.000/`, `/Cobrado \$4\.000/`.
   * @param {RegExp} namePattern - Row name pattern.
   * @returns {Locator}
   */
  summaryRow(namePattern: RegExp): Locator {
    return this.page.getByRole("row", { name: namePattern });
  }

  /**
   * The "Saldo" (outstanding balance) summary row for a formatted amount.
   * @param {string} formattedMoney - e.g. money(6000) → "$6.000".
   * @returns {Locator}
   */
  balanceRow(formattedMoney: string): Locator {
    return this.summaryRow(new RegExp(`Saldo ${escapeRegExp(formattedMoney)}`));
  }

  /**
   * The "Cobrado" (collected) summary row for a formatted amount.
   * @param {string} formattedMoney - e.g. money(4000) → "$4.000".
   * @returns {Locator}
   */
  collectedRow(formattedMoney: string): Locator {
    return this.summaryRow(new RegExp(`Cobrado ${escapeRegExp(formattedMoney)}`));
  }

  /**
   * A movement table cell whose accessible name matches (e.g. /Cobro —/ for the
   * default cobro description).
   * @param {RegExp} namePattern - Cell name pattern.
   * @returns {Locator}
   */
  movementCell(namePattern: RegExp): Locator {
    return this.page.getByRole("cell", { name: namePattern }).first();
  }

  /**
   * A row identified by free text (e.g. a staff name), for status assertions.
   * @param {string} text - Text contained in the row.
   * @returns {Locator}
   */
  rowByText(text: string): Locator {
    return this.page.getByRole("row").filter({ hasText: text });
  }

  /**
   * First element showing a piece of visible text (e.g. a summary label or name).
   * @param {string} value - Visible text to match.
   * @returns {Locator}
   */
  text(value: string): Locator {
    return this.page.getByText(value).first();
  }

  /**
   * Open the "Registrar cobro" modal and record a payment from the detail page.
   * @param {string} amountPesos - Amount in pesos.
   * @returns {Promise<void>}
   */
  async registrarCobro(amountPesos: string): Promise<void> {
    await this.registrarCobroButton.click();
    await this.page.getByRole("spinbutton").fill(amountPesos);
    await this.page.getByRole("button", { name: "Cobrar" }).click();
  }
}

// money() output contains "$" and "." — escape them for use inside a RegExp.
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
