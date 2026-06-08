import { test, expect } from "../../../fixtures/pom/test-options";
import { generateProveedor } from "../../../test-data/factories/proveedores/proveedor.factory";

test.describe("Proveedores — CRUD", () => {
  test(
    "should create a supplier and show it in the list",
    { tag: "@smoke" },
    async ({ proveedorFormPage, proveedoresListPage }) => {
      const proveedor = generateProveedor();

      await test.step("Given the new-supplier form is open", async () => {
        await proveedorFormPage.openNew();
        await expect(proveedorFormPage.nameInput).toBeVisible();
      });

      await test.step("When the form is filled and submitted", async () => {
        await proveedorFormPage.fill(proveedor);
        await proveedorFormPage.submit();
      });

      await test.step("Then the new supplier is findable in the list", async () => {
        await proveedoresListPage.search(proveedor.name);
        await expect(proveedoresListPage.rowByName(proveedor.name)).toBeVisible();
      });
    },
  );

  test(
    "should reject submission when the name is empty",
    { tag: "@regression" },
    async ({ proveedorFormPage, page }) => {
      await test.step("Given the new-supplier form is open", async () => {
        await proveedorFormPage.openNew();
      });

      await test.step("When submitting with no name", async () => {
        await proveedorFormPage.submitButton.click();
      });

      await test.step("Then it stays on the form (no redirect)", async () => {
        await expect(page).toHaveURL(/\/proveedores\/nuevo$/);
        await expect(proveedorFormPage.nameInput).toBeVisible();
      });
    },
  );
});
