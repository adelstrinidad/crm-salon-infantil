import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/** Purchases list page (app/(dashboard)/compras/page.tsx). */
export class ComprasListPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Compras" });
  }
  get newButton(): Locator {
    return this.page.getByRole("link", { name: "Nueva compra" });
  }
  get searchInput(): Locator {
    return this.page.getByRole("textbox").first();
  }

  /**
   * Open the purchases list.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.COMPRAS);
  }

  /**
   * Search by free text (proveedor name) — submits the GET filter form.
   * @param {string} query - Search term.
   * @returns {Promise<void>}
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
    await this.page.waitForURL(/[?&]q=/);
  }

  /**
   * The table row containing the given text (proveedor name).
   * @param {string} text - Text contained in the row.
   * @returns {Locator}
   */
  rowByText(text: string): Locator {
    return this.page.getByRole("row").filter({ hasText: text });
  }
}
