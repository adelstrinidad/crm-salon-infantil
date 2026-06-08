import { test, expect } from "../../../fixtures/pom/test-options";
import { generateClient } from "../../../test-data/factories/clientes/client.factory";

test.describe("Clientes — CRUD", () => {
  test(
    "should create a client and show it in the list",
    { tag: "@smoke" },
    async ({ clienteFormPage, clientesListPage }) => {
      const client = generateClient();

      await test.step("Given the new-client form is open", async () => {
        await clienteFormPage.openNew();
        await expect(clienteFormPage.nameInput).toBeVisible();
      });

      await test.step("When the form is filled and submitted", async () => {
        await clienteFormPage.fill(client);
        await clienteFormPage.submit();
      });

      await test.step("Then the new client is findable in the list", async () => {
        await clientesListPage.search(client.name);
        await expect(clientesListPage.rowByName(client.name)).toBeVisible();
      });
    },
  );

  test(
    "should reject submission when the name is empty",
    { tag: "@regression" },
    async ({ clienteFormPage, page }) => {
      await test.step("Given the new-client form is open", async () => {
        await clienteFormPage.openNew();
      });

      await test.step("When submitting with no name", async () => {
        await clienteFormPage.submitButton.click();
      });

      await test.step("Then it stays on the form (no redirect)", async () => {
        await expect(page).toHaveURL(/\/clientes\/nuevo$/);
        await expect(clienteFormPage.nameInput).toBeVisible();
      });
    },
  );
});
