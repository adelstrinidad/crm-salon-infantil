// Manage EventService join records and compute financial summary.
import { prisma } from "@/lib/prisma";

export async function getEventWithServices(id: string) {
  return prisma.event.findUniqueOrThrow({
    where: { id },
    include: {
      services: {
        include: { service: true },
        orderBy: { service: { name: "asc" } },
      },
    },
  });
}

export async function addServiceToEvent(eventId: string, serviceId: string, qty = 1) {
  return prisma.eventService.upsert({
    where: { eventId_serviceId: { eventId, serviceId } },
    create: { eventId, serviceId, qty },
    update: { qty },
  });
}

export async function removeServiceFromEvent(eventId: string, serviceId: string) {
  return prisma.eventService.delete({
    where: { eventId_serviceId: { eventId, serviceId } },
  });
}
