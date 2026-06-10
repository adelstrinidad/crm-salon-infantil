import { test, expect } from "../../../fixtures/pom/test-options";
import { generateInsumo } from "../../../test-data/factories/insumos/insumo.factory";

test.describe("Insumos — stock adjustment ledger", () => {
  test(
    "recording a consumo lowers the count and appends a ledger row",
    { tag: "@e2e" },
    async ({ insumoFormPage, insumosListPage, insumoDetailPage }) => {
      // Fixed starting stock so the consumed amount is always valid.
      const insumo = generateInsumo({ stockQty: 50, minStock: 5 });

      await test.step("Given a supply with known stock", async () => {
        await insumoFormPage.openNew();
        await insumoFormPage.fill(insumo);
        await insumoFormPage.submit();
      });

      await test.step("When a consumo is recorded on its detail page", async () => {
        await insumosListPage.search(insumo.name);
        await insumosListPage.openDetail(insumo.name);
        await expect(insumoDetailPage.stockHeading).toBeVisible();
        await insumoDetailPage.adjust("Consumo (−)", 3, "fiesta de prueba");
      });

      await test.step("Then a Consumo −3 row shows in the ledger", async () => {
        const row = insumoDetailPage.ledgerRowByText("fiesta de prueba");
        await expect(row).toBeVisible();
        await expect(row.getByText("Consumo")).toBeVisible();
        await expect(row.getByText("-3")).toBeVisible();
      });
    },
  );
});
