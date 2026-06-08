import { prisma } from "@/lib/prisma";
import type { MovementFormValues } from "@/lib/finanzas/schema";

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

// Settle a staff (prestador) payment atomically: mark the line paid AND record
// the EGRESO movement in a single transaction. Either both commit or neither —
// prevents a line being marked paid while its cash-outflow movement is missing.
export async function payProvider(
  eventProviderId: string,
  movement: MovementFormValues
) {
  const [, created] = await prisma.$transaction([
    prisma.eventProvider.update({
      where: { id: eventProviderId },
      data: { paid: true, paidAt: new Date() },
    }),
    prisma.movement.create({ data: movement }),
  ]);
  return created;
}

// Internal hourly staff payments. One row per EventStaff assignment, with its
// event + staff, so the Pago personal page can compute the amount from the real
// hours (staff.hourlyRate × actualMinutes).
export async function getStaffPayments(opts: {
  from?: Date;
  to?: Date;
  staffId?: string;
  paid?: boolean;
}) {
  return prisma.eventStaff.findMany({
    where: {
      ...(opts.staffId ? { staffId: opts.staffId } : {}),
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
      staff: true,
    },
    orderBy: { event: { startAt: "asc" } },
  });
}

// Settle a staff payment atomically: mark the assignment paid AND record the
// EGRESO movement in a single transaction. See payProvider — either both commit
// or neither, so a line is never marked paid without its cash-outflow movement.
export async function payStaff(eventStaffId: string, movement: MovementFormValues) {
  const [, created] = await prisma.$transaction([
    prisma.eventStaff.update({
      where: { id: eventStaffId },
      data: { paid: true, paidAt: new Date() },
    }),
    prisma.movement.create({ data: movement }),
  ]);
  return created;
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

// Settle a supplier (proveedor) payment atomically: mark the service line paid
// AND record the EGRESO movement in a single transaction. See payProvider.
export async function payService(
  eventServiceId: string,
  movement: MovementFormValues
) {
  const [, created] = await prisma.$transaction([
    prisma.eventService.update({
      where: { id: eventServiceId },
      data: { paid: true, paidAt: new Date() },
    }),
    prisma.movement.create({ data: movement }),
  ]);
  return created;
}
