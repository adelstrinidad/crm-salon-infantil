import { describe, it, expect, beforeEach } from "vitest";
import {
  prisma,
  resetDb,
  makeEvent,
  makeProvider,
  makeService,
  makeStaff,
  makeAccount,
} from "./setup/db";
import {
  getProviderPayments,
  markProviderPaid,
  getServicePrestadorPayments,
  markServicePaid,
  payProvider,
  payService,
  getStaffPayments,
  payStaff,
  settleProviderPayment,
  settleServicePayment,
  settleStaffPayment,
} from "@/lib/pagos/pagosService";

// Build the EGRESO movement payload the pago actions pass to payProvider/payService.
function egresoFor(accountId: string, amount = 50000) {
  return {
    accountId,
    type: "EGRESO" as const,
    amount,
    description: "Pago",
    date: new Date("2026-06-10T15:00:00"),
    toAccountId: undefined,
    eventId: undefined,
  };
}

// Integration tests for staff (prestador) and vendor (proveedor) payment
// tracking — the filters the pagos pages use and the mark-as-paid mutations.

beforeEach(async () => {
  await resetDb();
});

// An event with one provider line assigned.
async function eventWithProvider(startAt = new Date("2026-06-10T15:00:00")) {
  const event = await makeEvent({ startAt });
  const provider = await makeProvider({ cost: 50000 });
  const link = await prisma.eventProvider.create({
    data: { eventId: event.id, providerId: provider.id, cost: provider.cost },
  });
  return { event, provider, link };
}

// An event with one staff assignment (real hours logged so it's payable).
async function eventWithStaff(
  startAt = new Date("2026-06-10T15:00:00"),
  opts: { actualMinutes?: number | null } = {},
) {
  const event = await makeEvent({ startAt });
  const staff = await makeStaff({ hourlyRate: 250000 }); // $2.500/h
  const link = await prisma.eventStaff.create({
    data: {
      eventId: event.id,
      staffId: staff.id,
      estMinutes: 300,
      actualMinutes: opts.actualMinutes === undefined ? 300 : opts.actualMinutes,
    },
  });
  return { event, staff, link };
}

// An event with one service line whose service is backed by a prestador.
async function eventWithPrestadorService(startAt = new Date("2026-06-10T15:00:00")) {
  const event = await makeEvent({ startAt });
  const prestador = await makeProvider();
  const service = await makeService({ cost: 30000, prestadorId: prestador.id });
  const link = await prisma.eventService.create({
    data: { eventId: event.id, serviceId: service.id, qty: 1 },
  });
  return { event, prestador, service, link };
}

describe("getProviderPayments / markProviderPaid", () => {
  it("lists provider lines with event and provider included", async () => {
    const { provider } = await eventWithProvider();
    const rows = await getProviderPayments({});
    expect(rows).toHaveLength(1);
    expect(rows[0].provider.id).toBe(provider.id);
    expect(rows[0].event).toBeTruthy();
    expect(rows[0].paid).toBe(false);
  });

  it("filters by providerId", async () => {
    const a = await eventWithProvider();
    await eventWithProvider();
    const rows = await getProviderPayments({ providerId: a.provider.id });
    expect(rows).toHaveLength(1);
    expect(rows[0].providerId).toBe(a.provider.id);
  });

  it("filters by paid status", async () => {
    const { link } = await eventWithProvider();
    await eventWithProvider();
    await markProviderPaid(link.id);

    const paid = await getProviderPayments({ paid: true });
    const unpaid = await getProviderPayments({ paid: false });
    expect(paid).toHaveLength(1);
    expect(unpaid).toHaveLength(1);
    expect(paid[0].id).toBe(link.id);
  });

  it("filters by event date range", async () => {
    await eventWithProvider(new Date("2026-05-20T10:00:00"));
    await eventWithProvider(new Date("2026-06-15T10:00:00"));
    const rows = await getProviderPayments({
      from: new Date("2026-06-01"),
      to: new Date("2026-06-30"),
    });
    expect(rows).toHaveLength(1);
  });

  it("marks a provider line paid with a timestamp", async () => {
    const { link } = await eventWithProvider();
    const updated = await markProviderPaid(link.id);
    expect(updated.paid).toBe(true);
    expect(updated.paidAt).toBeInstanceOf(Date);
  });
});

describe("getServicePrestadorPayments / markServicePaid", () => {
  it("lists only service lines whose service is backed by a prestador", async () => {
    await eventWithPrestadorService();
    // A service WITHOUT a prestador must NOT appear.
    const event = await makeEvent();
    const noPrestador = await makeService({}); // prestadorId null
    await prisma.eventService.create({ data: { eventId: event.id, serviceId: noPrestador.id, qty: 1 } });

    const rows = await getServicePrestadorPayments({});
    expect(rows).toHaveLength(1);
    expect(rows[0].service.prestador).toBeTruthy();
  });

  it("filters by prestadorId", async () => {
    const a = await eventWithPrestadorService();
    await eventWithPrestadorService();
    const rows = await getServicePrestadorPayments({ prestadorId: a.prestador.id });
    expect(rows).toHaveLength(1);
    expect(rows[0].service.prestadorId).toBe(a.prestador.id);
  });

  it("filters by paid status", async () => {
    const { link } = await eventWithPrestadorService();
    await eventWithPrestadorService();
    await markServicePaid(link.id);

    const paid = await getServicePrestadorPayments({ paid: true });
    expect(paid).toHaveLength(1);
    expect(paid[0].id).toBe(link.id);
  });

  it("marks a service line paid with a timestamp", async () => {
    const { link } = await eventWithPrestadorService();
    const updated = await markServicePaid(link.id);
    expect(updated.paid).toBe(true);
    expect(updated.paidAt).toBeInstanceOf(Date);
  });
});

// Regression for #6: mark-paid and the EGRESO movement must commit together.
// Before the fix the two writes ran as separate awaits, so a failing movement
// left the line marked paid with no cash-outflow recorded.
describe("payProvider — atomic settlement", () => {
  it("marks paid AND records the EGRESO movement together", async () => {
    const { link } = await eventWithProvider();
    const account = await makeAccount();

    await payProvider(link.id, egresoFor(account.id));

    const row = await prisma.eventProvider.findUniqueOrThrow({ where: { id: link.id } });
    expect(row.paid).toBe(true);
    expect(row.paidAt).toBeInstanceOf(Date);
    const movements = await prisma.movement.findMany({ where: { accountId: account.id } });
    expect(movements).toHaveLength(1);
    expect(movements[0].type).toBe("EGRESO");
  });

  it("rolls back the paid flag when the movement creation fails", async () => {
    const { link } = await eventWithProvider();
    // No account with this id → movement.create violates the accountId FK and
    // the whole transaction must roll back, leaving the line unpaid.
    await expect(payProvider(link.id, egresoFor("nonexistent-account-id"))).rejects.toThrow();

    const row = await prisma.eventProvider.findUniqueOrThrow({ where: { id: link.id } });
    expect(row.paid).toBe(false);
    expect(row.paidAt).toBeNull();
    const movements = await prisma.movement.findMany();
    expect(movements).toHaveLength(0);
  });
});

describe("getStaffPayments", () => {
  it("lists staff assignments with event and staff included", async () => {
    const { staff } = await eventWithStaff();
    const rows = await getStaffPayments({});
    expect(rows).toHaveLength(1);
    expect(rows[0].staff.id).toBe(staff.id);
    expect(rows[0].event).toBeTruthy();
    expect(rows[0].paid).toBe(false);
  });

  it("filters by staffId, paid status, and event date range", async () => {
    const a = await eventWithStaff();
    await eventWithStaff(new Date("2026-05-20T10:00:00"));
    expect(await getStaffPayments({ staffId: a.staff.id })).toHaveLength(1);
    await markStaffPaidViaPay(a.link.id);
    expect(await getStaffPayments({ paid: true })).toHaveLength(1);
    expect(await getStaffPayments({ paid: false })).toHaveLength(1);
    const inRange = await getStaffPayments({
      from: new Date("2026-06-01"),
      to: new Date("2026-06-30"),
    });
    expect(inRange).toHaveLength(1);
  });
});

// Helper: pay a staff line through the atomic settlement (needs an account).
async function markStaffPaidViaPay(eventStaffId: string) {
  const account = await makeAccount();
  return payStaff(eventStaffId, egresoFor(account.id, 1250000));
}

describe("payStaff — atomic settlement", () => {
  it("marks paid AND records the EGRESO movement together", async () => {
    const { link } = await eventWithStaff();
    const account = await makeAccount();

    await payStaff(link.id, egresoFor(account.id, 1250000)); // $2.500 × 5h

    const row = await prisma.eventStaff.findUniqueOrThrow({ where: { id: link.id } });
    expect(row.paid).toBe(true);
    expect(row.paidAt).toBeInstanceOf(Date);
    const movements = await prisma.movement.findMany({ where: { accountId: account.id } });
    expect(movements).toHaveLength(1);
    expect(movements[0].type).toBe("EGRESO");
    expect(movements[0].amount).toBe(1250000);
  });

  it("rolls back the paid flag when the movement creation fails", async () => {
    const { link } = await eventWithStaff();
    await expect(payStaff(link.id, egresoFor("nonexistent-account-id"))).rejects.toThrow();

    const row = await prisma.eventStaff.findUniqueOrThrow({ where: { id: link.id } });
    expect(row.paid).toBe(false);
    expect(row.paidAt).toBeNull();
    expect(await prisma.movement.findMany()).toHaveLength(0);
  });
});

describe("payService — atomic settlement", () => {
  it("marks paid AND records the EGRESO movement together", async () => {
    const { link } = await eventWithPrestadorService();
    const account = await makeAccount();

    await payService(link.id, egresoFor(account.id, 30000));

    const row = await prisma.eventService.findUniqueOrThrow({ where: { id: link.id } });
    expect(row.paid).toBe(true);
    expect(row.paidAt).toBeInstanceOf(Date);
    const movements = await prisma.movement.findMany({ where: { accountId: account.id } });
    expect(movements).toHaveLength(1);
    expect(movements[0].type).toBe("EGRESO");
  });

  it("rolls back the paid flag when the movement creation fails", async () => {
    const { link } = await eventWithPrestadorService();
    await expect(payService(link.id, egresoFor("nonexistent-account-id"))).rejects.toThrow();

    const row = await prisma.eventService.findUniqueOrThrow({ where: { id: link.id } });
    expect(row.paid).toBe(false);
    expect(row.paidAt).toBeNull();
    const movements = await prisma.movement.findMany();
    expect(movements).toHaveLength(0);
  });
});

// The settle* functions are the trust boundary the pago actions call: they
// compute the amount from the line itself (never from the client) and refuse
// to settle missing or already-paid lines (a double payment would post a
// second EGRESO movement).
describe("settleProviderPayment", () => {
  it("settles with the line's own snapshotted cost and description", async () => {
    const { link, provider, event } = await eventWithProvider();
    const account = await makeAccount();

    const result = await settleProviderPayment(link.id, account.id);

    expect(result).toEqual({ ok: true, eventId: event.id });
    const row = await prisma.eventProvider.findUniqueOrThrow({ where: { id: link.id } });
    expect(row.paid).toBe(true);
    const movements = await prisma.movement.findMany({ where: { accountId: account.id } });
    expect(movements).toHaveLength(1);
    expect(movements[0].amount).toBe(50000); // EventProvider.cost, not client input
    expect(movements[0].description).toBe(`Pago ${provider.name} — ${event.name}`);
  });

  it("rejects an unknown line", async () => {
    const account = await makeAccount();
    const result = await settleProviderPayment("nope", account.id);
    expect(result).toEqual({ ok: false, error: "Asignación no encontrada" });
    expect(await prisma.movement.findMany()).toHaveLength(0);
  });

  it("rejects an already-paid line (no second EGRESO)", async () => {
    const { link } = await eventWithProvider();
    const account = await makeAccount();
    await settleProviderPayment(link.id, account.id);

    const again = await settleProviderPayment(link.id, account.id);
    expect(again).toEqual({ ok: false, error: "Ya está pagado" });
    expect(await prisma.movement.findMany()).toHaveLength(1);
  });

  it("rejects a zero-cost line", async () => {
    const event = await makeEvent();
    const provider = await makeProvider({ cost: 0 });
    const link = await prisma.eventProvider.create({
      data: { eventId: event.id, providerId: provider.id, cost: 0 },
    });
    const account = await makeAccount();
    const result = await settleProviderPayment(link.id, account.id);
    expect(result).toEqual({ ok: false, error: "El monto a pagar es cero" });
    expect(await prisma.movement.findMany()).toHaveLength(0);
  });
});

describe("settleServicePayment", () => {
  it("settles with amount = service.cost × qty computed server-side", async () => {
    const event = await makeEvent();
    const prestador = await makeProvider();
    const service = await makeService({ cost: 30000, prestadorId: prestador.id });
    const link = await prisma.eventService.create({
      data: { eventId: event.id, serviceId: service.id, qty: 3 },
    });
    const account = await makeAccount();

    const result = await settleServicePayment(link.id, account.id);

    expect(result).toEqual({ ok: true, eventId: event.id });
    const movements = await prisma.movement.findMany({ where: { accountId: account.id } });
    expect(movements).toHaveLength(1);
    expect(movements[0].amount).toBe(90000); // 30000 × 3
    expect(movements[0].description).toBe(
      `Pago ${prestador.name} — ${service.name} — ${event.name}`,
    );
  });

  it("rejects unknown, already-paid, and prestador-less lines", async () => {
    const account = await makeAccount();
    expect(await settleServicePayment("nope", account.id)).toEqual({
      ok: false,
      error: "Asignación no encontrada",
    });

    const { link } = await eventWithPrestadorService();
    await settleServicePayment(link.id, account.id);
    expect(await settleServicePayment(link.id, account.id)).toEqual({
      ok: false,
      error: "Ya está pagado",
    });

    const event = await makeEvent();
    const noPrestador = await makeService({ cost: 10000 }); // prestadorId null
    const orphan = await prisma.eventService.create({
      data: { eventId: event.id, serviceId: noPrestador.id, qty: 1 },
    });
    expect(await settleServicePayment(orphan.id, account.id)).toEqual({
      ok: false,
      error: "El servicio no tiene prestador asignado",
    });

    expect(await prisma.movement.findMany()).toHaveLength(1); // only the first settle
  });
});

describe("settleStaffPayment", () => {
  it("settles with amount computed from real hours (hourlyRate × actualMinutes)", async () => {
    const { link, staff, event } = await eventWithStaff(); // $2.500/h × 5h
    const account = await makeAccount();

    const result = await settleStaffPayment(link.id, account.id);

    expect(result).toEqual({ ok: true, eventId: event.id });
    const movements = await prisma.movement.findMany({ where: { accountId: account.id } });
    expect(movements).toHaveLength(1);
    expect(movements[0].amount).toBe(1250000);
    expect(movements[0].description).toBe(`Pago personal — ${staff.name} (${event.name})`);
  });

  it("refuses to pay before the real hours are registered", async () => {
    const { link } = await eventWithStaff(undefined, { actualMinutes: null });
    const account = await makeAccount();
    const result = await settleStaffPayment(link.id, account.id);
    expect(result).toEqual({
      ok: false,
      error: "Registrá las horas reales antes de pagar",
    });
    expect(await prisma.movement.findMany()).toHaveLength(0);
  });

  it("rejects unknown and already-paid lines", async () => {
    const account = await makeAccount();
    expect(await settleStaffPayment("nope", account.id)).toEqual({
      ok: false,
      error: "Asignación no encontrada",
    });

    const { link } = await eventWithStaff();
    await settleStaffPayment(link.id, account.id);
    expect(await settleStaffPayment(link.id, account.id)).toEqual({
      ok: false,
      error: "Ya está pagado",
    });
    expect(await prisma.movement.findMany()).toHaveLength(1);
  });
});
