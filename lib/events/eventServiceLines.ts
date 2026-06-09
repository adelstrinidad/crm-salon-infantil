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

// Remove a service from an event. Snapshots the line (owed = service.cost × qty)
// into RemovedEventLine and deletes the live row in one transaction.
export async function removeServiceFromEvent(eventId: string, serviceId: string) {
  const row = await prisma.eventService.findUnique({
    where: { eventId_serviceId: { eventId, serviceId } },
    include: { service: true, event: { select: { name: true } } },
  });
  if (!row) return null;
  const [, deleted] = await prisma.$transaction([
    prisma.removedEventLine.create({
      data: {
        kind: "service",
        eventId,
        eventName: row.event.name,
        entityName: row.service.name,
        entityRole: null,
        amount: row.service.cost * row.qty,
        paid: row.paid,
        paidAt: row.paidAt,
        originalCreatedAt: row.createdAt,
      },
    }),
    prisma.eventService.delete({
      where: { eventId_serviceId: { eventId, serviceId } },
    }),
  ]);
  return deleted;
}
