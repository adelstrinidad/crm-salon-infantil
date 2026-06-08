import { Locator, Page } from "@playwright/test";
import { Routes } from "../../enums/app/routes";

/** Finanzas page (app/(dashboard)/finanzas/page.tsx) — accounts grid + recent movements. */
export class CuentasListPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: "Finanzas" });
  }
  get newButton(): Locator {
    return this.page.getByRole("link", { name: "+ Cuenta" });
  }

  /**
   * Open the finanzas page.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(Routes.FINANZAS);
  }

  /**
   * Account card showing the given account name. Accounts render as Cards (name
   * in a span); the movements table below can repeat text, so use .first().
   * @param {string} name - Account name.
   * @returns {Locator}
   */
  cardByName(name: string): Locator {
    return this.page.getByText(name).first();
  }
}
