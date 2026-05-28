import { prisma } from "@/lib/prisma";

export async function addBonificadoToEvent(eventId: string, serviceId: string, qty = 1) {
  return prisma.eventBonificado.upsert({
    where: { eventId_serviceId: { eventId, serviceId } },
    create: { eventId, serviceId, qty },
    update: { qty },
  });
}

export async function removeBonificadoFromEvent(eventId: string, serviceId: string) {
  return prisma.eventBonificado.delete({
    where: { eventId_serviceId: { eventId, serviceId } },
  });
}
