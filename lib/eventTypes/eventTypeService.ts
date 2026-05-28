import { prisma } from "@/lib/prisma";
import { type EventTypeFormInput } from "./schema";
export { eventTypeFormSchema, type EventTypeFormInput } from "./schema";

export async function listEventTypes() {
  return prisma.eventType.findMany({ orderBy: { name: "asc" } });
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
