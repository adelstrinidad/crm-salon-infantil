import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { MovementFormValues } from "@/lib/finanzas/schema";
import { staffLineCost } from "@/lib/staff/hours";
import type { ReversalReason } from "./reversalReasons";

// Settlement result for the pago actions: `eventId` (when the line belongs to
// an event) lets the action revalidate the event's pages.
export type SettleResult =
  | { ok: true; eventId?: string }
  | { ok: false; error: string };

// A reversal request, validated at the action boundary (manager code checked
// there). Carries only the audited reason — the amount is read from the
// original movement, never recomputed or trusted from the client.
export type ReversalInput = { reason: ReversalReason; reasonText?: string };

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
  return prisma.$transaction(async (tx) => {
    const created = await tx.movement.create({ data: movement });
    await tx.eventProvider.update({
      where: { id: eventProviderId },
      data: { paid: true, paidAt: new Date(), paidMovementId: created.id },
    });
    return created;
  });
}

// Settle a direct event-provider line. The amount is NEVER taken from the
// client: it is the line's own snapshotted cost (EventProvider.cost). Guards
// against double payment — paying an already-paid line would post a second
// EGRESO movement.
export async function settleProviderPayment(
  eventProviderId: string,
  accountId: string
): Promise<SettleResult> {
  const line = await prisma.eventProvider.findUnique({
    where: { id: eventProviderId },
    include: { provider: true, event: true },
  });
  if (!line) return { ok: false, error: "Asignación no encontrada" };
  if (line.paid) return { ok: false, error: "Ya está pagado" };
  if (line.cost <= 0) return { ok: false, error: "El monto a pagar es cero" };

  await payProvider(eventProviderId, {
    accountId,
    type: "EGRESO",
    amount: line.cost,
    description: `Pago ${line.provider.name} — ${line.event.name}`,
    date: new Date(),
    toAccountId: undefined,
    eventId: undefined,
  });
  return { ok: true, eventId: line.eventId };
}

// Settle a service-backed prestador line. Amount is computed server-side as
// service.cost × qty (never trusted from the client) and the line must be
// backed by a prestador.
export async function settleServicePayment(
  eventServiceId: string,
  accountId: string
): Promise<SettleResult> {
  const line = await prisma.eventService.findUnique({
    where: { id: eventServiceId },
    include: { service: { include: { prestador: true } }, event: true },
  });
  if (!line) return { ok: false, error: "Asignación no encontrada" };
  if (line.paid) return { ok: false, error: "Ya está pagado" };
  if (!line.service.prestador) {
    return { ok: false, error: "El servicio no tiene prestador asignado" };
  }
  const amount = line.service.cost * line.qty;
  if (amount <= 0) return { ok: false, error: "El monto a pagar es cero" };

  await payService(eventServiceId, {
    accountId,
    type: "EGRESO",
    amount,
    description: `Pago ${line.service.prestador.name} — ${line.service.name} — ${line.event.name}`,
    date: new Date(),
    toAccountId: undefined,
    eventId: undefined,
  });
  return { ok: true, eventId: line.eventId };
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
  return prisma.$transaction(async (tx) => {
    const created = await tx.movement.create({ data: movement });
    await tx.eventStaff.update({
      where: { id: eventStaffId },
      data: { paid: true, paidAt: new Date(), paidMovementId: created.id },
    });
    return created;
  });
}

// Settle an internal staff assignment. The amount is computed server-side from
// the REAL hours logged (staff.hourlyRate × actualMinutes — never trusts the
// client): you can't pay until the hours are registered, which also clears the
// "falta registro" state for that line.
export async function settleStaffPayment(
  eventStaffId: string,
  accountId: string
): Promise<SettleResult> {
  const line = await prisma.eventStaff.findUnique({
    where: { id: eventStaffId },
    include: { staff: true, event: true },
  });
  if (!line) return { ok: false, error: "Asignación no encontrada" };
  if (line.paid) return { ok: false, error: "Ya está pagado" };
  if (line.actualMinutes == null) {
    return { ok: false, error: "Registrá las horas reales antes de pagar" };
  }

  const amount = staffLineCost(line.staff.hourlyRate, line.actualMinutes);
  if (amount <= 0) return { ok: false, error: "El monto a pagar es cero" };

  await payStaff(eventStaffId, {
    accountId,
    type: "EGRESO",
    amount,
    description: `Pago personal — ${line.staff.name} (${line.event.name})`,
    date: new Date(),
    toAccountId: undefined,
    eventId: undefined,
  });
  return { ok: true, eventId: line.eventId };
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
  return prisma.$transaction(async (tx) => {
    const created = await tx.movement.create({ data: movement });
    await tx.eventService.update({
      where: { id: eventServiceId },
      data: { paid: true, paidAt: new Date(), paidMovementId: created.id },
    });
    return created;
  });
}

// ─── Payment reversal (Anular pago) ──────────────────────────────────────────
// Undo a settled payment WITHOUT erasing history: keep the original EGRESO and
// post a compensating INGRESO (kind "reversal", same account/amount) so the
// account balance nets back to zero and the money trail survives. The line
// returns to "pendiente" (paid=false, paidMovementId cleared) and an append-only
// ReversedPayment row records who/what/why. All steps run in one transaction.
//
// The amount is the ORIGINAL movement's amount — never a recompute — so a later
// edit to the line's cost/hours can't change what gets reversed.

export type ReversalContext = {
  kind: string;
  movement: { id: string; amount: number; accountId: string };
  entityName: string;
  eventId: string | null;
  eventName: string | null;
  description: string;
  originalPaidAt: Date;
  reversal: ReversalInput;
  clearLine: (tx: Prisma.TransactionClient) => Promise<unknown>;
};

export async function postReversal(ctx: ReversalContext): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const compensating = await tx.movement.create({
      data: {
        accountId: ctx.movement.accountId,
        type: "INGRESO",
        kind: "reversal",
        amount: ctx.movement.amount,
        description: ctx.description,
        date: new Date(),
        toAccountId: undefined,
        eventId: undefined,
      },
    });
    await ctx.clearLine(tx);
    await tx.reversedPayment.create({
      data: {
        kind: ctx.kind,
        eventId: ctx.eventId,
        eventName: ctx.eventName,
        entityName: ctx.entityName,
        amount: ctx.movement.amount,
        reason: ctx.reversal.reason,
        reasonText: ctx.reversal.reasonText?.trim() || null,
        originalMovementId: ctx.movement.id,
        reversalMovementId: compensating.id,
        originalPaidAt: ctx.originalPaidAt,
      },
    });
  });
}

export async function reverseProviderPayment(
  eventProviderId: string,
  reversal: ReversalInput
): Promise<SettleResult> {
  const line = await prisma.eventProvider.findUnique({
    where: { id: eventProviderId },
    include: { provider: true, event: true, paidMovement: true },
  });
  if (!line) return { ok: false, error: "Asignación no encontrada" };
  if (!line.paid) return { ok: false, error: "El pago no está registrado" };
  if (!line.paidMovement) {
    return { ok: false, error: "No se encuentra el movimiento original del pago" };
  }

  await postReversal({
    kind: "provider",
    movement: line.paidMovement,
    entityName: line.provider.name,
    eventId: line.eventId,
    eventName: line.event.name,
    description: `Reversión de pago ${line.provider.name} — ${line.event.name}`,
    originalPaidAt: line.paidAt ?? line.paidMovement.date,
    reversal,
    clearLine: (tx) =>
      tx.eventProvider.update({
        where: { id: eventProviderId },
        data: { paid: false, paidAt: null, paidMovementId: null },
      }),
  });
  return { ok: true, eventId: line.eventId };
}

export async function reverseServicePayment(
  eventServiceId: string,
  reversal: ReversalInput
): Promise<SettleResult> {
  const line = await prisma.eventService.findUnique({
    where: { id: eventServiceId },
    include: { service: { include: { prestador: true } }, event: true, paidMovement: true },
  });
  if (!line) return { ok: false, error: "Asignación no encontrada" };
  if (!line.paid) return { ok: false, error: "El pago no está registrado" };
  if (!line.paidMovement) {
    return { ok: false, error: "No se encuentra el movimiento original del pago" };
  }

  const entityName = line.service.prestador?.name ?? line.service.name;
  await postReversal({
    kind: "service",
    movement: line.paidMovement,
    entityName,
    eventId: line.eventId,
    eventName: line.event.name,
    description: `Reversión de pago ${entityName} — ${line.service.name} — ${line.event.name}`,
    originalPaidAt: line.paidAt ?? line.paidMovement.date,
    reversal,
    clearLine: (tx) =>
      tx.eventService.update({
        where: { id: eventServiceId },
        data: { paid: false, paidAt: null, paidMovementId: null },
      }),
  });
  return { ok: true, eventId: line.eventId };
}

export async function reverseStaffPayment(
  eventStaffId: string,
  reversal: ReversalInput
): Promise<SettleResult> {
  const line = await prisma.eventStaff.findUnique({
    where: { id: eventStaffId },
    include: { staff: true, event: true, paidMovement: true },
  });
  if (!line) return { ok: false, error: "Asignación no encontrada" };
  if (!line.paid) return { ok: false, error: "El pago no está registrado" };
  if (!line.paidMovement) {
    return { ok: false, error: "No se encuentra el movimiento original del pago" };
  }

  await postReversal({
    kind: "staff",
    movement: line.paidMovement,
    entityName: line.staff.name,
    eventId: line.eventId,
    eventName: line.event.name,
    description: `Reversión de pago personal — ${line.staff.name} (${line.event.name})`,
    originalPaidAt: line.paidAt ?? line.paidMovement.date,
    reversal,
    clearLine: (tx) =>
      tx.eventStaff.update({
        where: { id: eventStaffId },
        data: { paid: false, paidAt: null, paidMovementId: null },
      }),
  });
  return { ok: true, eventId: line.eventId };
}
