"use server";

import { revalidatePath } from "next/cache";
import { addServiceToEvent, removeServiceFromEvent } from "@/lib/events/eventServiceLines";
import { requireSession } from "@/lib/auth/session";

export async function addServiceAction(eventId: string, serviceId: string, qty: number) {
  await requireSession();
  await addServiceToEvent(eventId, serviceId, qty);
  revalidatePath(`/eventos/${eventId}/editar`);
}

export async function removeServiceAction(eventId: string, serviceId: string) {
  await requireSession();
  await removeServiceFromEvent(eventId, serviceId);
  revalidatePath(`/eventos/${eventId}/editar`);
}
