import { test, expect } from "../../../fixtures/pom/test-options";
import { generateEvento } from "../../../test-data/factories/eventos/evento.factory";
import { generatePrestador } from "../../../test-data/factories/prestadores/prestador.factory";

// Manager approval code for reversals — env-driven like the consumos voids.
const MANAGER_CODE = process.env.E2E_MANAGER_CODE ?? "encargado1234";

// Reverse a settled payment ("Anular pago") inline from the event detail. A paid
// prestador line exposes "Anular pago"; reversing it (manager code + reason)
// returns the row to pending and posts a compensating "Reversión de pago"
// movement, leaving the original EGRESO intact.
test.describe("Eventos — anular pago de prestador", () => {
  test(
    "reverses a settled provider payment and returns the line to pending",
    { tag: "@e2e" },
    async ({ prestadorFormPage, eventoFormPage, eventoEditPage, eventoDetailPage }) => {
      const prestador = generatePrestador({ cost: "3000" });
      let id = "";

      await test.step("Given a provider paid inline on a RESERVADO event", async () => {
        await prestadorFormPage.openNew();
        await prestadorFormPage.fill(prestador);
        await prestadorFormPage.submit();
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        id = await eventoFormPage.reservar();
        await eventoEditPage.open(id);
        await eventoEditPage.addProvider(prestador.name);
        await eventoDetailPage.open(id);
        await eventoDetailPage.pagarInline(prestador.name);
        await expect(eventoDetailPage.pagadoBadge(prestador.name)).toBeVisible();
      });

      await test.step("When the payment is reversed with the manager code", async () => {
        await eventoDetailPage.anularPagoInline(prestador.name, MANAGER_CODE);
      });

      await test.step("Then the line is pending again with a fresh Pagar action", async () => {
        // The reversal posts a compensating INGRESO to the account (verified in
        // the integration suite); payment movements carry no eventId, so they
        // never show in the event's movimientos modal — the user-facing outcome
        // here is simply that the line is payable again.
        await expect(eventoDetailPage.pagarButton(prestador.name)).toBeVisible();
        await expect(eventoDetailPage.pagadoBadge(prestador.name)).toHaveCount(0);
      });
    },
  );

  test(
    "rejects a reversal with a wrong manager code",
    { tag: "@e2e" },
    async ({ prestadorFormPage, eventoFormPage, eventoEditPage, eventoDetailPage }) => {
      const prestador = generatePrestador({ cost: "3000" });
      let id = "";

      await test.step("Given a provider paid inline on a RESERVADO event", async () => {
        await prestadorFormPage.openNew();
        await prestadorFormPage.fill(prestador);
        await prestadorFormPage.submit();
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        id = await eventoFormPage.reservar();
        await eventoEditPage.open(id);
        await eventoEditPage.addProvider(prestador.name);
        await eventoDetailPage.open(id);
        await eventoDetailPage.pagarInline(prestador.name);
        await expect(eventoDetailPage.pagadoBadge(prestador.name)).toBeVisible();
      });

      await test.step("When a reversal is attempted with a wrong code", async () => {
        await eventoDetailPage.anularPagoInline(prestador.name, "codigo-incorrecto");
      });

      await test.step("Then it is rejected and the line stays Pagado", async () => {
        await expect(
          eventoDetailPage.rowByText(prestador.name).getByText("Código de encargado incorrecto"),
        ).toBeVisible();
        await expect(eventoDetailPage.pagadoBadge(prestador.name)).toBeVisible();
      });
    },
  );
});
