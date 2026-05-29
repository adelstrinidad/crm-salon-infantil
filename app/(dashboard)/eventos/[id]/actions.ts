"use server";

import { revalidatePath } from "next/cache";
import { createMovement, getMovementsByEvent } from "@/lib/finanzas/finanzasService";
import { getEvent, setEventState } from "@/lib/events/eventService";
import { resolvePaidState } from "@/lib/events/paymentState";
import { requireSession } from "@/lib/auth/session";

export async function registrarCobroAction(
  eventId: string,
  data: {
    accountId: string;
    amount: number;
    description: string;
    date: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!data.accountId) return { ok: false, error: "Seleccioná una cuenta" };
  if (!data.amount || data.amount <= 0) return { ok: false, error: "Ingresá un importe válido" };

  const event = await getEvent(eventId);
  // Default a description so the movement isn't blank on the Movimientos list.
  const description = data.description.trim() || `Cobro — ${event.name}`;

  await createMovement({
    accountId: data.accountId,
    type: "INGRESO",
    amount: data.amount,
    description,
    date: new Date(data.date),
    toAccountId: undefined,
    eventId,
  });

  // Auto-advance the event state based on how much has now been collected.
  const movements = await getMovementsByEvent(eventId);
  const cobrado = movements
    .filter((m) => m.type === "INGRESO")
    .reduce((sum, m) => sum + m.amount, 0);
  const newState = resolvePaidState(event.state, cobrado, event.totalPrice);
  if (newState) {
    await setEventState(eventId, newState);
  }

  revalidatePath(`/eventos/${eventId}`);
  revalidatePath("/eventos");
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
