import { test, expect } from "../../../fixtures/pom/test-options";
import { generateEvento } from "../../../test-data/factories/eventos/evento.factory";
import { generatePrestador } from "../../../test-data/factories/prestadores/prestador.factory";
import { Messages } from "../../../enums/app/messages";

// When a prestador is removed from an event, the assignment is not lost: it is
// audited and shown as "Eliminado" in Pago prestadores (no Pagar button),
// instead of silently disappearing.
test.describe("Pagos — línea eliminada (auditoría)", () => {
  test(
    "removing a provider from an event keeps it as 'Eliminado' in Pago prestadores",
    { tag: "@e2e" },
    async ({ prestadorFormPage, eventoFormPage, eventoEditPage, pagoPrestadoresPage }) => {
      const provider = generatePrestador();

      await test.step("Given a provider assigned to a RESERVADO event", async () => {
        await prestadorFormPage.openNew();
        await prestadorFormPage.fill(provider);
        await prestadorFormPage.submit();
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        await eventoFormPage.reservar();
        await eventoEditPage.addProvider(provider.name);
      });

      await test.step("When the provider is removed from the event", async () => {
        await eventoEditPage.removeProvider(provider.name); // waits for the row to detach
      });

      await test.step("Then Pago prestadores shows it as Eliminado, not payable", async () => {
        await pagoPrestadoresPage.open();
        const row = pagoPrestadoresPage.rowByText(provider.name);
        await expect(row.getByText(new RegExp(Messages.PAYMENT_DELETED))).toBeVisible();
        await expect(row.getByRole("button", { name: "Pagar" })).toHaveCount(0);
      });
    },
  );
});
