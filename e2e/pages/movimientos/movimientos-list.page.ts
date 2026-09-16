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
   * Open the movements list, optionally filtered by a description search.
   * The list paginates and defaults to the current month, so a spec asserting
   * its own row MUST pass `q` — otherwise the row can sit on page 2 once the
   * stateful dev DB accumulates movements.
   * @param {{ q?: string }} [params] - Optional description search.
   * @returns {Promise<void>}
   */
  async open(params?: { q?: string }): Promise<void> {
    const query = params?.q ? `?q=${encodeURIComponent(params.q)}` : "";
    await this.page.goto(`${Routes.MOVIMIENTOS}${query}`);
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
