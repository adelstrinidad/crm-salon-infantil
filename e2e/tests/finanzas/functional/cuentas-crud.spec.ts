import { test, expect } from "../../../fixtures/pom/test-options";
import { generateCuenta } from "../../../test-data/factories/finanzas/cuenta.factory";

test.describe("Finanzas Cuentas — CRUD", () => {
  test(
    "should create an account and show it in the finanzas list",
    { tag: "@smoke" },
    async ({ cuentaFormPage, cuentasListPage }) => {
      const cuenta = generateCuenta();

      await test.step("Given the new-account form is open", async () => {
        await cuentaFormPage.openNew();
        await expect(cuentaFormPage.nameInput).toBeVisible();
      });

      await test.step("When the form is filled and submitted", async () => {
        await cuentaFormPage.fill(cuenta);
        await cuentaFormPage.submit();
      });

      await test.step("Then the new account is findable in the list", async () => {
        await expect(cuentasListPage.heading).toBeVisible();
        await expect(cuentasListPage.cardByName(cuenta.name)).toBeVisible();
      });
    },
  );

  test(
    "should reject submission when the name is empty",
    { tag: "@regression" },
    async ({ cuentaFormPage, page }) => {
      await test.step("Given the new-account form is open", async () => {
        await cuentaFormPage.openNew();
      });

      await test.step("When submitting with no name", async () => {
        await cuentaFormPage.submitButton.click();
      });

      await test.step("Then it stays on the form (no redirect)", async () => {
        await expect(page).toHaveURL(/\/finanzas\/cuentas\/nueva$/);
        await expect(cuentaFormPage.nameInput).toBeVisible();
      });
    },
  );
});
