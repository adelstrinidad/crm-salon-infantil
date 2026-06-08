import { test, expect } from "../../../fixtures/pom/test-options";
import { generateEvento } from "../../../test-data/factories/eventos/evento.factory";
import { generateEmpleado } from "../../../test-data/factories/personal/empleado.factory";
import { STAFF_COST } from "../../../test-data/static/eventos/financials";
import { EventStateLabel } from "../../../enums/app/event";
import { Messages } from "../../../enums/app/messages";
import { money } from "../../../helpers/util/money";

// Internal hourly staff on an event: assign with an estimate → the
// "Falta registro de empleados" flag shows → logging the real hours clears it
// and costs into the event. Amounts come from STAFF_COST fixtures.
test.describe("Eventos — horas de personal", () => {
  test(
    "assign estimate, pending flag, log real hours, flag clears, cost on detail",
    { tag: "@e2e" },
    async ({ empleadoFormPage, personalListPage, eventoFormPage, eventoEditPage, eventoDetailPage }) => {
      const { ratePesos, hours, cost } = STAFF_COST.basic;
      const staff = generateEmpleado({ hourlyRate: ratePesos });
      let id = "";

      await test.step("Given a staff member with an hourly rate", async () => {
        await empleadoFormPage.openNew();
        await empleadoFormPage.fill(staff);
        await empleadoFormPage.submit();
        await personalListPage.search(staff.name);
        await expect(personalListPage.rowByName(staff.name)).toBeVisible();
      });

      await test.step("And a RESERVADO event with the staff assigned (estimate)", async () => {
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        id = await eventoFormPage.reservar();
        await eventoEditPage.assignStaff(staff.name, hours);
      });

      await test.step("Then the pending flag and estimated cost show", async () => {
        await expect(eventoEditPage.staffMissingFlag).toBeVisible();
        await expect(eventoEditPage.text(money(cost))).toBeVisible();
      });

      await test.step("When the real hours are logged", async () => {
        await eventoEditPage.logStaffHours(staff.name, hours);
      });

      await test.step("Then the pending flag clears", async () => {
        await expect(eventoEditPage.staffMissingFlag).toHaveCount(0);
      });

      await test.step("And the detail shows the staff cost line and assignment", async () => {
        await eventoDetailPage.open(id);
        await expect(eventoDetailPage.text(Messages.STAFF_COST)).toBeVisible();
        await expect(eventoDetailPage.text(staff.name)).toBeVisible();
      });
    },
  );

  test(
    "staff editable on a PAGADO event, cost recomputes after logging real hours",
    { tag: "@e2e" },
    async ({ empleadoFormPage, eventoFormPage, eventoEditPage, eventoDetailPage }) => {
      const c = STAFF_COST.recompute;
      const staff = generateEmpleado({ hourlyRate: c.ratePesos });
      let id = "";

      await test.step("Given a staff member with an hourly rate", async () => {
        await empleadoFormPage.openNew();
        await empleadoFormPage.fill(staff);
        await empleadoFormPage.submit();
      });

      await test.step("And a RESERVADO event moved to PAGADO", async () => {
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        id = await eventoFormPage.reservar();
        await eventoEditPage.setEstado(EventStateLabel.PAGADO);
      });

      await test.step("When staff is assigned on the PAGADO event (estimate)", async () => {
        await eventoEditPage.open(id);
        await eventoEditPage.assignStaff(staff.name, c.estimateHours);
        await expect(eventoEditPage.text(money(c.estimateCost))).toBeVisible();
      });

      await test.step("And real hours are logged with minutes", async () => {
        await eventoEditPage.logStaffHours(staff.name, c.realHours, c.realMinutes);
        await expect(eventoEditPage.staffMissingFlag).toHaveCount(0);
      });

      await test.step("Then the detail is still Pagado with the recomputed cost", async () => {
        await eventoDetailPage.open(id);
        await expect(eventoDetailPage.stateBadge(EventStateLabel.PAGADO)).toBeVisible();
        await expect(eventoDetailPage.text(Messages.STAFF_COST)).toBeVisible();
        await expect(eventoDetailPage.text(money(c.realCost))).toBeVisible();
      });
    },
  );

  test(
    "save-hours button disabled until a time is picked; flag clears on save",
    { tag: "@regression" },
    async ({ empleadoFormPage, eventoFormPage, eventoEditPage }) => {
      const staff = generateEmpleado({ hourlyRate: STAFF_COST.gating.ratePesos });

      await test.step("Given a staff member assigned with no estimate (0h)", async () => {
        await empleadoFormPage.openNew();
        await empleadoFormPage.fill(staff);
        await empleadoFormPage.submit();
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        await eventoFormPage.reservar();
        await eventoEditPage.assignStaff(staff.name, "0");
        await expect(eventoEditPage.staffMissingFlag).toBeVisible();
      });

      await test.step("Then the card's Guardar is disabled at 0:00", async () => {
        await expect(eventoEditPage.staffSaveButton(staff.name)).toBeDisabled();
      });

      await test.step("When a time is picked, Guardar enables", async () => {
        await eventoEditPage.draftStaffHours(staff.name, "3");
        await expect(eventoEditPage.staffSaveButton(staff.name)).toBeEnabled();
      });

      await test.step("And saving clears the pending flag", async () => {
        await eventoEditPage.staffSaveButton(staff.name).click();
        await expect(eventoEditPage.staffMissingFlag).toHaveCount(0);
      });
    },
  );
});
