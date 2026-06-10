import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/** Supplies (insumos) list page (app/(dashboard)/insumos/page.tsx). */
export class InsumosListPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Insumos" });
  }
  get newButton(): Locator {
    return this.page.getByRole("link", { name: "Nuevo insumo" });
  }
  get searchInput(): Locator {
    return this.page.getByRole("textbox").first();
  }

  /**
   * Open the supplies list.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.INSUMOS);
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
   * Cell containing the given supply name in the list.
   * @param {string} name - Supply name.
   * @returns {Locator}
   */
  rowByName(name: string): Locator {
    return this.page.getByRole("cell", { name: new RegExp(name) });
  }
}
