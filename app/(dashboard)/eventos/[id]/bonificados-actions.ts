"use server";

import { revalidatePath } from "next/cache";
import { addBonificadoToEvent, removeBonificadoFromEvent } from "@/lib/events/eventBonificadoLines";
import { requireSession } from "@/lib/auth/session";

export async function addBonificadoAction(eventId: string, serviceId: string, qty: number) {
  await requireSession();
  await addBonificadoToEvent(eventId, serviceId, qty);
  revalidatePath(`/eventos/${eventId}/editar`);
}

export async function removeBonificadoAction(eventId: string, serviceId: string) {
  await requireSession();
  await removeBonificadoFromEvent(eventId, serviceId);
  revalidatePath(`/eventos/${eventId}/editar`);
}
