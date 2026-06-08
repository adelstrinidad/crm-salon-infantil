import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/** Staff list page (app/(dashboard)/personal/page.tsx). */
export class PersonalListPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Personal" });
  }
  get newButton(): Locator {
    return this.page.getByRole("link", { name: "Nuevo empleado" });
  }
  get searchInput(): Locator {
    return this.page.getByPlaceholder("Nombre o rol…");
  }
  get filterButton(): Locator {
    return this.page.getByRole("button", { name: "Filtrar" });
  }

  /**
   * Open the staff list.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.PERSONAL);
  }

  /**
   * Search by free text and submit the GET filter form.
   * @param {string} query - Search term (name or role).
   * @returns {Promise<void>}
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.filterButton.click();
    await this.page.waitForURL(/[?&]q=/);
  }

  /**
   * The staff member's name cell in the list (table/card text).
   * @param {string} name - Staff member name.
   * @returns {Locator}
   */
  rowByName(name: string): Locator {
    return this.page.getByText(name).first();
  }
}
