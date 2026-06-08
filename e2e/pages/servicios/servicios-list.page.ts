import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/** Services list page (app/(dashboard)/servicios/page.tsx). */
export class ServiciosListPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Servicios" });
  }
  get newButton(): Locator {
    return this.page.getByRole("link", { name: "Nuevo servicio" });
  }
  get searchInput(): Locator {
    return this.page.getByPlaceholder("Nombre o descripción…");
  }

  /**
   * Open the services list.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.SERVICIOS);
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
   * Table/card cell containing the given service name.
   * @param {string} name - Service name.
   * @returns {Locator}
   */
  rowByName(name: string): Locator {
    return this.page.getByText(name).first();
  }
}
