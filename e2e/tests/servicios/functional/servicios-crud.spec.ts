import { test, expect } from "../../../fixtures/pom/test-options";
import { generateServicio } from "../../../test-data/factories/servicios/servicio.factory";

test.describe("Servicios — CRUD", () => {
  test(
    "should create a service and show it in the list",
    { tag: "@smoke" },
    async ({ servicioFormPage, serviciosListPage }) => {
      const servicio = generateServicio();

      await test.step("Given the new-service form is open", async () => {
        await servicioFormPage.openNew();
        await expect(servicioFormPage.nameInput).toBeVisible();
      });

      await test.step("When the form is filled and submitted", async () => {
        await servicioFormPage.fill(servicio);
        await servicioFormPage.submit();
      });

      await test.step("Then the new service is findable in the list", async () => {
        await serviciosListPage.search(servicio.name);
        await expect(serviciosListPage.rowByName(servicio.name)).toBeVisible();
      });
    },
  );

  test(
    "should reject submission when the name is empty",
    { tag: "@regression" },
    async ({ servicioFormPage, page }) => {
      await test.step("Given the new-service form is open", async () => {
        await servicioFormPage.openNew();
      });

      await test.step("When submitting with no name", async () => {
        await servicioFormPage.submitButton.click();
      });

      await test.step("Then it stays on the form (no redirect)", async () => {
        await expect(page).toHaveURL(/\/servicios\/nuevo$/);
        await expect(servicioFormPage.nameInput).toBeVisible();
      });
    },
  );
});
