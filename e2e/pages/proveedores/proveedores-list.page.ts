import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/** Suppliers list page (app/(dashboard)/proveedores/page.tsx). */
export class ProveedoresListPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Proveedores" });
  }
  get newButton(): Locator {
    return this.page.getByRole("link", { name: "Nuevo proveedor" });
  }
  get searchInput(): Locator {
    return this.page.getByRole("textbox").first();
  }

  /**
   * Open the suppliers list.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.PROVEEDORES);
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
   * Cell containing the given supplier name in the list.
   * @param {string} name - Supplier name.
   * @returns {Locator}
   */
  rowByName(name: string): Locator {
    return this.page.getByRole("cell", { name: new RegExp(name) });
  }
}
