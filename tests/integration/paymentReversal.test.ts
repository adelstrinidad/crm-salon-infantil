import { describe, it, expect, beforeEach } from "vitest";
import {
  prisma,
  resetDb,
  makeEvent,
  makeProvider,
  makeService,
  makeStaff,
  makeProveedor,
  makeInsumo,
  makeAccount,
} from "./setup/db";
import {
  settleProviderPayment,
  settleServicePayment,
  settleStaffPayment,
  reverseProviderPayment,
  reverseServicePayment,
  reverseStaffPayment,
} from "@/lib/pagos/pagosService";
import {
  createCompra,
  settleCompraPayment,
  reverseCompraPayment,
} from "@/lib/compras/compraService";

// Integration tests for "Anular pago" — the audited payment reversal. The
// contract for every kind: keep the original EGRESO, post a compensating INGRESO
// (kind "reversal", same account/amount), return the line to unpaid with its
// paidMovementId cleared, and append one ReversedPayment audit row. The reversal
// amount is the ORIGINAL movement's amount, never a recompute.

beforeEach(async () => {
  await resetDb();
});

const reason = { reason: "pago-duplicado" as const };

async function eventWithProvider() {
  const event = await makeEvent({ startAt: new Date("2026-06-10T15:00:00") });
  const provider = await makeProvider({ cost: 50000 });
  const link = await prisma.eventProvider.create({
    data: { eventId: event.id, providerId: provider.id, cost: provider.cost },
  });
  return { event, provider, link };
}

async function eventWithStaff() {
  const event = await makeEvent({ startAt: new Date("2026-06-10T15:00:00") });
  const staff = await makeStaff({ hourlyRate: 250000 }); // $2.500/h
  const link = await prisma.eventStaff.create({
    data: { eventId: event.id, staffId: staff.id, estMinutes: 300, actualMinutes: 300 },
  });
  return { event, staff, link };
}

async function eventWithPrestadorService() {
  const event = await makeEvent({ startAt: new Date("2026-06-10T15:00:00") });
  const prestador = await makeProvider();
  const service = await makeService({ cost: 30000, prestadorId: prestador.id });
  const link = await prisma.eventService.create({
    data: { eventId: event.id, serviceId: service.id, qty: 2 },
  });
  return { event, prestador, service, link };
}

async function paidCompra(accountId: string) {
  const prov = await makeProveedor();
  const insumo = await makeInsumo({ stockQty: 0 });
  const compra = await createCompra({
    proveedorId: prov.id,
    date: new Date("2026-06-10T12:00:00"),
    lines: [{ insumoId: insumo.id, qty: 10, unitCost: 800 }],
  });
  await settleCompraPayment(compra.id, accountId);
  return { prov, compra };
}

describe("reverseProviderPayment", () => {
  it("posts a compensating INGRESO, unpays the line and audits the reversal", async () => {
    const { link, provider, event } = await eventWithProvider();
    const account = await makeAccount();
    await settleProviderPayment(link.id, account.id);

    const result = await reverseProviderPayment(link.id, reason);

    expect(result).toEqual({ ok: true, eventId: event.id });

    // Line is pending again, with the movement link cleared.
    const row = await prisma.eventProvider.findUniqueOrThrow({ where: { id: link.id } });
    expect(row.paid).toBe(false);
    expect(row.paidAt).toBeNull();
    expect(row.paidMovementId).toBeNull();

    // Original EGRESO kept + compensating INGRESO posted → account nets to zero.
    const movements = await prisma.movement.findMany({
      where: { accountId: account.id },
      orderBy: { type: "asc" },
    });
    expect(movements).toHaveLength(2);
    const egreso = movements.find((m) => m.type === "EGRESO")!;
    const ingreso = movements.find((m) => m.type === "INGRESO")!;
    expect(egreso.amount).toBe(50000);
    expect(ingreso.amount).toBe(50000);
    expect(ingreso.kind).toBe("reversal");
    expect(ingreso.eventId).toBeNull(); // never counts toward event Cobrado
    expect(ingreso.description).toBe(`Reversión de pago ${provider.name} — ${event.name}`);

    // Exactly one audit row, snapshotting the reversed amount and reason.
    const audit = await prisma.reversedPayment.findMany();
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({
      kind: "provider",
      eventId: event.id,
      entityName: provider.name,
      amount: 50000,
      reason: "pago-duplicado",
      originalMovementId: egreso.id,
      reversalMovementId: ingreso.id,
    });
  });

  it("reverses the EXACT original amount even after the line cost changes", async () => {
    const { link } = await eventWithProvider();
    const account = await makeAccount();
    await settleProviderPayment(link.id, account.id); // paid 50000

    // Someone edits the per-event cost afterwards.
    await prisma.eventProvider.update({ where: { id: link.id }, data: { cost: 999999 } });

    await reverseProviderPayment(link.id, reason);
    const ingreso = await prisma.movement.findFirstOrThrow({ where: { type: "INGRESO" } });
    expect(ingreso.amount).toBe(50000); // the amount paid, not the new cost
  });

  it("rejects a line that is not paid (nothing to reverse)", async () => {
    const { link } = await eventWithProvider();
    const result = await reverseProviderPayment(link.id, reason);
    expect(result).toEqual({ ok: false, error: "El pago no está registrado" });
    expect(await prisma.movement.findMany()).toHaveLength(0);
    expect(await prisma.reversedPayment.findMany()).toHaveLength(0);
  });

  it("rejects reversing the same payment twice", async () => {
    const { link } = await eventWithProvider();
    const account = await makeAccount();
    await settleProviderPayment(link.id, account.id);
    await reverseProviderPayment(link.id, reason);

    const again = await reverseProviderPayment(link.id, reason);
    expect(again).toEqual({ ok: false, error: "El pago no está registrado" });
    expect(await prisma.reversedPayment.findMany()).toHaveLength(1);
  });

  it("rejects an unknown line", async () => {
    expect(await reverseProviderPayment("nope", reason)).toEqual({
      ok: false,
      error: "Asignación no encontrada",
    });
  });

  it("requires free text persisted when reason is 'otro'", async () => {
    const { link } = await eventWithProvider();
    const account = await makeAccount();
    await settleProviderPayment(link.id, account.id);

    await reverseProviderPayment(link.id, { reason: "otro", reasonText: "ajuste manual" });
    const audit = await prisma.reversedPayment.findFirstOrThrow();
    expect(audit.reason).toBe("otro");
    expect(audit.reasonText).toBe("ajuste manual");
  });
});

describe("reverseStaffPayment", () => {
  it("reverses with the original amount and audits kind 'staff'", async () => {
    const { link, staff, event } = await eventWithStaff();
    const account = await makeAccount();
    await settleStaffPayment(link.id, account.id); // 1250000

    const result = await reverseStaffPayment(link.id, reason);

    expect(result).toEqual({ ok: true, eventId: event.id });
    const row = await prisma.eventStaff.findUniqueOrThrow({ where: { id: link.id } });
    expect(row.paid).toBe(false);
    expect(row.paidMovementId).toBeNull();
    const ingreso = await prisma.movement.findFirstOrThrow({ where: { type: "INGRESO" } });
    expect(ingreso.amount).toBe(1250000);
    expect(ingreso.kind).toBe("reversal");
    const audit = await prisma.reversedPayment.findFirstOrThrow();
    expect(audit).toMatchObject({ kind: "staff", entityName: staff.name, amount: 1250000 });
  });
});

describe("reverseServicePayment", () => {
  it("reverses with amount = original service.cost × qty and audits kind 'service'", async () => {
    const { link, prestador, event } = await eventWithPrestadorService();
    const account = await makeAccount();
    await settleServicePayment(link.id, account.id); // 30000 × 2

    const result = await reverseServicePayment(link.id, reason);

    expect(result).toEqual({ ok: true, eventId: event.id });
    const row = await prisma.eventService.findUniqueOrThrow({ where: { id: link.id } });
    expect(row.paid).toBe(false);
    expect(row.paidMovementId).toBeNull();
    const ingreso = await prisma.movement.findFirstOrThrow({ where: { type: "INGRESO" } });
    expect(ingreso.amount).toBe(60000);
    const audit = await prisma.reversedPayment.findFirstOrThrow();
    expect(audit).toMatchObject({ kind: "service", entityName: prestador.name, amount: 60000 });
  });
});

describe("reverseCompraPayment", () => {
  it("reverses a settled purchase and audits kind 'compra' (no event)", async () => {
    const account = await makeAccount();
    const { prov, compra } = await paidCompra(account.id);

    const result = await reverseCompraPayment(compra.id, reason);

    expect(result).toEqual({ ok: true });
    const row = await prisma.compra.findUniqueOrThrow({ where: { id: compra.id } });
    expect(row.paid).toBe(false);
    expect(row.paidAt).toBeNull();
    expect(row.paidMovementId).toBeNull();

    const movements = await prisma.movement.findMany({ where: { accountId: account.id } });
    expect(movements).toHaveLength(2);
    const ingreso = movements.find((m) => m.type === "INGRESO")!;
    expect(ingreso.amount).toBe(8000); // 10 × 800
    expect(ingreso.kind).toBe("reversal");

    const audit = await prisma.reversedPayment.findFirstOrThrow();
    expect(audit).toMatchObject({
      kind: "compra",
      eventId: null,
      entityName: prov.name,
      amount: 8000,
    });
  });

  it("rejects reversing an unpaid purchase", async () => {
    const prov = await makeProveedor();
    const insumo = await makeInsumo({ stockQty: 0 });
    const compra = await createCompra({
      proveedorId: prov.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 1, unitCost: 800 }],
    });
    expect(await reverseCompraPayment(compra.id, reason)).toEqual({
      ok: false,
      error: "El pago no está registrado",
    });
  });
});
