import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/** Providers list page (app/(dashboard)/prestadores/page.tsx). */
export class PrestadoresListPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Prestadores" });
  }
  get newButton(): Locator {
    return this.page.getByRole("link", { name: "Nuevo prestador" });
  }
  get searchInput(): Locator {
    return this.page.getByPlaceholder("Nombre o rol…");
  }

  /**
   * Open the providers list.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.PRESTADORES);
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
   * Table cell containing the given provider name.
   * @param {string} name - Provider name.
   * @returns {Locator}
   */
  rowByName(name: string): Locator {
    return this.page.getByRole("cell", { name: new RegExp(name) });
  }
}
