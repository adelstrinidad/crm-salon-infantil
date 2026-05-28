import { prisma } from "@/lib/prisma";

export async function getEventWithAll(id: string) {
  return prisma.event.findUniqueOrThrow({
    where: { id },
    include: {
      services: {
        include: { service: { include: { proveedor: true } } },
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
    },
  });
}

export async function addProviderToEvent(eventId: string, providerId: string) {
  return prisma.eventProvider.upsert({
    where: { eventId_providerId: { eventId, providerId } },
    create: { eventId, providerId },
    update: {},
  });
}

export async function removeProviderFromEvent(eventId: string, providerId: string) {
  return prisma.eventProvider.delete({
    where: { eventId_providerId: { eventId, providerId } },
  });
}
