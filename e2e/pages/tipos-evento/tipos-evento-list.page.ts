import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/** Event-types list page (app/(dashboard)/tipos-evento/page.tsx). */
export class TiposEventoListPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Tipos de evento" });
  }
  get newButton(): Locator {
    return this.page.getByRole("link", { name: "Nuevo tipo" });
  }
  get searchInput(): Locator {
    return this.page.getByPlaceholder("Nombre…");
  }

  /**
   * Open the event-types list.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.TIPOS_EVENTO);
  }

  /**
   * Search by free text (submits the GET filter form).
   * @param {string} query - Search term.
   * @returns {Promise<void>}
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
    await this.page.waitForURL(/[?&]q=/);
  }

  /**
   * Table cell containing the given event-type name.
   * @param {string} name - Event-type name.
   * @returns {Locator}
   */
  rowByName(name: string): Locator {
    return this.page.getByRole("cell", { name: new RegExp(name) });
  }
}
