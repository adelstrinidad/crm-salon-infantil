import { test, expect } from "../../../fixtures/pom/test-options";
import { generateEvento } from "../../../test-data/factories/eventos/evento.factory";
import { generatePrestador } from "../../../test-data/factories/prestadores/prestador.factory";
import { generateEmpleado } from "../../../test-data/factories/personal/empleado.factory";

// Inline settlement from the event detail page: a pending prestador and a
// pending empleado line each expose a "Pagar" button that settles in place
// (expand → pick the default account → Confirmar) and flips the row to
// "Pagado", without leaving for the dedicated /pagos pages.
test.describe("Eventos — pago inline de prestadores y personal", () => {
  test(
    "settles a pending provider and staff line from the event detail",
    { tag: "@e2e" },
    async ({ prestadorFormPage, empleadoFormPage, eventoFormPage, eventoEditPage, eventoDetailPage }) => {
      const prestador = generatePrestador({ cost: "3000" });
      const empleado = generateEmpleado({ hourlyRate: "2000" });
      let id = "";

      await test.step("Given a provider, an employee and a RESERVADO event", async () => {
        await prestadorFormPage.openNew();
        await prestadorFormPage.fill(prestador);
        await prestadorFormPage.submit();
        await empleadoFormPage.openNew();
        await empleadoFormPage.fill(empleado);
        await empleadoFormPage.submit();
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        id = await eventoFormPage.reservar();
      });

      await test.step("When the provider and employee are assigned to the event", async () => {
        await eventoEditPage.open(id);
        await eventoEditPage.addProvider(prestador.name);
        await eventoEditPage.assignStaff(empleado.name, "2");
        // Staff can only be paid once real hours are logged (settle guard), so
        // log them here before settling from the detail page.
        await eventoEditPage.logStaffHours(empleado.name, "2");
      });

      await test.step("Then both lines start pending with an inline Pagar action", async () => {
        await eventoDetailPage.open(id);
        await expect(eventoDetailPage.pagarButton(prestador.name)).toBeVisible();
        await expect(eventoDetailPage.pagarButton(empleado.name)).toBeVisible();
      });

      await test.step("When the provider line is settled inline", async () => {
        await eventoDetailPage.pagarInline(prestador.name);
      });

      await test.step("Then the provider row shows Pagado", async () => {
        await expect(eventoDetailPage.pagadoBadge(prestador.name)).toBeVisible();
      });

      await test.step("When the staff line is settled inline", async () => {
        await eventoDetailPage.pagarInline(empleado.name);
      });

      await test.step("Then the staff row shows Pagado", async () => {
        await expect(eventoDetailPage.pagadoBadge(empleado.name)).toBeVisible();
      });
    },
  );
});
