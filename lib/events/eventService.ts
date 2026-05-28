// Domain layer: all event DB operations live here.
// Server Actions and Route Handlers call these functions — they never import Prisma directly.
import { prisma } from "@/lib/prisma";
import type { EventFormValues } from "./schema";

export async function listEvents() {
  return prisma.event.findMany({
    orderBy: { startAt: "asc" },
  });
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

export async function listEventsInRange(start: Date, end: Date) {
  return prisma.event.findMany({
    where: { startAt: { gte: start, lte: end } },
    orderBy: { startAt: "asc" },
  });
}
