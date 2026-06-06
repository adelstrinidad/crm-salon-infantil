import { prisma } from "@/lib/prisma";
import { type EventTypeFormInput } from "./schema";
import { parseEventTypeSort } from "./listFilters";
import type { Prisma } from "@/app/generated/prisma/client";
export { eventTypeFormSchema, type EventTypeFormInput } from "./schema";

export async function listEventTypes() {
  return prisma.eventType.findMany({ orderBy: { name: "asc" } });
}

// Filtered + sorted + paginated list for the event-types table. Builds a Prisma
// `where` from the optional text search and an `orderBy` from a validated sort
// string. Returns the page rows plus the total matching count so the pager
// stays correct.
export async function listEventTypesFiltered(opts: {
  q?: string;
  sort?: string;
  skip: number;
  take: number;
}) {
  const where: Prisma.EventTypeWhereInput = {
    ...(opts.q ? { name: { contains: opts.q } } : {}),
  };

  const { field, dir } = parseEventTypeSort(opts.sort);

  const [rows, total] = await Promise.all([
    prisma.eventType.findMany({
      where,
      orderBy: { [field]: dir },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.eventType.count({ where }),
  ]);
  return { rows, total };
}

export async function getEventType(id: string) {
  return prisma.eventType.findUniqueOrThrow({ where: { id } });
}

export async function createEventType(data: EventTypeFormInput) {
  return prisma.eventType.create({ data });
}

export async function updateEventType(id: string, data: EventTypeFormInput) {
  return prisma.eventType.update({ where: { id }, data });
}

export async function deleteEventType(id: string) {
  return prisma.eventType.delete({ where: { id } });
}
