import { expect, Locator, Page } from "@playwright/test";
import { Messages } from "../../enums/app/messages";
import { Seeded } from "../../config/timeouts";

/**
 * Event edit page. Pickers (services, staff, providers) and the Estado select
 * autosave — there is no "Guardar cambios" button; after a change the global
 * indicator shows "Guardado" (Messages.SAVED). Money is entered in pesos.
 */
export class EventoEditPage {
  constructor(private readonly page: Page) {}

  get savedIndicator(): Locator {
    return this.page.getByText(Messages.SAVED, { exact: true });
  }
  // Exact match: "Estado" is a substring of "prESTADOr" ("Agregar prestador",
  // "Costo prestador"), so a non-exact getByLabel would match those too.
  get estadoSelect(): Locator {
    return this.page.getByRole("combobox", { name: "Estado", exact: true });
  }
  get staffMissingFlag(): Locator {
    return this.page.getByText(Messages.STAFF_HOURS_MISSING);
  }
  get registrarCobroButton(): Locator {
    return this.page.getByRole("button", { name: "Registrar cobro" });
  }

  /**
   * First element showing a piece of visible text (e.g. a formatted amount).
   * @param {string} value - Visible text to match.
   * @returns {Locator}
   */
  text(value: string): Locator {
    return this.page.getByText(value).first();
  }

  /**
   * Open the edit page for an event.
   * @param {string} id - Event id.
   * @returns {Promise<void>}
   */
  async open(id: string): Promise<void> {
    await this.page.goto(`/eventos/${id}/editar`);
  }

  /**
   * Add a service line (price feeds the derived total). Auto-saves.
   * @param {string} [name] - Service option label; defaults to the seeded service.
   * @returns {Promise<void>}
   */
  async addService(name: string = Seeded.SERVICE): Promise<void> {
    await this.page.getByRole("combobox", { name: "Agregar servicio" }).click();
    await this.page.getByRole("option", { name: new RegExp(name) }).click();
    await this.page.getByRole("button", { name: "Agregar servicio" }).click();
    await expect(this.page.getByRole("cell", { name }).first()).toBeVisible();
  }

  /**
   * Assign a staff member with an estimated number of hours. Auto-saves.
   * @param {string} staffName - Staff option label.
   * @param {string} hours - Estimated hours (whole number string).
   * @returns {Promise<void>}
   */
  async assignStaff(staffName: string, hours: string): Promise<void> {
    await this.page.getByLabel("Agregar empleado").click();
    await this.page.getByRole("option", { name: staffName }).click();
    await this.page.getByRole("spinbutton", { name: "Horas" }).fill(hours);
    await this.page.getByRole("button", { name: "Agregar", disabled: false }).click();
    await expect(this.page.getByText(staffName).first()).toBeVisible();
  }

  /**
   * The assignment card (listitem) for a staff member.
   * @param {string} staffName - Staff name.
   * @returns {Locator}
   */
  staffCard(staffName: string): Locator {
    return this.page.getByRole("listitem").filter({ hasText: staffName });
  }

  /**
   * The "Guardar" (log real hours) button on a staff card.
   * @param {string} staffName - Staff name.
   * @returns {Locator}
   */
  staffSaveButton(staffName: string): Locator {
    return this.staffCard(staffName).getByRole("button", { name: "Guardar" });
  }

  /**
   * Type real worked hours on a staff card WITHOUT saving (for enable/disable
   * assertions).
   * @param {string} staffName - Staff name.
   * @param {string} hours - Whole hours.
   * @param {string} [minutes] - Optional minutes ("30").
   * @returns {Promise<void>}
   */
  async draftStaffHours(staffName: string, hours: string, minutes?: string): Promise<void> {
    const card = this.staffCard(staffName);
    await card.getByRole("spinbutton", { name: "Horas" }).fill(hours);
    if (minutes) {
      await card.getByRole("combobox", { name: "Minutos" }).click();
      await this.page.getByRole("option", { name: minutes }).click();
    }
  }

  /**
   * Assign a provider (prestador). The cost prefills from the catalog snapshot;
   * pass costPesos to override it. Auto-saves.
   * @param {string} providerName - Provider option label.
   * @param {string} [costPesos] - Optional per-event cost override (pesos).
   * @returns {Promise<void>}
   */
  async addProvider(providerName: string, costPesos?: string): Promise<void> {
    await this.page.getByRole("combobox", { name: "Agregar prestador" }).click();
    await this.page.getByRole("option", { name: providerName }).click();
    if (costPesos !== undefined) {
      await this.page.getByRole("spinbutton", { name: "Costo prestador" }).fill(costPesos);
    }
    await this.page.getByRole("button", { name: "Agregar prestador" }).click();
    await expect(this.page.getByText(providerName).first()).toBeVisible();
  }

  /**
   * Remove an attached provider from the event (the row's "Quitar" button).
   * @param {string} providerName - Provider name identifying the row.
   * @returns {Promise<void>}
   */
  async removeProvider(providerName: string): Promise<void> {
    const quitar = this.page
      .getByRole("row")
      .filter({ hasText: providerName })
      .getByRole("button", { name: "Quitar" });
    await quitar.click();
    // Wait for the attached-row to detach (removal committed + re-render). The
    // name reappears in the "Agregar prestador" dropdown, so don't assert on the
    // whole page — only that this row's Quitar is gone.
    await expect(quitar).toHaveCount(0);
  }

  /**
   * Log real worked hours on a staff assignment card and save them.
   * @param {string} staffName - Staff name (identifies the card).
   * @param {string} hours - Whole hours.
   * @param {string} [minutes] - Optional minutes ("30"); omitted leaves :00.
   * @returns {Promise<void>}
   */
  async logStaffHours(staffName: string, hours: string, minutes?: string): Promise<void> {
    await this.draftStaffHours(staffName, hours, minutes);
    await this.staffSaveButton(staffName).click();
  }

  /**
   * Change the event state via the Estado select and wait for autosave.
   * @param {string} estadoLabel - Option label, e.g. "Pagado".
   * @returns {Promise<void>}
   */
  async setEstado(estadoLabel: string): Promise<void> {
    await this.estadoSelect.click();
    await this.page.getByRole("option", { name: estadoLabel }).click();
    await expect(this.savedIndicator).toBeVisible();
  }

  /**
   * Open the "Registrar cobro" modal and record a payment.
   * @param {string} amountPesos - Amount in pesos.
   * @returns {Promise<void>}
   */
  async registrarCobro(amountPesos: string): Promise<void> {
    await this.registrarCobroButton.click();
    await this.page.getByRole("spinbutton").fill(amountPesos);
    await this.page.getByRole("button", { name: "Cobrar" }).click();
  }
}
