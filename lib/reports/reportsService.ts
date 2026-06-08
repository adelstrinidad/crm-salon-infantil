import { prisma } from "@/lib/prisma";
import { summarizeMovements } from "@/lib/finanzas/balance";
import type { EventState } from "@/lib/events/schema";
import { computeEventFinancials } from "@/lib/events/financials";

type EventFilter = { from: Date; to: Date; state?: EventState };

async function fetchEventsWithLines({ from, to, state }: EventFilter) {
  return prisma.event.findMany({
    where: {
      startAt: { gte: from, lte: to },
      ...(state ? { state } : {}),
    },
    include: {
      services: { include: { service: true } },
      providers: { include: { provider: true } },
      bonificados: { include: { service: true } },
      staff: { include: { staff: true } },
    },
    orderBy: { startAt: "asc" },
  });
}

// Grouped by event type — mirrors Bonete's balance table
export async function getEventGroupedByType(filter: EventFilter) {
  const events = await fetchEventsWithLines(filter);

  const map = new Map<string, {
    count: number;
    servicePrice: number;
    serviceCost: number;
    providerCost: number;
    staffCost: number;
    totalBonificado: number;
    subtotal: number;
    totalCost: number;
    profit: number;
  }>();

  for (const e of events) {
    const f = computeEventFinancials(e);
    const existing = map.get(e.eventType);
    if (existing) {
      existing.count++;
      existing.servicePrice += f.servicePrice;
      existing.serviceCost += f.serviceCost;
      existing.providerCost += f.providerCost;
      existing.staffCost += f.staffCost;
      existing.totalBonificado += f.totalBonificado;
      existing.subtotal += f.subtotal;
      existing.totalCost += f.totalCost;
      existing.profit += f.profit;
    } else {
      map.set(e.eventType, { count: 1, ...f });
    }
  }

  return Array.from(map.entries()).map(([eventType, data]) => ({ eventType, ...data }));
}

// Per-event table
export async function getEventPerformanceReport(filter: EventFilter) {
  const events = await fetchEventsWithLines(filter);
  return events.map((e) => ({ id: e.id, name: e.name, eventType: e.eventType, clientName: e.clientName, startAt: e.startAt, state: e.state, totalPrice: e.totalPrice, ...computeEventFinancials(e) }));
}

// Summary cards
export async function getBalanceSummaryCards(from: Date, to: Date, state?: EventState) {
  const [events, movements] = await Promise.all([
    fetchEventsWithLines({ from, to, state }),
    prisma.movement.findMany({ where: { date: { gte: from, lte: to } }, include: { account: true } }),
  ]);

  const ingresosEventos = events.reduce((s, e) => {
    const f = computeEventFinancials(e);
    return s + f.subtotal;
  }, 0);
  const egresosEventos = events.reduce((s, e) => {
    const f = computeEventFinancials(e);
    return s + f.totalCost;
  }, 0);

  let otrosEgresos = 0;
  let inversiones = 0;
  for (const m of movements) {
    if (m.type === "INVERSION") inversiones += m.amount;
    else if (m.type === "EGRESO" || m.type === "RETIRO") otrosEgresos += m.amount;
  }

  const balanceTotal = ingresosEventos - egresosEventos - otrosEgresos - inversiones;

  return { ingresosEventos, egresosEventos, otrosEgresos, inversiones, balanceTotal };
}

// All movements in range
export async function getMovementSummary(from: Date, to: Date) {
  const movements = await prisma.movement.findMany({
    where: { date: { gte: from, lte: to } },
    include: { account: true },
    orderBy: { date: "desc" },
  });

  return { movements, ...summarizeMovements(movements) };
}

export async function getMovementsWithoutEvent(from: Date, to: Date) {
  return prisma.movement.findMany({
    where: { eventId: null, date: { gte: from, lte: to } },
    include: { account: true },
    orderBy: { date: "desc" },
  });
}
