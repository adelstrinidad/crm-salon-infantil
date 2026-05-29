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

export async function listEventsInRange(start: Date, end: Date) {
  return prisma.event.findMany({
    where: { startAt: { gte: start, lte: end } },
    orderBy: { startAt: "asc" },
  });
}
