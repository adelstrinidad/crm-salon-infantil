import { prisma } from "@/lib/prisma";

export async function getProviderPayments(opts: {
  from?: Date;
  to?: Date;
  providerId?: string;
  paid?: boolean;
}) {
  return prisma.eventProvider.findMany({
    where: {
      ...(opts.providerId ? { providerId: opts.providerId } : {}),
      ...(opts.paid !== undefined ? { paid: opts.paid } : {}),
      event: {
        startAt: {
          ...(opts.from ? { gte: opts.from } : {}),
          ...(opts.to ? { lte: opts.to } : {}),
        },
      },
    },
    include: {
      event: true,
      provider: true,
    },
    orderBy: { event: { startAt: "asc" } },
  });
}

export async function markProviderPaid(eventProviderId: string) {
  return prisma.eventProvider.update({
    where: { id: eventProviderId },
    data: { paid: true, paidAt: new Date() },
  });
}

export async function getProveedorPayments(opts: {
  from?: Date;
  to?: Date;
  proveedorId?: string;
  paid?: boolean;
}) {
  return prisma.eventService.findMany({
    where: {
      service: {
        proveedorId: opts.proveedorId
          ? opts.proveedorId
          : { not: null },
      },
      ...(opts.paid !== undefined ? { paid: opts.paid } : {}),
      event: {
        startAt: {
          ...(opts.from ? { gte: opts.from } : {}),
          ...(opts.to ? { lte: opts.to } : {}),
        },
      },
    },
    include: {
      event: true,
      service: { include: { proveedor: true } },
    },
    orderBy: { event: { startAt: "asc" } },
  });
}

export async function markServicePaid(eventServiceId: string) {
  return prisma.eventService.update({
    where: { id: eventServiceId },
    data: { paid: true, paidAt: new Date() },
  });
}
