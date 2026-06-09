import { prisma } from "@/lib/prisma";

export async function getEventWithAll(id: string) {
  return prisma.event.findUniqueOrThrow({
    where: { id },
    include: {
      services: {
        include: { service: { include: { prestador: true } } },
        orderBy: { service: { name: "asc" } },
      },
      providers: {
        include: { provider: true },
        orderBy: { provider: { name: "asc" } },
      },
      bonificados: {
        include: { service: true },
        orderBy: { service: { name: "asc" } },
      },
      staff: {
        include: { staff: true },
        orderBy: { staff: { name: "asc" } },
      },
    },
  });
}

// Attach a provider to an event. `cost` is the explicit per-event cost in cents;
// when omitted, it is snapshotted from the provider's catalog cost. Never null.
export async function addProviderToEvent(
  eventId: string,
  providerId: string,
  cost?: number,
) {
  const resolvedCost =
    cost ?? (await prisma.provider.findUniqueOrThrow({ where: { id: providerId } })).cost;
  return prisma.eventProvider.upsert({
    where: { eventId_providerId: { eventId, providerId } },
    create: { eventId, providerId, cost: resolvedCost },
    update: { cost: resolvedCost },
  });
}

// Update the explicit per-event cost of an already-attached provider.
export async function setProviderCost(eventId: string, providerId: string, cost: number) {
  return prisma.eventProvider.update({
    where: { eventId_providerId: { eventId, providerId } },
    data: { cost },
  });
}

// Remove a provider from an event. Snapshots the line into the RemovedEventLine
// audit table and deletes the live row in one transaction, so the removal is
// tracked (shown as "Eliminado" in Pago prestadores) instead of vanishing.
export async function removeProviderFromEvent(eventId: string, providerId: string) {
  const row = await prisma.eventProvider.findUnique({
    where: { eventId_providerId: { eventId, providerId } },
    include: { provider: true, event: { select: { name: true } } },
  });
  if (!row) return null;
  const [, deleted] = await prisma.$transaction([
    prisma.removedEventLine.create({
      data: {
        kind: "provider",
        eventId,
        eventName: row.event.name,
        entityName: row.provider.name,
        entityRole: row.provider.role,
        amount: row.cost,
        paid: row.paid,
        paidAt: row.paidAt,
        originalCreatedAt: row.createdAt,
      },
    }),
    prisma.eventProvider.delete({
      where: { eventId_providerId: { eventId, providerId } },
    }),
  ]);
  return deleted;
}
