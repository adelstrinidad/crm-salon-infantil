import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/**
 * Read-only reports hub (app/(dashboard)/reportes/page.tsx). Renders a date/state
 * filter form (GET) plus three sections: balance by event type, per-event
 * breakdown, and movements not tied to an event.
 */
export class ReportesPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Reportes", level: 1 });
  }
  get balanceByTypeSection(): Locator {
    return this.page.getByRole("heading", { name: "Balance por tipo de evento" });
  }
  get eventBreakdownSection(): Locator {
    return this.page.getByRole("heading", { name: "Detalle por evento" });
  }
  get movementsWithoutEventSection(): Locator {
    return this.page.getByRole("heading", { name: "Movimientos sin evento" });
  }
  get fromDateInput(): Locator {
    return this.page.getByLabel("Fecha desde");
  }
  get toDateInput(): Locator {
    return this.page.getByLabel("Fecha hasta");
  }
  get filterButton(): Locator {
    return this.page.getByRole("button", { name: "Filtrar" });
  }

  /**
   * Open the reports hub.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.REPORTES);
  }

  /**
   * A balance summary card by its label (e.g. "Balance total", "Ingresos eventos").
   * @param {string} label - Card label text.
   * @returns {Locator}
   */
  summaryCard(label: string): Locator {
    return this.page.getByText(label, { exact: true }).first();
  }

  /**
   * First element showing a piece of visible text (figure or label).
   * @param {string} value - Visible text to match.
   * @returns {Locator}
   */
  text(value: string): Locator {
    return this.page.getByText(value).first();
  }
}
