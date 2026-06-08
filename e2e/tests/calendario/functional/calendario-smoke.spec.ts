import { test, expect } from "../../../fixtures/pom/test-options";

test.describe("Calendario — smoke", () => {
  test(
    "should render the calendar and switch to the Lista view",
    { tag: "@smoke" },
    async ({ calendarioPage, page }) => {
      await test.step("Given the calendar page is open", async () => {
        await calendarioPage.open();
        await expect(calendarioPage.heading).toBeVisible();
        await expect(calendarioPage.container).toBeVisible();
      });

      await test.step("When switching to the Lista (agenda) view", async () => {
        await calendarioPage.switchView("Lista");
      });

      await test.step("Then the agenda view renders its column headers", async () => {
        await expect(page.getByText("Fecha").first()).toBeVisible();
        await expect(page.getByText("Evento").first()).toBeVisible();
      });
    },
  );
});
