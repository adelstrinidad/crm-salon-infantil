"use server";

import { revalidatePath } from "next/cache";
import {
  startConsumos,
  addConsumo,
  removeConsumo,
  closeConsumos,
  cobrarConsumosCliente,
  cobrarConsumosInvitado,
} from "@/lib/consumos/consumoService";
import {
  consumoInputSchema,
  consumoPagoSchema,
  consumoRemovalInputSchema,
  type ConsumoInput,
  type ConsumoPagoInput,
  type ConsumoRemovalInput,
} from "@/lib/consumos/schema";
import { requireSession } from "@/lib/auth/session";
import { verifyManagerCode } from "@/lib/auth/managerCode";

type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown, fallback: string): ActionResult {
  return { ok: false, error: e instanceof Error ? e.message : fallback };
}

function revalidateEvent(eventId: string) {
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}/consumos`);
  revalidatePath("/eventos");
  revalidatePath("/calendario");
}

export async function startConsumosAction(eventId: string): Promise<ActionResult> {
  await requireSession();
  try {
    await startConsumos(eventId);
  } catch (e) {
    return fail(e, "No se pudo iniciar el evento");
  }
  revalidateEvent(eventId);
  return { ok: true };
}

export async function addConsumoAction(eventId: string, data: ConsumoInput): Promise<ActionResult> {
  await requireSession();
  const parsed = consumoInputSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await addConsumo(eventId, parsed.data);
  } catch (e) {
    return fail(e, "No se pudo registrar el consumo");
  }
  revalidateEvent(eventId);
  revalidatePath("/insumos");
  return { ok: true };
}

export async function removeConsumoAction(
  eventId: string,
  consumoId: string,
  removal: ConsumoRemovalInput
): Promise<ActionResult> {
  await requireSession();
  const parsed = consumoRemovalInputSchema.safeParse(removal);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  // Every void needs the manager's approval code — rate-limited server-side.
  const approval = await verifyManagerCode(parsed.data.managerCode);
  if (!approval.ok) return { ok: false, error: approval.error };

  try {
    await removeConsumo(consumoId, {
      reason: parsed.data.reason,
      reasonText: parsed.data.reasonText,
    });
  } catch (e) {
    return fail(e, "No se pudo anular el consumo");
  }
  revalidateEvent(eventId);
  revalidatePath("/insumos");
  return { ok: true };
}

export async function closeConsumosAction(eventId: string): Promise<ActionResult> {
  await requireSession();
  try {
    await closeConsumos(eventId);
  } catch (e) {
    return fail(e, "No se pudieron cerrar los consumos");
  }
  revalidateEvent(eventId);
  return { ok: true };
}

export async function cobrarConsumosClienteAction(
  eventId: string,
  data: ConsumoPagoInput
): Promise<ActionResult> {
  await requireSession();
  const parsed = consumoPagoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await cobrarConsumosCliente(eventId, parsed.data);
  } catch (e) {
    return fail(e, "No se pudo registrar el pago");
  }
  revalidateEvent(eventId);
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}

export async function cobrarConsumosInvitadoAction(
  eventId: string,
  payerLabel: string,
  data: ConsumoPagoInput
): Promise<ActionResult> {
  await requireSession();
  const parsed = consumoPagoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!payerLabel.trim()) return { ok: false, error: "Invitado inválido" };
  try {
    await cobrarConsumosInvitado(eventId, payerLabel, parsed.data);
  } catch (e) {
    return fail(e, "No se pudo registrar el pago");
  }
  revalidateEvent(eventId);
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
