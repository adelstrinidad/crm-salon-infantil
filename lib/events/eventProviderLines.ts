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

export async function removeProviderFromEvent(eventId: string, providerId: string) {
  return prisma.eventProvider.delete({
    where: { eventId_providerId: { eventId, providerId } },
  });
}
