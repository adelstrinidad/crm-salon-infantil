import { test, expect } from "../../../fixtures/pom/test-options";
import { generateEvento } from "../../../test-data/factories/eventos/evento.factory";
import { PAYMENT_LIFECYCLE } from "../../../test-data/static/eventos/financials";
import { EventStateLabel } from "../../../enums/app/event";
import { Messages } from "../../../enums/app/messages";
import { money } from "../../../helpers/util/money";

// Full event money lifecycle through the UI:
//   create RESERVADO → add a priced service (derived total) → partial cobro
//   advances to SENADO → completing cobro advances to PAGADO. The seeded
//   service prices the event deterministically (PAYMENT_LIFECYCLE.servicePrice).
test.describe("Eventos — lifecycle de cobro", () => {
  test(
    "payment advances state RESERVADO → SENADO → PAGADO",
    { tag: "@e2e" },
    async ({ eventoFormPage, eventoEditPage, eventoDetailPage }) => {
      const { servicePrice, partial, remaining } = PAYMENT_LIFECYCLE;
      const collectedAfterPartial = partial;
      const balanceAfterPartial = servicePrice - partial;
      let id = "";

      await test.step("Given a RESERVADO event with a priced service", async () => {
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        id = await eventoFormPage.reservar();
        await eventoEditPage.addService(); // seeded service → servicePrice
      });

      await test.step("Then the detail shows Reservado and full balance", async () => {
        await eventoDetailPage.open(id);
        await expect(eventoDetailPage.stateBadge(EventStateLabel.RESERVADO)).toBeVisible();
        await expect(eventoDetailPage.balanceRow(money(servicePrice))).toBeVisible();
      });

      await test.step("When a partial cobro is recorded", async () => {
        await eventoDetailPage.registrarCobro(String(partial));
      });

      await test.step("Then state is Señado with the remainder outstanding", async () => {
        await expect(eventoDetailPage.stateBadge(EventStateLabel.SENADO)).toBeVisible();
        await expect(eventoDetailPage.collectedRow(money(collectedAfterPartial))).toBeVisible();
        await expect(eventoDetailPage.balanceRow(money(balanceAfterPartial))).toBeVisible();
        await expect(eventoDetailPage.stateBadge(EventStateLabel.PAGADO)).toHaveCount(0);
      });

      await test.step("When the remaining amount is collected", async () => {
        await eventoDetailPage.registrarCobro(String(remaining));
      });

      await test.step("Then state is Pagado with zero balance", async () => {
        await expect(eventoDetailPage.stateBadge(EventStateLabel.PAGADO)).toBeVisible();
        await expect(eventoDetailPage.collectedRow(money(servicePrice))).toBeVisible();
        await expect(eventoDetailPage.balanceRow(money(0))).toBeVisible();
        // The cobro with no manual note gets the default description. The full
        // movement table now lives behind "Ver detalle" (assert last — the modal
        // makes the rest of the page inert).
        await eventoDetailPage.openMovimientosDetalle();
        await expect(
          eventoDetailPage.movementCell(new RegExp(Messages.COBRO_DEFAULT_LABEL)),
        ).toBeVisible();
      });
    },
  );
});
