"use server";

import { revalidatePath } from "next/cache";
import { addServiceToEvent, removeServiceFromEvent } from "@/lib/events/eventServiceLines";
import { recomputeEventTotalPrice } from "@/lib/events/eventService";
import { requireSession } from "@/lib/auth/session";

export async function addServiceAction(eventId: string, serviceId: string, qty: number) {
  await requireSession();
  await addServiceToEvent(eventId, serviceId, qty);
  await recomputeEventTotalPrice(eventId);
  revalidatePath(`/eventos/${eventId}/editar`);
  revalidatePath(`/eventos/${eventId}`);
}

export async function removeServiceAction(eventId: string, serviceId: string) {
  await requireSession();
  await removeServiceFromEvent(eventId, serviceId);
  await recomputeEventTotalPrice(eventId);
  revalidatePath(`/eventos/${eventId}/editar`);
  revalidatePath(`/eventos/${eventId}`);
}
