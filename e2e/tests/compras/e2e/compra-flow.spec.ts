import { test, expect } from "../../../fixtures/pom/test-options";
import { generateProveedor } from "../../../test-data/factories/proveedores/proveedor.factory";
import { generateInsumo } from "../../../test-data/factories/insumos/insumo.factory";
import { generateCompraLine } from "../../../test-data/factories/compras/compra-line.factory";

test.describe("Compras — purchase + settlement flow", () => {
  test(
    "record a purchase (raises stock, pending) then pay it from Pago a proveedores",
    { tag: "@e2e" },
    async ({
      proveedorFormPage,
      insumoFormPage,
      compraFormPage,
      comprasListPage,
      pagoProveedoresPage,
    }) => {
      const proveedor = generateProveedor();
      const insumo = generateInsumo();

      await test.step("Given a supplier and a supply exist", async () => {
        await proveedorFormPage.openNew();
        await proveedorFormPage.fill(proveedor);
        await proveedorFormPage.submit();

        await insumoFormPage.openNew();
        await insumoFormPage.fill(insumo);
        await insumoFormPage.submit();
      });

      await test.step("When a purchase of that supply is recorded", async () => {
        await compraFormPage.openNew();
        await compraFormPage.selectProveedor(proveedor.name);
        await compraFormPage.fillLine(0, generateCompraLine(insumo.name));
        await compraFormPage.submit();
      });

      await test.step("Then the purchase shows in the list as Pendiente", async () => {
        await comprasListPage.search(proveedor.name);
        const row = comprasListPage.rowByText(proveedor.name);
        await expect(row).toBeVisible();
        await expect(row.getByText("Pendiente")).toBeVisible();
      });

      await test.step("When it is paid from Pago a proveedores", async () => {
        await pagoProveedoresPage.open();
        await pagoProveedoresPage.pay(proveedor.name);
      });

      await test.step("Then the purchase is marked Pagada", async () => {
        const row = pagoProveedoresPage.rowByText(proveedor.name);
        await expect(row.getByText("Pagada")).toBeVisible();
      });
    },
  );
});
