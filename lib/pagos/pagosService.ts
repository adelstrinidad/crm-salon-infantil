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

// Service-backed prestador payments: a service used on an event is owed to the
// prestador that backs it (service.prestadorId), amount = service.cost * qty.
// Feeds the unified Pago prestadores page alongside getProviderPayments.
export async function getServicePrestadorPayments(opts: {
  from?: Date;
  to?: Date;
  prestadorId?: string;
  paid?: boolean;
}) {
  return prisma.eventService.findMany({
    where: {
      service: {
        prestadorId: opts.prestadorId
          ? opts.prestadorId
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
      service: { include: { prestador: true } },
    },
    orderBy: { event: { startAt: "asc" } },
  });
}

// Removed (audited) lines for the pago tables. `kinds` selects which obligation
// types to include (prestadores = provider+service; personal = staff). Filtered
// by removal date range. Append-only snapshots — never paid/edited here.
export async function getRemovedPayments(opts: {
  kinds: string[];
  from?: Date;
  to?: Date;
}) {
  return prisma.removedEventLine.findMany({
    where: {
      kind: { in: opts.kinds },
      removedAt: {
        ...(opts.from ? { gte: opts.from } : {}),
        ...(opts.to ? { lte: opts.to } : {}),
      },
    },
    orderBy: { removedAt: "desc" },
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
