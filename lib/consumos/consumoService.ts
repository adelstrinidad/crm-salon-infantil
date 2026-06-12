// Domain layer: consumption capture during a running event.
// Lifecycle: startConsumos (event → EN_CURSO) → addConsumo / removeConsumo while
// open → closeConsumos (freeze lines) → registrarPagoConsumos (client pays the
// bill). Stock changes always go through applyStockMovement so the counter and
// ledger never disagree.
import { prisma } from "@/lib/prisma";
import { applyStockMovement } from "@/lib/stock/stockService";
import { consumoLineTotal } from "./calc";
import { tableLabel } from "./schema";
import { reasonRestoresStock, removalReasonLabel, type RemovalReason } from "./removalReasons";
import type { ConsumoInput, ConsumoPagoValues } from "./schema";
import type { EventState } from "@/lib/events/schema";

// Only a confirmed booking can start running. Quotes, suspended and closed
// events have nothing to capture; EN_CURSO means it already started.
export const STARTABLE_STATES: EventState[] = ["RESERVADO", "SENADO", "PAGADO"];

export async function startConsumos(eventId: string) {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  if (event.consumosStartedAt) throw new Error("El evento ya fue iniciado");
  if (!STARTABLE_STATES.includes(event.state)) {
    throw new Error("Solo un evento confirmado puede iniciarse");
  }
  return prisma.event.update({
    where: { id: eventId },
    data: { state: "EN_CURSO", consumosStartedAt: new Date() },
  });
}

// The capture window: started and not yet closed.
async function requireOpenConsumos(eventId: string) {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  if (!event.consumosStartedAt) throw new Error("El evento no fue iniciado");
  if (event.consumosClosedAt) throw new Error("Los consumos ya fueron cerrados");
  return event;
}

// Record one request from a table: snapshot the insumo's event price and deduct
// stock, atomically. applyStockMovement throws on insufficient stock, which
// also aborts the line creation.
export async function addConsumo(eventId: string, data: ConsumoInput) {
  const event = await requireOpenConsumos(eventId);
  return prisma.$transaction(async (tx) => {
    const insumo = await tx.insumo.findUnique({ where: { id: data.insumoId } });
    if (!insumo) throw new Error("Insumo no encontrado");
    const consumo = await tx.eventConsumo.create({
      data: {
        eventId,
        insumoId: data.insumoId,
        tableNumber: data.tableNumber,
        qty: data.qty,
        unitPrice: insumo.eventPrice,
        payerType: data.payerType,
        // The label only identifies a guest; the organizer's lines carry none.
        payerLabel: data.payerType === "INVITADO" ? (data.payerLabel ?? null) : null,
      },
    });
    await applyStockMovement(tx, {
      insumoId: data.insumoId,
      kind: "consumo-evento",
      delta: -data.qty,
      reason: `${event.name} — ${tableLabel(data.tableNumber)}`,
    });
    return consumo;
  });
}

// Void a captured line (anulación) while the session is open. The manager code
// is verified at the action boundary before this runs. Atomically: snapshot the
// line into the append-only audit, delete it, and fix stock according to the
// reason — most reasons return the units to the shelf; "merma" keeps them gone
// but reclassifies the original deduction from consumo-evento to merma.
export async function removeConsumo(
  consumoId: string,
  removal: { reason: RemovalReason; reasonText?: string },
) {
  const consumo = await prisma.eventConsumo.findUniqueOrThrow({
    where: { id: consumoId },
    include: { event: true, insumo: true },
  });
  if (consumo.event.consumosClosedAt) throw new Error("Los consumos ya fueron cerrados");
  // A settled line already has its movement posted — voiding it would desync
  // the books. (Voiding paid lines = refund flow, out of scope for now.)
  if (consumo.paid) throw new Error("La línea ya fue cobrada — no se puede anular");

  const mesa = tableLabel(consumo.tableNumber);
  const label = removalReasonLabel(removal.reason);
  return prisma.$transaction(async (tx) => {
    await tx.removedConsumo.create({
      data: {
        eventId: consumo.eventId,
        eventName: consumo.event.name,
        insumoName: consumo.insumo.name,
        tableNumber: consumo.tableNumber,
        qty: consumo.qty,
        unitPrice: consumo.unitPrice,
        reason: removal.reason,
        reasonText: removal.reasonText || null,
        payerType: consumo.payerType,
        payerLabel: consumo.payerLabel,
        originalCreatedAt: consumo.createdAt,
      },
    });
    await tx.eventConsumo.delete({ where: { id: consumoId } });
    // Reverse the original deduction in both cases so per-kind totals stay
    // truthful; for merma, immediately re-deduct under the right kind.
    await applyStockMovement(tx, {
      insumoId: consumo.insumoId,
      kind: "consumo-evento",
      delta: consumo.qty,
      reason: `Anulación (${label}) — ${consumo.event.name} — ${mesa}`,
    });
    if (!reasonRestoresStock(removal.reason)) {
      await applyStockMovement(tx, {
        insumoId: consumo.insumoId,
        kind: "merma",
        delta: -consumo.qty,
        reason: `Merma en evento — ${consumo.event.name} — ${mesa}`,
      });
    }
  });
}

// The void audit trail for one event, most recent first.
export async function getRemovedConsumos(eventId: string) {
  return prisma.removedConsumo.findMany({
    where: { eventId },
    orderBy: { removedAt: "desc" },
  });
}

// Freeze the bill. The event stays EN_CURSO — its state keeps following the
// normal manual/payment flow afterwards.
export async function closeConsumos(eventId: string) {
  const event = await requireOpenConsumos(eventId);
  return prisma.event.update({
    where: { id: event.id },
    data: { consumosClosedAt: new Date() },
  });
}

export async function getEventConsumos(eventId: string) {
  return prisma.eventConsumo.findMany({
    where: { eventId },
    include: { insumo: true },
    orderBy: [{ tableNumber: "asc" }, { createdAt: "asc" }],
  });
}

// Settle a batch of unpaid lines: one INGRESO movement for the server-computed
// total, and the lines flagged paid, atomically. The movement is linked to the
// event but flagged kind="consumo" so the event's Cobrado/Saldo (vs totalPrice)
// never count it, while account balances do. Marking lines paid is the
// double-pay guard: a second settle finds nothing pending and throws upstream.
type PendingLine = { id: string; qty: number; unitPrice: number };

async function settleConsumoLines(
  eventId: string,
  pending: PendingLine[],
  data: ConsumoPagoValues,
  description: string,
) {
  const total = pending.reduce((s, l) => s + consumoLineTotal(l), 0);
  const [movement] = await prisma.$transaction([
    prisma.movement.create({
      data: {
        accountId: data.accountId,
        type: "INGRESO",
        kind: "consumo",
        amount: total,
        description,
        date: data.date,
        eventId,
      },
    }),
    prisma.eventConsumo.updateMany({
      where: { id: { in: pending.map((l) => l.id) } },
      data: { paid: true, paidAt: new Date() },
    }),
  ]);
  return { movement, total };
}

// The organizer's bill: every unpaid CLIENTE line, settled in one payment once
// the bill is closed (the venue charges everything at the end).
export async function cobrarConsumosCliente(eventId: string, data: ConsumoPagoValues) {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: { consumos: true },
  });
  if (!event.consumosClosedAt) throw new Error("Cerrá los consumos antes de registrar el pago");
  const pending = event.consumos.filter((c) => c.payerType === "CLIENTE" && !c.paid);
  if (pending.length === 0 || pending.reduce((s, l) => s + consumoLineTotal(l), 0) <= 0) {
    throw new Error("No hay consumos del cliente pendientes de cobro");
  }
  const description = data.description || `Consumos — ${event.name}`;
  return settleConsumoLines(eventId, pending, data, description);
}

// A self-paying guest's lines, charged whenever they settle up — while the
// event is still running or after close (a guest leaving early pays on the
// spot; a forgetful one pays at the end).
export async function cobrarConsumosInvitado(
  eventId: string,
  payerLabel: string,
  data: ConsumoPagoValues,
) {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: { consumos: true },
  });
  if (!event.consumosStartedAt) throw new Error("El evento no fue iniciado");
  const pending = event.consumos.filter(
    (c) => c.payerType === "INVITADO" && c.payerLabel === payerLabel && !c.paid,
  );
  if (pending.length === 0) {
    throw new Error("No hay consumos pendientes de ese invitado");
  }
  const description = data.description || `Consumos invitado ${payerLabel} — ${event.name}`;
  return settleConsumoLines(eventId, pending, data, description);
}
