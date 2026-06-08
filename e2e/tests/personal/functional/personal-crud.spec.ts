import { test, expect } from "../../../fixtures/pom/test-options";
import { generateEmpleado } from "../../../test-data/factories/personal/empleado.factory";

test.describe("Personal — CRUD", () => {
  test(
    "should create a staff member and show it in the list",
    { tag: "@smoke" },
    async ({ empleadoFormPage, personalListPage }) => {
      const empleado = generateEmpleado();

      await test.step("Given the new-staff form is open", async () => {
        await empleadoFormPage.openNew();
        await expect(empleadoFormPage.nameInput).toBeVisible();
      });

      await test.step("When the form is filled and submitted", async () => {
        await empleadoFormPage.fill(empleado);
        await empleadoFormPage.submit();
      });

      await test.step("Then the new staff member is findable in the list", async () => {
        await personalListPage.search(empleado.name);
        await expect(personalListPage.rowByName(empleado.name)).toBeVisible();
      });
    },
  );

  test(
    "should reject submission when the name is empty",
    { tag: "@regression" },
    async ({ empleadoFormPage, page }) => {
      await test.step("Given the new-staff form is open", async () => {
        await empleadoFormPage.openNew();
      });

      await test.step("When submitting with no name", async () => {
        await empleadoFormPage.submitButton.click();
      });

      await test.step("Then it stays on the form (no redirect)", async () => {
        await expect(page).toHaveURL(/\/personal\/nuevo$/);
        await expect(empleadoFormPage.nameInput).toBeVisible();
      });
    },
  );
});
