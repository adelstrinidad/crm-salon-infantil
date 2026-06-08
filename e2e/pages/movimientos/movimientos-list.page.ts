import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/**
 * Movements list page (app/(dashboard)/finanzas/movimientos/page.tsx).
 * Renders a single desktop `<table>` (no separate mobile card list here). The
 * list defaults to the current-month date filter, so a movement dated today is
 * visible without changing filters. Use getByRole("cell"/"row") to target the
 * table rather than ambiguous getByText.
 */
export class MovimientosListPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Movimientos" });
  }
  get newButton(): Locator {
    return this.page.getByRole("link", { name: /Movimiento/ });
  }

  /**
   * Open the movements list.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.MOVIMIENTOS);
  }

  /**
   * Table row containing the given description text.
   * @param {string} description - Movement description to match.
   * @returns {Locator}
   */
  rowByDescription(description: string): Locator {
    return this.page.getByRole("row").filter({ hasText: description });
  }

  /**
   * A table cell showing the given text (disambiguates duplicate-text matches).
   * @param {string} text - Cell text to match.
   * @returns {Locator}
   */
  cell(text: string): Locator {
    return this.page.getByRole("cell", { name: text }).first();
  }
}
