// Domain layer: all event DB operations live here.
// Server Actions and Route Handlers call these functions — they never import Prisma directly.
import { prisma } from "@/lib/prisma";
import type { CobroValues, EventFormValues, EventState } from "./schema";
import { parseEventSort } from "./listFilters";
import { computeEventFinancials } from "./financials";
import { resolvePaidState } from "./paymentState";
import type { Prisma } from "@/app/generated/prisma/client";

export async function listEvents() {
  return prisma.event.findMany({
    orderBy: { startAt: "asc" },
  });
}

// Paginated list for the events table. Returns the page rows plus the total
// count so the UI can render page controls without loading every row.
export async function listEventsPage(opts: { skip: number; take: number }) {
  const [rows, total] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startAt: "desc" },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.event.count(),
  ]);
  return { rows, total };
}

// Filtered + sorted + paginated list for the events table. Builds a Prisma
// `where` from optional filters (text search, state, type, date range) and an
// `orderBy` from a validated sort string. Returns the page rows plus the total
// matching count so the pager stays correct.
export async function listEventsFiltered(opts: {
  q?: string;
  state?: string;
  eventType?: string;
  from?: Date;
  to?: Date;
  sort?: string;
  skip: number;
  take: number;
}) {
  const where: Prisma.EventWhereInput = {
    ...(opts.q
      ? {
          OR: [
            { name: { contains: opts.q } },
            { clientName: { contains: opts.q } },
          ],
        }
      : {}),
    ...(opts.state ? { state: opts.state as EventState } : {}),
    ...(opts.eventType ? { eventType: opts.eventType } : {}),
    ...(opts.from || opts.to
      ? {
          startAt: {
            ...(opts.from ? { gte: opts.from } : {}),
            ...(opts.to ? { lte: opts.to } : {}),
          },
        }
      : {}),
  };

  const { field, dir } = parseEventSort(opts.sort);

  const [rows, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { [field]: dir },
      skip: opts.skip,
      take: opts.take,
      // Pull just enough to derive the "falta registro de empleados" flag per row.
      include: { staff: { select: { actualMinutes: true } } },
    }),
    prisma.event.count({ where }),
  ]);
  return { rows, total };
}

export async function getEvent(id: string) {
  return prisma.event.findUniqueOrThrow({ where: { id } });
}

export async function createEvent(data: EventFormValues) {
  return prisma.event.create({ data });
}

export async function updateEvent(id: string, data: EventFormValues) {
  return prisma.event.update({ where: { id }, data });
}

export async function deleteEvent(id: string) {
  return prisma.event.delete({ where: { id } });
}

// The event price is never entered by hand — it is the subtotal derived from the
// event's service lines minus its complimentary (bonificado) lines. Providers and
// staff are venue costs and never raise the price, so they are excluded here.
// Call this after any change to an event's services or bonificados to keep the
// stored totalPrice in sync (it backs Cobrado/Saldo, payment state, and reports).
export async function recomputeEventTotalPrice(eventId: string): Promise<number> {
  const lines = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: {
      services: { include: { service: true } },
      bonificados: { include: { service: true } },
    },
  });
  const { subtotal } = computeEventFinancials({
    services: lines.services,
    providers: [],
    bonificados: lines.bonificados,
    staff: [],
  });
  await prisma.event.update({ where: { id: eventId }, data: { totalPrice: subtotal } });
  return subtotal;
}

export async function setEventState(id: string, state: EventState) {
  return prisma.event.update({ where: { id }, data: { state } });
}

// Record an event payment (cobro): create the INGRESO movement and, when the
// collected total crosses a threshold, advance the event state — both in one
// transaction so a movement is never recorded without its state change (or
// vice versa). The new state is decided from the already-collected INGRESO
// total plus this payment (resolvePaidState — pure, never downgrades).
export async function registrarCobro(eventId: string, data: CobroValues) {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });

  // Default a description so the movement isn't blank on the Movimientos list.
  const description = data.description || `Cobro — ${event.name}`;

  const previo = await prisma.movement.aggregate({
    where: { eventId, type: "INGRESO" },
    _sum: { amount: true },
  });
  const cobrado = (previo._sum.amount ?? 0) + data.amount;
  const newState = resolvePaidState(event.state, cobrado, event.totalPrice);

  const [movement] = await prisma.$transaction([
    prisma.movement.create({
      data: {
        accountId: data.accountId,
        type: "INGRESO",
        amount: data.amount,
        description,
        date: data.date,
        eventId,
      },
    }),
    ...(newState
      ? [prisma.event.update({ where: { id: eventId }, data: { state: newState } })]
      : []),
  ]);
  return { movement, newState };
}

// Focused reschedule used by calendar drag-and-drop: only moves the time range,
// leaving services/providers/financials untouched.
export async function rescheduleEvent(id: string, startAt: Date, endAt: Date) {
  return prisma.event.update({ where: { id }, data: { startAt, endAt } });
}

export async function listEventsInRange(start: Date, end: Date) {
  return prisma.event.findMany({
    where: { startAt: { gte: start, lte: end } },
    orderBy: { startAt: "asc" },
  });
}

// A confirmed booking occupies the venue; quotes and suspended events do not.
// Only these states block (and are blocked by) another event in the same slot.
export const BLOCKING_STATES: EventState[] = ["RESERVADO", "SENADO", "PAGADO", "CERRADO"];

export function isBlockingState(state: EventState): boolean {
  return BLOCKING_STATES.includes(state);
}

// Returns the first confirmed booking whose time range overlaps [startAt, endAt),
// or null. Half-open: touching edges don't conflict. `excludeId` skips self on edit.
export async function findBlockingOverlap(
  startAt: Date,
  endAt: Date,
  excludeId?: string,
) {
  return prisma.event.findFirst({
    where: {
      state: { in: BLOCKING_STATES },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: { startAt: "asc" },
  });
}
