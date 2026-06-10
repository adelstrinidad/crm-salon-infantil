import { test, expect } from "../../../fixtures/pom/test-options";
import { generateInsumo } from "../../../test-data/factories/insumos/insumo.factory";

test.describe("Insumos — CRUD", () => {
  test(
    "should create a supply and show it in the list",
    { tag: "@smoke" },
    async ({ insumoFormPage, insumosListPage }) => {
      const insumo = generateInsumo();

      await test.step("Given the new-supply form is open", async () => {
        await insumoFormPage.openNew();
        await expect(insumoFormPage.nameInput).toBeVisible();
      });

      await test.step("When the form is filled and submitted", async () => {
        await insumoFormPage.fill(insumo);
        await insumoFormPage.submit();
      });

      await test.step("Then the new supply is findable in the list", async () => {
        await insumosListPage.search(insumo.name);
        await expect(insumosListPage.rowByName(insumo.name)).toBeVisible();
      });
    },
  );

  test(
    "should reject submission when the name is empty",
    { tag: "@regression" },
    async ({ insumoFormPage, page }) => {
      await test.step("Given the new-supply form is open", async () => {
        await insumoFormPage.openNew();
      });

      await test.step("When submitting with no name", async () => {
        await insumoFormPage.submitButton.click();
      });

      await test.step("Then it stays on the form (no redirect)", async () => {
        await expect(page).toHaveURL(/\/insumos\/nuevo$/);
        await expect(insumoFormPage.nameInput).toBeVisible();
      });
    },
  );
});
