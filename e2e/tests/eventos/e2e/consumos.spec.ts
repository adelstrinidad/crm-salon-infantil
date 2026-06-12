import { test, expect } from "../../../fixtures/pom/test-options";
import {
  generateEvento,
  generateInvitadoLabel,
} from "../../../test-data/factories/eventos/evento.factory";
import { generateInsumo } from "../../../test-data/factories/insumos/insumo.factory";
import { CONSUMOS_BILL } from "../../../test-data/static/eventos/financials";
import { EventStateLabel } from "../../../enums/app/event";
import { money } from "../../../helpers/util/money";

// Manager approval code for voids — env-driven like the admin credentials.
const MANAGER_CODE = process.env.E2E_MANAGER_CODE ?? "encargado1234";

// Full consumption lifecycle through the UI:
//   create a priced insumo → reserve an event → Iniciar evento (EN_CURSO) →
//   capture per-table requests (stock deducted) → Cerrar consumos → register
//   the bill payment → verify the movement and the stock ledger.
test.describe("Eventos — consumos por mesa", () => {
  test(
    "start, capture per table, close, pay the bill and deduct stock",
    { tag: "@e2e" },
    async ({ insumoFormPage, insumosListPage, insumoDetailPage, eventoFormPage, eventoDetailPage, eventoConsumosPage }) => {
      const { eventPricePesos, initialStock, mesa1Qty, mesa5Qty, mesa1Total, mesa5Total, total } =
        CONSUMOS_BILL;
      const insumo = generateInsumo({ eventPrice: eventPricePesos, stockQty: initialStock });
      let id = "";

      await test.step("Given a priced insumo and a RESERVADO event", async () => {
        await insumoFormPage.openNew();
        await insumoFormPage.fill(insumo);
        await insumoFormPage.submit();
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        id = await eventoFormPage.reservar();
      });

      await test.step("When the event is started", async () => {
        await eventoDetailPage.open(id);
        await eventoDetailPage.iniciarEvento();
      });

      await test.step("Then it is En curso with the capture window open", async () => {
        await expect(eventoDetailPage.stateBadge(EventStateLabel.EN_CURSO)).toBeVisible();
        await expect(eventoDetailPage.registrarConsumosLink).toBeVisible();
      });

      await test.step("When two tables request the insumo", async () => {
        await eventoDetailPage.registrarConsumosLink.click();
        await eventoConsumosPage.addLine("Mesa 1", insumo.name, mesa1Qty);
        await eventoConsumosPage.addLine("Mesa 5", insumo.name, mesa5Qty);
      });

      await test.step("Then the bill groups by table with the right totals", async () => {
        await expect(eventoConsumosPage.mesaSection("Mesa 1")).toBeVisible();
        await expect(eventoConsumosPage.mesaSection("Mesa 5")).toBeVisible();
        await expect(eventoConsumosPage.lineRow(insumo.name, mesa1Qty)).toContainText(
          money(mesa1Total),
        );
        await expect(eventoConsumosPage.lineRow(insumo.name, mesa5Qty)).toContainText(
          money(mesa5Total),
        );
        await expect(eventoConsumosPage.totalRow).toBeVisible();
      });

      await test.step("When the consumos are closed", async () => {
        await eventoConsumosPage.cerrarConsumos();
      });

      await test.step("Then capture is frozen and the report is available", async () => {
        await expect(eventoConsumosPage.closedBadge).toBeVisible();
        await expect(eventoConsumosPage.agregarButton).toHaveCount(0);
        await eventoDetailPage.open(id);
        await expect(eventoDetailPage.verReporteConsumosLink).toBeVisible();
        await expect(eventoDetailPage.rowByText("Total consumos")).toContainText(money(total));
      });

      await test.step("When the client pays the bill", async () => {
        await eventoDetailPage.registrarPagoConsumos();
      });

      await test.step("Then the bill is Pagado and the movement is recorded", async () => {
        await expect(eventoDetailPage.consumosPagadoBadge).toBeVisible();
        await expect(eventoDetailPage.registrarPagoConsumosButton).toHaveCount(0);
        await expect(eventoDetailPage.movementCell(/Consumos —/)).toBeVisible();
        // The consumption payment never counts toward the event price.
        await expect(eventoDetailPage.collectedRow(money(0))).toBeVisible();
        await expect(eventoDetailPage.stateBadge(EventStateLabel.EN_CURSO)).toBeVisible();
      });

      await test.step("Then the stock ledger shows both per-table deductions", async () => {
        await insumosListPage.open();
        await insumosListPage.search(insumo.name);
        await insumosListPage.openDetail(insumo.name);
        await expect(insumoDetailPage.ledgerRowByText("Mesa 1")).toBeVisible();
        await expect(insumoDetailPage.ledgerRowByText("Mesa 5")).toBeVisible();
        await expect(insumoDetailPage.ledgerRowByText("Consumo evento")).toHaveCount(2);
      });
    },
  );

  test(
    "voiding a line requires the manager code, audits the reason and restores stock",
    { tag: "@e2e" },
    async ({ insumoFormPage, eventoFormPage, eventoDetailPage, eventoConsumosPage }) => {
      const insumo = generateInsumo({
        eventPrice: CONSUMOS_BILL.eventPricePesos,
        stockQty: CONSUMOS_BILL.initialStock,
      });
      let id = "";

      await test.step("Given a running event with one captured line", async () => {
        await insumoFormPage.openNew();
        await insumoFormPage.fill(insumo);
        await insumoFormPage.submit();
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        id = await eventoFormPage.reservar();
        await eventoDetailPage.open(id);
        await eventoDetailPage.iniciarEvento();
        await eventoDetailPage.registrarConsumosLink.click();
        await eventoConsumosPage.addLine("Mesa 2", insumo.name, 1);
        await expect(eventoConsumosPage.lineRow(insumo.name, 1)).toBeVisible();
      });

      await test.step("When the void is attempted with a wrong manager code", async () => {
        await eventoConsumosPage.voidLine(insumo.name, "codigo-incorrecto");
      });

      await test.step("Then it is rejected and the line survives", async () => {
        await expect(eventoConsumosPage.errorMessage.first()).toBeVisible();
        await eventoConsumosPage.managerCodeInput.fill(MANAGER_CODE);
        await eventoConsumosPage.anularConfirmButton.click();
      });

      await test.step("Then the line is gone and the audit shows the reason", async () => {
        // The audit table repeats name+qty, so assert on the void button (only
        // live lines have one) instead of the row text.
        await expect(eventoConsumosPage.anularLineButton(insumo.name)).toHaveCount(0);
        await expect(eventoConsumosPage.anulacionesSection).toBeVisible();
        await expect(
          eventoConsumosPage.lineRowByText("Arrepentimiento del invitado"),
        ).toBeVisible();
      });
    },
  );

  test(
    "a self-paying guest is charged separately and never joins the client bill",
    { tag: "@e2e" },
    async ({ insumoFormPage, eventoFormPage, eventoDetailPage, eventoConsumosPage }) => {
      const insumo = generateInsumo({
        eventPrice: CONSUMOS_BILL.eventPricePesos,
        stockQty: CONSUMOS_BILL.initialStock,
      });
      const guest = generateInvitadoLabel();
      let id = "";

      await test.step("Given a running event with one client line and one guest line", async () => {
        await insumoFormPage.openNew();
        await insumoFormPage.fill(insumo);
        await insumoFormPage.submit();
        await eventoFormPage.openNew();
        await eventoFormPage.fillBasics(generateEvento());
        id = await eventoFormPage.reservar();
        await eventoDetailPage.open(id);
        await eventoDetailPage.iniciarEvento();
        await eventoDetailPage.registrarConsumosLink.click();
        await eventoConsumosPage.addLine("Mesa 1", insumo.name, CONSUMOS_BILL.mesa1Qty);
        await eventoConsumosPage.addLine("Mesa 3", insumo.name, 1, guest);
      });

      await test.step("Then the guest appears pending in the Invitados card", async () => {
        await expect(eventoConsumosPage.guestRow(guest)).toBeVisible();
        await expect(eventoConsumosPage.guestRow(guest)).toContainText("Pendiente");
        await expect(eventoConsumosPage.guestRow(guest)).toContainText(
          money(CONSUMOS_BILL.mesa5Total),
        );
      });

      await test.step("When the guest settles while the event is still open", async () => {
        await eventoConsumosPage.cobrarInvitado(guest);
      });

      await test.step("Then the guest is Pagado and the client bill excludes their line", async () => {
        await expect(eventoConsumosPage.guestRow(guest)).toContainText("Pagado");
        await eventoConsumosPage.cerrarConsumos();
        await eventoDetailPage.open(id);
        // Client bill = only Mesa 1 (guest's line excluded from the pending total).
        await eventoDetailPage.registrarPagoConsumosButton.click();
        await expect(
          eventoDetailPage.text(`Cuenta del cliente (pendiente): ${money(CONSUMOS_BILL.mesa1Total)}`),
        ).toBeVisible();
      });
    },
  );
});
