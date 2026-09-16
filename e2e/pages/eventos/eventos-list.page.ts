import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/**
 * Events list page (/eventos). Owns the per-row delete flow: each row's delete
 * trigger has a unique accessible name ("Eliminar evento <name>"); confirming
 * runs deleteEventAction. A blocked delete keeps the dialog open showing the
 * reason, so this page exposes both the success (row removed) and error locators.
 */
export class EventosListPage {
  constructor(private readonly page: Page) {}

  /** The row link for an event (its name is a link to the detail page). */
  eventLink(name: string): Locator {
    return this.page.getByRole("link", { name });
  }

  /** Per-row delete trigger (unique accessible name carries the event name). */
  deleteTrigger(name: string): Locator {
    return this.page.getByRole("button", { name: `Eliminar evento ${name}` });
  }

  /** The confirm button inside the open dialog (exact, so it never matches a trigger). */
  get confirmButton(): Locator {
    return this.page.getByRole("button", { name: "Eliminar", exact: true });
  }

  /** Error notice shown inside the dialog when a delete is refused. */
  get dialogError(): Locator {
    return this.page.getByText(/No se puede eliminar/i);
  }

  /**
   * Open the events list, optionally filtered by a search term so a single
   * event lands on page 1 (the list is paginated and the dev DB is stateful).
   * @param {string} [search] - Name/client filter applied via the `q` param.
   * @returns {Promise<void>}
   */
  async goto(search?: string): Promise<void> {
    const url = search ? `${Routes.EVENTOS}?q=${encodeURIComponent(search)}` : Routes.EVENTOS;
    await this.page.goto(url);
  }

  /**
   * Open the delete confirmation for an event and confirm it.
   * @param {string} name - Event name (matches the row's delete trigger).
   * @returns {Promise<void>}
   */
  async deleteEvent(name: string): Promise<void> {
    await this.deleteTrigger(name).click();
    await this.confirmButton.click();
  }
}
