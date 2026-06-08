import { Locator, Page } from "@playwright/test";

/**
 * Dashboard navigation. Desktop shows a persistent sidebar; below `lg` a
 * hamburger ("Abrir menú") opens a slide-over drawer ("Menú de navegación")
 * that closes itself after navigating. `goTo` works at any viewport.
 */
export class SidebarComponent {
  constructor(private readonly page: Page) {}

  get hamburger(): Locator {
    return this.page.getByRole("button", { name: "Abrir menú" });
  }

  get drawer(): Locator {
    return this.page.getByRole("dialog", { name: "Menú de navegación" });
  }

  /**
   * Navigate via the nav, opening the mobile drawer first if it is present.
   * @param {string} label - Visible nav link label (see NavLabel enum).
   * @returns {Promise<void>}
   */
  async goTo(label: string): Promise<void> {
    if (await this.hamburger.isVisible()) {
      await this.hamburger.click();
      await this.drawer.getByRole("link", { name: label }).click();
    } else {
      await this.page.getByRole("link", { name: label }).first().click();
    }
  }
}
