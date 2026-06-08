import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/**
 * Read-only calendar page (app/(dashboard)/calendario/page.tsx +
 * components/calendario/CalendarClient.tsx — react-big-calendar). Day/Week/Month/
 * Agenda views; events are color-coded by state and titled with the event name.
 */
export class CalendarioPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Calendario" });
  }

  /** The "Hoy" toolbar button — present only once the calendar toolbar mounts. */
  get container(): Locator {
    return this.page.getByRole("button", { name: "Hoy" });
  }

  /** "Nuevo evento" link in the page header. */
  get newEventLink(): Locator {
    return this.page.getByRole("link", { name: "Nuevo evento" });
  }

  /**
   * A view-switch button (custom toolbar): "Mes", "Semana", "Día", "Lista".
   * @param {string} label - Visible view label.
   * @returns {Locator}
   */
  viewButton(label: string): Locator {
    return this.page.getByRole("button", { name: label, exact: true });
  }

  /**
   * Open the calendar page.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.CALENDARIO);
  }

  /**
   * Switch the calendar view by its visible label ("Mes"/"Semana"/"Día"/"Lista").
   * @param {string} label - View label to activate.
   * @returns {Promise<void>}
   */
  async switchView(label: string): Promise<void> {
    await this.viewButton(label).click();
  }

  /**
   * An event chip on the calendar identified by its title (event name).
   * @param {string} name - Event name shown on the chip.
   * @returns {Locator}
   */
  eventByName(name: string): Locator {
    return this.page.getByText(name).first();
  }
}
