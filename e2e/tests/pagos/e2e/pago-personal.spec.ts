import { test, expect } from "../../../fixtures/pom/test-options";
import { generateEvento } from "../../../test-data/factories/eventos/evento.factory";
import { generateEmpleado } from "../../../test-data/factories/personal/empleado.factory";
import { STAFF_COST } from "../../../test-data/static/eventos/financials";
import { Messages } from "../../../enums/app/messages";
import { money } from "../../../helpers/util/money";

// Pago personal end-to-end: a staff assignment is only payable once its real
// hours are logged. Before that the row prompts "Registrá las horas"; after, the
// row is payable and paying records an EGRESO movement. $2.000/h × 5h = $10.000.
test.describe("Pagos — pago personal", () => {
  test(
    "row payable only after hours logged; paying records the movement",
    { tag: "@e2e" },
    async ({
      empleadoFormPage,
      eventoFormPage,
      eventoEditPage,
      eventoDetailPage,
      pagoPersonalPage,
      movimientosListPage,
    }) => {
      const { ratePesos, hours, owed } = STAFF_COST.payment;
      const staff = generateEmpleado({ hourlyRate: ratePesos });
      let id = "";

      await test.step("Given a staff member assigned to a RESERVADO event (estimate only)", async () => {
        await empleadoFormPage.openNew();
        await empleadoFormPage.fill(staff);
        await empleadoFormPage.submit();
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        id = await eventoFormPage.reservar();
        await eventoEditPage.assignStaff(staff.name, hours);
      });

      await test.step("Then Pago personal prompts for hours and offers no Pagar", async () => {
        await pagoPersonalPage.open();
        await expect(pagoPersonalPage.needsHoursPrompt(staff.name)).toBeVisible();
        await expect(pagoPersonalPage.payButton(staff.name)).toHaveCount(0);
      });

      await test.step("When the real hours are logged on the event", async () => {
        await eventoEditPage.open(id);
        await eventoEditPage.logStaffHours(staff.name, hours);
        await expect(eventoEditPage.staffMissingFlag).toHaveCount(0);
      });

      await test.step("Then the event detail offers an inline payment for the assignment", async () => {
        await eventoDetailPage.open(id);
        // Pending lines now expose an inline "Pagar" button instead of a static
        // "Pendiente" badge (payable here or on the dedicated /pagos page below).
        await expect(eventoDetailPage.pagarButton(staff.name)).toBeVisible();
      });

      await test.step("And paying the owed amount marks it Pagado", async () => {
        await pagoPersonalPage.open();
        await expect(
          pagoPersonalPage.rowByText(staff.name).getByText(money(owed)),
        ).toBeVisible();
        await pagoPersonalPage.pay(staff.name);
        await expect(
          pagoPersonalPage.rowByText(staff.name).getByText(new RegExp(Messages.PAYMENT_PAID)),
        ).toBeVisible();
      });

      await test.step("And an EGRESO movement is recorded for the payment", async () => {
        await movimientosListPage.open();
        await expect(
          movimientosListPage.rowByDescription(`${Messages.STAFF_PAYMENT_LABEL} ${staff.name}`),
        ).toBeVisible();
      });
    },
  );
});
