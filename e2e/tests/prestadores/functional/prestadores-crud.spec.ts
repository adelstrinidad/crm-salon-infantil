import { test, expect } from "../../../fixtures/pom/test-options";
import { generatePrestador } from "../../../test-data/factories/prestadores/prestador.factory";

test.describe("Prestadores — CRUD", () => {
  test(
    "should create a provider and show it in the list",
    { tag: "@smoke" },
    async ({ prestadorFormPage, prestadoresListPage }) => {
      const prestador = generatePrestador();

      await test.step("Given the new-provider form is open", async () => {
        await prestadorFormPage.openNew();
        await expect(prestadorFormPage.nameInput).toBeVisible();
      });

      await test.step("When the form is filled and submitted", async () => {
        await prestadorFormPage.fill(prestador);
        await prestadorFormPage.submit();
      });

      await test.step("Then the new provider is findable in the list", async () => {
        await prestadoresListPage.search(prestador.name);
        await expect(prestadoresListPage.rowByName(prestador.name)).toBeVisible();
      });
    },
  );

  test(
    "should reject submission when the name is empty",
    { tag: "@regression" },
    async ({ prestadorFormPage, page }) => {
      await test.step("Given the new-provider form is open", async () => {
        await prestadorFormPage.openNew();
      });

      await test.step("When submitting with no name", async () => {
        await prestadorFormPage.submitButton.click();
      });

      await test.step("Then it stays on the form (no redirect)", async () => {
        await expect(page).toHaveURL(/\/prestadores\/nuevo$/);
        await expect(prestadorFormPage.nameInput).toBeVisible();
      });
    },
  );
});
