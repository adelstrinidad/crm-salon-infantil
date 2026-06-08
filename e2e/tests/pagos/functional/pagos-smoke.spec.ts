import { test, expect } from "../../../fixtures/pom/test-options";

// Smoke: each payments page loads and renders its heading. The full pay flow
// (Pagar → Confirmar) needs owed entities seeded across domains and is
// hand-built by the orchestrator as a cross-domain e2e — not here.
test.describe("Pagos — smoke", () => {
  test(
    "Pago a prestadores page loads with its heading",
    { tag: "@smoke" },
    async ({ pagoPrestadoresPage }) => {
      await pagoPrestadoresPage.open();
      await expect(pagoPrestadoresPage.heading).toBeVisible();
    },
  );

  test(
    "Pago a personal page loads with its heading",
    { tag: "@smoke" },
    async ({ pagoPersonalPage }) => {
      await pagoPersonalPage.open();
      await expect(pagoPersonalPage.heading).toBeVisible();
    },
  );

  test(
    "Pago a proveedores page loads with its heading",
    { tag: "@smoke" },
    async ({ pagoProveedoresPage }) => {
      await pagoProveedoresPage.open();
      await expect(pagoProveedoresPage.heading).toBeVisible();
    },
  );
});
