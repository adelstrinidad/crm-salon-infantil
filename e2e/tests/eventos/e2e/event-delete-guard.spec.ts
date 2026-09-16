import { test, expect } from "../../../fixtures/pom/test-options";
import { generateEvento } from "../../../test-data/factories/eventos/evento.factory";
import { PAYMENT_LIFECYCLE } from "../../../test-data/static/eventos/financials";
import { Messages } from "../../../enums/app/messages";

// Delete guard: only a financially "clean" event (no cobros/pagos) is deletable.
// A clean RESERVADO event is removed from the list; an event that has collected
// money keeps the confirm dialog open with the blocking reason and survives.
test.describe("Eventos — guard de eliminación (solo eventos limpios)", () => {
  test(
    "deletes a clean event with no movements",
    { tag: "@e2e" },
    async ({ eventoFormPage, eventosListPage }) => {
      const evento = generateEvento();

      await test.step("Given a freshly reserved event with no cobros", async () => {
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(evento);
        await eventoFormPage.reservar();
      });

      await test.step("When it is deleted from the list", async () => {
        await eventosListPage.goto(evento.name);
        await expect(eventosListPage.eventLink(evento.name)).toBeVisible();
        await eventosListPage.deleteEvent(evento.name);
      });

      await test.step("Then the event is gone from the list", async () => {
        await expect(eventosListPage.eventLink(evento.name)).toHaveCount(0);
      });
    },
  );

  test(
    "refuses to delete an event that has a cobro and shows the reason",
    { tag: "@e2e" },
    async ({ eventoFormPage, eventoEditPage, eventoDetailPage, eventosListPage }) => {
      const evento = generateEvento();
      let id = "";

      await test.step("Given a reserved event with a priced service and a cobro", async () => {
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(evento);
        id = await eventoFormPage.reservar();
        await eventoEditPage.addService(); // seeded priced service → totalPrice
        await eventoDetailPage.open(id);
        await eventoDetailPage.registrarCobro(String(PAYMENT_LIFECYCLE.partial)); // creates a movement
      });

      await test.step("When deletion is attempted from the list", async () => {
        await eventosListPage.goto(evento.name);
        await eventosListPage.deleteEvent(evento.name);
      });

      await test.step("Then the dialog stays open with the blocking reason", async () => {
        await expect(eventosListPage.dialogError).toContainText(
          Messages.DELETE_BLOCKED_MOVEMENTS,
        );
      });

      await test.step("And the event still exists on the list", async () => {
        await eventosListPage.goto(evento.name);
        await expect(eventosListPage.eventLink(evento.name)).toBeVisible();
      });
    },
  );
});
