import { test, expect } from "../../../fixtures/pom/test-options";
import { generateMovimiento } from "../../../test-data/factories/movimientos/movimiento.factory";

test.describe("Movimientos — CRUD", () => {
  test(
    "should create an Ingreso movement and show it in the list",
    { tag: "@smoke" },
    async ({ movimientoFormPage, movimientosListPage }) => {
      const movimiento = generateMovimiento();

      await test.step("Given the new-movement form is open", async () => {
        await movimientoFormPage.openNew();
        await expect(movimientoFormPage.amountInput).toBeVisible();
      });

      await test.step("When an Ingreso is filled and submitted", async () => {
        await movimientoFormPage.fill(movimiento);
        await movimientoFormPage.submit();
      });

      await test.step("Then the movement is findable in the list", async () => {
        await movimientosListPage.open();
        await expect(
          movimientosListPage.rowByDescription(movimiento.description!),
        ).toBeVisible();
      });
    },
  );

  test(
    "should reject submission when the account is empty",
    { tag: "@regression" },
    async ({ movimientoFormPage, page }) => {
      await test.step("Given the new-movement form is open", async () => {
        await movimientoFormPage.openNew();
        await expect(movimientoFormPage.amountInput).toBeVisible();
      });

      await test.step("When submitting without choosing a Cuenta origen", async () => {
        await movimientoFormPage.amountInput.fill("1000");
        await movimientoFormPage.submitButton.click();
      });

      await test.step("Then it stays on the form (no redirect)", async () => {
        await expect(page).toHaveURL(/\/finanzas\/movimientos\/nuevo$/);
        await expect(movimientoFormPage.errorMessage.first()).toBeVisible();
      });
    },
  );
});
