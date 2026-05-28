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

export type EventFinancialSummary = {
  totalCost: number;
  totalPrice: number;
  profit: number;
};

export function computeFinancialSummary(
  lines: Array<{ qty: number; service: { cost: number; price: number } }>
): EventFinancialSummary {
  const totalCost = lines.reduce((s, l) => s + l.service.cost * l.qty, 0);
  const totalPrice = lines.reduce((s, l) => s + l.service.price * l.qty, 0);
  return { totalCost, totalPrice, profit: totalPrice - totalCost };
}
