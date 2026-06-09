import { test, expect } from "../../../fixtures/pom/test-options";
import { generateEvento } from "../../../test-data/factories/eventos/evento.factory";
import { generatePrestador } from "../../../test-data/factories/prestadores/prestador.factory";
import { generateServicio } from "../../../test-data/factories/servicios/servicio.factory";
import { SERVICE_PRESTADOR } from "../../../test-data/static/eventos/financials";
import { Messages } from "../../../enums/app/messages";
import { money } from "../../../helpers/util/money";

// A service backed by a prestador, used on an event, surfaces on Pago prestadores
// as a "service" row owed = service.cost × qty. Paying it records the EGRESO
// movement. Proves the unified two-source Pago prestadores (direct + service).
test.describe("Pagos — prestador vía servicio", () => {
  test(
    "service-backed prestador is owed the service cost; paying records the movement",
    { tag: "@e2e" },
    async ({
      prestadorFormPage,
      servicioFormPage,
      eventoFormPage,
      eventoEditPage,
      pagoPrestadoresPage,
      movimientosListPage,
    }) => {
      const prestador = generatePrestador();
      const servicio = generateServicio({ cost: SERVICE_PRESTADOR.serviceCostPesos });
      const evento = generateEvento();

      await test.step("Given a prestador and a service backed by it", async () => {
        await prestadorFormPage.openNew();
        await prestadorFormPage.fill(prestador);
        await prestadorFormPage.submit();
        await servicioFormPage.openNew();
        await servicioFormPage.fill(servicio);
        await servicioFormPage.selectPrestador(`${prestador.name} (${prestador.role})`);
        await servicioFormPage.submit();
      });

      await test.step("And a RESERVADO event using that service", async () => {
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(evento);
        await eventoFormPage.reservar();
        await eventoEditPage.addService(servicio.name);
      });

      await test.step("Then Pago prestadores shows the prestador owed the service cost", async () => {
        await pagoPrestadoresPage.open();
        await expect(
          pagoPrestadoresPage.rowByText(prestador.name).getByText(money(SERVICE_PRESTADOR.owed)),
        ).toBeVisible();
      });

      await test.step("When the prestador is paid", async () => {
        await pagoPrestadoresPage.pay(prestador.name);
        await expect(
          pagoPrestadoresPage.rowByText(prestador.name).getByText(new RegExp(Messages.PAYMENT_PAID)),
        ).toBeVisible();
      });

      await test.step("And an EGRESO movement records prestador — servicio — evento", async () => {
        await movimientosListPage.open();
        await expect(
          movimientosListPage.rowByDescription(`Pago ${prestador.name} — ${servicio.name} — ${evento.name}`),
        ).toBeVisible();
      });
    },
  );
});
