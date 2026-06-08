import { test, expect } from "../../../fixtures/pom/test-options";
import { generateTipoEvento } from "../../../test-data/factories/tipos-evento/tipo-evento.factory";

test.describe("Tipos de evento — CRUD", () => {
  test(
    "should create an event type and show it in the list",
    { tag: "@smoke" },
    async ({ tipoEventoFormPage, tiposEventoListPage }) => {
      const tipoEvento = generateTipoEvento();

      await test.step("Given the new-event-type form is open", async () => {
        await tipoEventoFormPage.openNew();
        await expect(tipoEventoFormPage.nameInput).toBeVisible();
      });

      await test.step("When the form is filled and submitted", async () => {
        await tipoEventoFormPage.fill(tipoEvento);
        await tipoEventoFormPage.submit();
      });

      await test.step("Then the new event type is findable in the list", async () => {
        await tiposEventoListPage.search(tipoEvento.name);
        await expect(tiposEventoListPage.rowByName(tipoEvento.name)).toBeVisible();
      });
    },
  );

  test(
    "should reject submission when the name is empty",
    { tag: "@regression" },
    async ({ tipoEventoFormPage, page }) => {
      await test.step("Given the new-event-type form is open", async () => {
        await tipoEventoFormPage.openNew();
      });

      await test.step("When submitting with no name", async () => {
        await tipoEventoFormPage.submitButton.click();
      });

      await test.step("Then it stays on the form (no redirect)", async () => {
        await expect(page).toHaveURL(/\/tipos-evento\/nuevo$/);
        await expect(tipoEventoFormPage.nameInput).toBeVisible();
      });
    },
  );
});
