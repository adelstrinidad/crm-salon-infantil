import { Locator, Page } from "@playwright/test";

/** Consumption-capture page (/eventos/{id}/consumos): per-table capture form,
 * grouped line tables, totals, and the close action. */
export class EventoConsumosPage {
  constructor(private readonly page: Page) {}

  get mesaSelect(): Locator {
    return this.page.getByLabel("Mesa", { exact: true });
  }
  get insumoSelect(): Locator {
    return this.page.getByLabel("Insumo", { exact: true });
  }
  get qtyInput(): Locator {
    return this.page.getByLabel(/Cantidad/);
  }
  get payerSelect(): Locator {
    return this.page.getByLabel("Paga", { exact: true });
  }
  get guestLabelInput(): Locator {
    return this.page.getByLabel(/Invitado \*/);
  }
  get agregarButton(): Locator {
    return this.page.getByRole("button", { name: "Agregar" });
  }
  get managerCodeInput(): Locator {
    return this.page.getByLabel("Código del encargado *");
  }
  get anularConfirmButton(): Locator {
    return this.page.getByRole("button", { name: "Anular", exact: true });
  }
  get anulacionesSection(): Locator {
    return this.page.getByRole("heading", { name: "Anulaciones" });
  }
  get cerrarConsumosButton(): Locator {
    return this.page.getByRole("button", { name: "Cerrar consumos" });
  }
  get closedBadge(): Locator {
    return this.page.getByText("Consumos cerrados");
  }
  get totalRow(): Locator {
    return this.page.getByText("Total consumos");
  }
  get errorMessage(): Locator {
    return this.page.getByText(/insuficiente|inválid|incorrecto|no se pudo/i);
  }

  /**
   * Open the consumption-capture page for an event.
   * @param {string} id - Event id.
   * @returns {Promise<void>}
   */
  async open(id: string): Promise<void> {
    await this.page.goto(`/eventos/${id}/consumos`);
  }

  /**
   * Capture one request: pick the table and insumo, type the quantity, submit.
   * Defaults to the client's bill; pass a guest name for a self-paying guest.
   * @param {string} mesaLabel - Visible table label, e.g. "Mesa 1".
   * @param {string} insumoName - Insumo name (option also shows price + stock).
   * @param {number} qty - Units requested.
   * @param {string} [guestLabel] - Self-paying guest name (switches payer to Invitado).
   * @returns {Promise<void>}
   */
  async addLine(
    mesaLabel: string,
    insumoName: string,
    qty: number,
    guestLabel?: string,
  ): Promise<void> {
    await this.mesaSelect.click();
    await this.page.getByRole("option", { name: mesaLabel }).click();
    await this.insumoSelect.click();
    await this.page.getByRole("option", { name: new RegExp(insumoName) }).click();
    await this.qtyInput.fill(String(qty));
    if (guestLabel) {
      await this.payerSelect.click();
      await this.page.getByRole("option", { name: "Invitado" }).click();
      await this.guestLabelInput.fill(guestLabel);
    }
    await this.agregarButton.click();
  }

  /**
   * Void a captured line through the manager-approved modal.
   * @param {string} insumoName - Insumo name used in the row's Anular button.
   * @param {string} managerCode - Manager approval code.
   * @param {string} [reasonLabel] - Visible reason option (defaults to the preselected one).
   * @returns {Promise<void>}
   */
  async voidLine(insumoName: string, managerCode: string, reasonLabel?: string): Promise<void> {
    await this.page.getByRole("button", { name: `Anular ${insumoName}` }).click();
    if (reasonLabel) {
      await this.page.getByLabel("Motivo").click();
      await this.page.getByRole("option", { name: reasonLabel }).click();
    }
    await this.managerCodeInput.fill(managerCode);
    await this.anularConfirmButton.click();
  }

  /**
   * The guests-card row for one self-paying guest. Matched by an EXACT cell
   * (the mesa lines table only shows the label inside a chip, never as a full
   * cell), so the two tables never collide.
   * @param {string} guestLabel - Guest name.
   * @returns {Locator}
   */
  guestRow(guestLabel: string): Locator {
    return this.page
      .getByRole("row")
      .filter({ has: this.page.getByRole("cell", { name: guestLabel, exact: true }) });
  }

  /**
   * Charge a self-paying guest from the guests card (confirm with defaults).
   * @param {string} guestLabel - Guest name.
   * @returns {Promise<void>}
   */
  async cobrarInvitado(guestLabel: string): Promise<void> {
    await this.guestRow(guestLabel).getByRole("button", { name: "Cobrar" }).click();
    await this.page.getByRole("button", { name: "Confirmar cobro" }).click();
  }

  /**
   * Close the bill through the themed ConfirmDialog, and wait until the page
   * reflects the closed state (the click alone resolves before the server
   * action lands — navigating right away would race it).
   * @returns {Promise<void>}
   */
  async cerrarConsumos(): Promise<void> {
    await this.cerrarConsumosButton.click();
    await this.page.getByRole("button", { name: "Sí, cerrar" }).click();
    await this.closedBadge.waitFor();
  }

  /**
   * Section heading of one table's group (e.g. "Mesa 1").
   * @param {string} mesaLabel - Visible table label.
   * @returns {Locator}
   */
  mesaSection(mesaLabel: string): Locator {
    return this.page.getByRole("heading", { name: mesaLabel });
  }

  /**
   * A captured line row containing the given text (insumo name or amount).
   * @param {string} text - Text contained in the row.
   * @returns {Locator}
   */
  lineRowByText(text: string): Locator {
    return this.page.getByRole("row").filter({ hasText: text });
  }

  /**
   * The captured line row for one insumo + quantity (cells render
   * "name qty precio/u total", so the qty disambiguates same-priced lines).
   * @param {string} insumoName - Insumo name.
   * @param {number} qty - Units on the line.
   * @returns {Locator}
   */
  lineRow(insumoName: string, qty: number): Locator {
    return this.page.getByRole("row", {
      name: new RegExp(`${escapeRegExp(insumoName)} ${qty} `),
    });
  }

  /**
   * The void (trash) button of a captured line. Absent once the line is voided
   * or settled — the audit table has no buttons, so this never matches it.
   * @param {string} insumoName - Insumo name used in the aria-label.
   * @returns {Locator}
   */
  anularLineButton(insumoName: string): Locator {
    return this.page.getByRole("button", { name: `Anular ${insumoName}` });
  }
}

// Insumo names carry no regex metacharacters today, but escape defensively.
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
