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

  // ── Consumos (per-table consumption) ───────────────────────────────────────

  get iniciarEventoButton(): Locator {
    return this.page.getByRole("button", { name: "Iniciar evento" });
  }
  get registrarConsumosLink(): Locator {
    return this.page.getByRole("link", { name: "Registrar consumos" });
  }
  get cerrarConsumosButton(): Locator {
    return this.page.getByRole("button", { name: "Cerrar consumos" });
  }
  get verReporteConsumosLink(): Locator {
    return this.page.getByRole("link", { name: "Ver reporte" });
  }
  get registrarPagoConsumosButton(): Locator {
    return this.page.getByRole("button", { name: "Registrar pago consumos" });
  }
  get consumosPagadoBadge(): Locator {
    return this.page.getByText(/^Pagado \d/).first();
  }

  /**
   * A consumo summary stat (Vendido / Cobrado / Pendiente) by its label — the
   * box's accessible name is "<label> <formattedMoney>".
   * @param {string} label - "Vendido" | "Cobrado" | "Pendiente".
   * @returns {Locator}
   */
  consumosStat(label: string): Locator {
    return this.page.getByRole("group", { name: new RegExp(`^${label} `) });
  }

  /** Open the consumos "Ver detalle" modal (per-table line breakdown). */
  async openConsumosDetalle(): Promise<void> {
    await this.page.getByRole("button", { name: "Ver detalle de consumos" }).click();
  }

  /** Open the movimientos "Ver detalle" modal (full movement table). */
  async openMovimientosDetalle(): Promise<void> {
    await this.page.getByRole("button", { name: "Ver detalle de movimientos" }).click();
  }

  /**
   * Start the event (state → "En curso") and open the consumption window.
   * @returns {Promise<void>}
   */
  async iniciarEvento(): Promise<void> {
    await this.iniciarEventoButton.click();
  }

  /**
   * Close the consumption bill from the detail page through the themed
   * ConfirmDialog.
   * @returns {Promise<void>}
   */
  async cerrarConsumos(): Promise<void> {
    await this.cerrarConsumosButton.click();
    await this.page.getByRole("button", { name: "Sí, cerrar" }).click();
  }

  /**
   * Open the "Registrar pago consumos" modal and confirm the bill payment
   * (amount is server-computed; only the default account is used).
   * @returns {Promise<void>}
   */
  async registrarPagoConsumos(): Promise<void> {
    await this.registrarPagoConsumosButton.click();
    await this.page.getByRole("button", { name: "Cobrar consumos" }).click();
  }
}

// money() output contains "$" and "." — escape them for use inside a RegExp.
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
