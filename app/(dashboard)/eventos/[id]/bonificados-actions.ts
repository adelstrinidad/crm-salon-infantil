"use server";

import { revalidatePath } from "next/cache";
import { addBonificadoToEvent, removeBonificadoFromEvent } from "@/lib/events/eventBonificadoLines";
import { recomputeEventTotalPrice } from "@/lib/events/eventService";
import { requireSession } from "@/lib/auth/session";

export async function addBonificadoAction(eventId: string, serviceId: string, qty: number) {
  await requireSession();
  await addBonificadoToEvent(eventId, serviceId, qty);
  await recomputeEventTotalPrice(eventId);
  revalidatePath(`/eventos/${eventId}/editar`);
  revalidatePath(`/eventos/${eventId}`);
}

export async function removeBonificadoAction(eventId: string, serviceId: string) {
  await requireSession();
  await removeBonificadoFromEvent(eventId, serviceId);
  await recomputeEventTotalPrice(eventId);
  revalidatePath(`/eventos/${eventId}/editar`);
  revalidatePath(`/eventos/${eventId}`);
}
