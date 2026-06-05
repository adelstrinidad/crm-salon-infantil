// Domain layer: all event DB operations live here.
// Server Actions and Route Handlers call these functions — they never import Prisma directly.
import { prisma } from "@/lib/prisma";
import type { EventFormValues, EventState } from "./schema";

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

export async function setEventState(id: string, state: EventState) {
  return prisma.event.update({ where: { id }, data: { state } });
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
