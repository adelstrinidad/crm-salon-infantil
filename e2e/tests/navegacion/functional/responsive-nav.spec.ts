import { test, expect } from "../../../fixtures/pom/test-options";
import { NavLabel } from "../../../enums/app/messages";
import { Routes } from "../../../enums/app/routes";

// Mobile navigation: below `lg` the persistent sidebar is hidden and a hamburger
// ("Abrir menú") opens a slide-over drawer that navigates then closes itself.
test.use({ viewport: { width: 390, height: 844 } });

test.describe("Navegación responsive (mobile)", () => {
  test(
    "hamburger opens the nav drawer, navigates, and closes",
    { tag: "@e2e" },
    async ({ page, sidebar }) => {
      await test.step("Given the dashboard on a phone viewport", async () => {
        await page.goto(Routes.EVENTOS);
        await expect(sidebar.hamburger).toBeVisible();
        await expect(sidebar.drawer).toHaveCount(0);
      });

      await test.step("When opening the drawer and tapping Clientes", async () => {
        await sidebar.goTo(NavLabel.CLIENTES);
      });

      await test.step("Then it lands on Clientes and the drawer closes", async () => {
        await page.waitForURL(`**${Routes.CLIENTES}`);
        await expect(sidebar.drawer).toHaveCount(0);
      });
    },
  );
});
