import { describe, it, expect, beforeEach } from "vitest";
import {
  prisma,
  resetDb,
  makeAccount,
  makeService,
  makeProvider,
  makeEvent,
  makeMovement,
} from "./setup/db";
import {
  getEventGroupedByType,
  getBalanceSummaryCards,
  getMovementSummary,
  getMovementsWithoutEvent,
} from "@/lib/reports/reportsService";

// Integration tests for the reports service — the heaviest calculation layer:
// it loads events with their service/provider/bonificado lines, runs
// computeEventFinancials over each, and rolls the totals up by event type and
// into the balance summary cards. Money in cents.

const RANGE_FROM = new Date("2026-06-01T00:00:00");
const RANGE_TO = new Date("2026-06-30T23:59:59");

beforeEach(async () => {
  await resetDb();
});

// Build an event with one service line (qty), used across several cases.
async function eventWithService(opts: {
  eventType: string;
  qty: number;
  cost: number;
  price: number;
  startAt?: Date;
}) {
  const event = await makeEvent({
    eventType: opts.eventType,
    startAt: opts.startAt ?? new Date("2026-06-10T15:00:00"),
  });
  const service = await makeService({ cost: opts.cost, price: opts.price });
  await prisma.eventService.create({
    data: { eventId: event.id, serviceId: service.id, qty: opts.qty },
  });
  return event;
}

describe("getEventGroupedByType", () => {
  it("returns an empty array when there are no events", async () => {
    expect(await getEventGroupedByType({ from: RANGE_FROM, to: RANGE_TO })).toEqual([]);
  });

  it("sums financials per event type", async () => {
    // Two Cumpleaños events, one Casamiento.
    await eventWithService({ eventType: "Cumpleaños", qty: 2, cost: 100, price: 300 });
    await eventWithService({ eventType: "Cumpleaños", qty: 1, cost: 50, price: 200 });
    await eventWithService({ eventType: "Casamiento", qty: 1, cost: 1000, price: 5000 });

    const rows = await getEventGroupedByType({ from: RANGE_FROM, to: RANGE_TO });
    const byType = Object.fromEntries(rows.map((r) => [r.eventType, r]));

    // Cumpleaños: prices 600+200=800, costs 200+50=250, profit 550, 2 events
    expect(byType["Cumpleaños"].count).toBe(2);
    expect(byType["Cumpleaños"].servicePrice).toBe(800);
    expect(byType["Cumpleaños"].serviceCost).toBe(250);
    expect(byType["Cumpleaños"].subtotal).toBe(800);
    expect(byType["Cumpleaños"].profit).toBe(550);

    // Casamiento: price 5000, cost 1000, profit 4000, 1 event
    expect(byType["Casamiento"].count).toBe(1);
    expect(byType["Casamiento"].profit).toBe(4000);
  });

  it("includes provider cost and subtracts bonificados", async () => {
    const event = await makeEvent({ eventType: "Cumpleaños" });
    const service = await makeService({ cost: 200, price: 1000 });
    const bonifService = await makeService({ price: 150 });
    const provider = await makeProvider({ cost: 400 });
    await prisma.eventService.create({ data: { eventId: event.id, serviceId: service.id, qty: 1 } });
    // Per-event provider cost is explicit; snapshot the catalog cost (400).
    await prisma.eventProvider.create({ data: { eventId: event.id, providerId: provider.id, cost: provider.cost } });
    await prisma.eventBonificado.create({
      data: { eventId: event.id, serviceId: bonifService.id, qty: 2 },
    });

    const [row] = await getEventGroupedByType({ from: RANGE_FROM, to: RANGE_TO });
    expect(row.servicePrice).toBe(1000);
    expect(row.providerCost).toBe(400);
    expect(row.totalBonificado).toBe(300); // 150 * 2
    expect(row.subtotal).toBe(700); // 1000 - 300
    expect(row.totalCost).toBe(600); // 200 + 400
    expect(row.profit).toBe(100); // 700 - 600
  });

  it("respects the date range and state filter", async () => {
    await eventWithService({ eventType: "Cumpleaños", qty: 1, cost: 10, price: 100, startAt: new Date("2026-05-01T10:00:00") });
    await eventWithService({ eventType: "Cumpleaños", qty: 1, cost: 10, price: 100, startAt: new Date("2026-06-10T10:00:00") });

    const rows = await getEventGroupedByType({ from: RANGE_FROM, to: RANGE_TO });
    expect(rows).toHaveLength(1);
    expect(rows[0].count).toBe(1);
  });
});

describe("getBalanceSummaryCards", () => {
  it("combines event subtotals/costs with non-event movements", async () => {
    // Event: price 1000, cost 200 → subtotal 1000, totalCost 200
    await eventWithService({ eventType: "Cumpleaños", qty: 1, cost: 200, price: 1000 });

    const acc = await makeAccount();
    await makeMovement(acc.id, { type: "EGRESO", amount: 300, date: new Date("2026-06-05") });
    await makeMovement(acc.id, { type: "RETIRO", amount: 100, date: new Date("2026-06-05") });
    await makeMovement(acc.id, { type: "INVERSION", amount: 500, date: new Date("2026-06-05") });

    const cards = await getBalanceSummaryCards(RANGE_FROM, RANGE_TO);
    expect(cards.ingresosEventos).toBe(1000);
    expect(cards.egresosEventos).toBe(200);
    expect(cards.otrosEgresos).toBe(400); // EGRESO 300 + RETIRO 100
    expect(cards.inversiones).toBe(500);
    // 1000 - 200 - 400 - 500
    expect(cards.balanceTotal).toBe(-100);
  });
});

describe("getMovementSummary", () => {
  it("splits ingreso/egreso and computes net", async () => {
    const acc = await makeAccount();
    await makeMovement(acc.id, { type: "INGRESO", amount: 9000, date: new Date("2026-06-15T12:00:00") });
    await makeMovement(acc.id, { type: "EGRESO", amount: 4000, date: new Date("2026-06-15T12:00:00") });

    const summary = await getMovementSummary(RANGE_FROM, RANGE_TO);
    expect(summary.totalIngreso).toBe(9000);
    expect(summary.totalEgreso).toBe(4000);
    expect(summary.net).toBe(5000);
  });
});

describe("getMovementsWithoutEvent", () => {
  it("returns only movements not linked to an event", async () => {
    const acc = await makeAccount();
    const event = await makeEvent();
    await makeMovement(acc.id, { type: "INGRESO", amount: 1000, eventId: event.id, date: new Date("2026-06-15T12:00:00") });
    await makeMovement(acc.id, { type: "INGRESO", amount: 2000, date: new Date("2026-06-15T12:00:00") });

    const rows = await getMovementsWithoutEvent(RANGE_FROM, RANGE_TO);
    expect(rows).toHaveLength(1);
    expect(rows[0].amount).toBe(2000);
    expect(rows[0].eventId).toBeNull();
  });
});
