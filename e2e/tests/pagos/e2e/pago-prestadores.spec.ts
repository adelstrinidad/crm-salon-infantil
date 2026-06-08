import { test, expect } from "../../../fixtures/pom/test-options";
import { generateEvento } from "../../../test-data/factories/eventos/evento.factory";
import { generatePrestador } from "../../../test-data/factories/prestadores/prestador.factory";
import { PROVIDER_PAYMENT } from "../../../test-data/static/eventos/financials";
import { Messages } from "../../../enums/app/messages";
import { money } from "../../../helpers/util/money";

// Pago prestadores end-to-end: a provider assigned to an event is owed its
// per-event cost (snapshotted from the catalog). The Pago prestadores row is
// payable immediately (no hours), and paying records an EGRESO movement.
test.describe("Pagos — pago prestadores", () => {
  test(
    "assigned provider is owed its cost; paying records the movement",
    { tag: "@e2e" },
    async ({
      prestadorFormPage,
      eventoFormPage,
      eventoEditPage,
      pagoPrestadoresPage,
      movimientosListPage,
    }) => {
      const provider = generatePrestador({ cost: PROVIDER_PAYMENT.costPesos });
      const evento = generateEvento();

      await test.step("Given a provider with a catalog cost", async () => {
        await prestadorFormPage.openNew();
        await prestadorFormPage.fill(provider);
        await prestadorFormPage.submit();
      });

      await test.step("And a RESERVADO event with the provider assigned", async () => {
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(evento);
        await eventoFormPage.reservar();
        await eventoEditPage.addProvider(provider.name); // cost snapshots from catalog
      });

      await test.step("Then Pago prestadores shows the owed cost", async () => {
        await pagoPrestadoresPage.open();
        await expect(
          pagoPrestadoresPage.rowByText(provider.name).getByText(money(PROVIDER_PAYMENT.owed)),
        ).toBeVisible();
      });

      await test.step("When the provider is paid", async () => {
        await pagoPrestadoresPage.pay(provider.name);
      });

      await test.step("Then the row shows Pagado", async () => {
        await expect(
          pagoPrestadoresPage.rowByText(provider.name).getByText(new RegExp(Messages.PAYMENT_PAID)),
        ).toBeVisible();
      });

      await test.step("And an EGRESO movement is recorded for the payment", async () => {
        await movimientosListPage.open();
        await expect(
          movimientosListPage.rowByDescription(`Pago ${provider.name} — ${evento.name}`),
        ).toBeVisible();
      });
    },
  );
});
