import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/** Clients list page (app/(dashboard)/clientes/page.tsx). */
export class ClientesListPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Clientes" });
  }
  get newButton(): Locator {
    return this.page.getByRole("link", { name: "Nuevo cliente" });
  }
  get searchInput(): Locator {
    return this.page.getByRole("textbox").first();
  }

  /**
   * Open the clients list.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.CLIENTES);
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
   * Row containing the given client name (links to its detail page).
   * @param {string} name - Client name.
   * @returns {Locator}
   */
  rowByName(name: string): Locator {
    return this.page.getByRole("link", { name: new RegExp(name) });
  }
}
