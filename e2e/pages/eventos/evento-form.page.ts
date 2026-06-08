import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";
import { Seeded } from "../../config/timeouts";
import { uniqueSlot } from "../../helpers/util/slot";

export type EventoBasics = {
  name: string;
  /** Event type option label (Radix Select). Defaults to the seeded type. */
  tipo?: string;
  /** Client option label (combobox). Defaults to the seeded client. */
  cliente?: string;
};

/**
 * New-event form. The price is never entered by hand (derived from services).
 * Creating reserves a future, unique, non-overlapping slot. Both "Reservar" and
 * "Presupuestar" redirect to the edit page; the action returns the new event id.
 */
export class EventoFormPage {
  constructor(private readonly page: Page) {}

  get nameInput(): Locator {
    return this.page.getByRole("textbox", { name: "Nombre del evento" });
  }
  get tipoSelect(): Locator {
    return this.page.getByLabel("Tipo de evento");
  }
  get clientePicker(): Locator {
    return this.page.getByText("Seleccionar cliente…");
  }
  get inicioInput(): Locator {
    return this.page.getByRole("textbox", { name: "Inicio" });
  }
  get finInput(): Locator {
    return this.page.getByRole("textbox", { name: "Fin" });
  }
  get reservarButton(): Locator {
    return this.page.getByRole("button", { name: "Reservar" });
  }
  get presupuestarButton(): Locator {
    return this.page.getByRole("button", { name: "Presupuestar" });
  }

  /**
   * Open the new-event form.
   * @returns {Promise<void>}
   */
  async openNew(): Promise<void> {
    await this.page.goto(Routes.EVENTOS_NUEVO);
  }

  /**
   * Fill name, type, client and a unique future time slot.
   * @param {EventoBasics} basics - Event name and optional type/client labels.
   * @returns {Promise<void>}
   */
  async fillBasics(basics: EventoBasics): Promise<void> {
    await this.nameInput.fill(basics.name);
    await this.tipoSelect.click();
    await this.page.getByRole("option", { name: basics.tipo ?? Seeded.EVENT_TYPE }).click();
    await this.clientePicker.click();
    await this.page.getByRole("option", { name: basics.cliente ?? Seeded.CLIENT }).click();
    const { start, end } = uniqueSlot();
    await this.inicioInput.fill(start);
    await this.finInput.fill(end);
  }

  /**
   * Click "Reservar", wait for the edit redirect, return the new event id.
   * @returns {Promise<string>} The created event's id.
   */
  async reservar(): Promise<string> {
    await this.reservarButton.click();
    return this.captureId();
  }

  /**
   * Click "Presupuestar" (quote), wait for the edit redirect, return the id.
   * @returns {Promise<string>} The created event's id.
   */
  async presupuestar(): Promise<string> {
    await this.presupuestarButton.click();
    return this.captureId();
  }

  private async captureId(): Promise<string> {
    await this.page.waitForURL(/\/eventos\/[^/]+\/editar$/);
    return this.page.url().match(/\/eventos\/([^/]+)\/editar$/)![1];
  }
}
