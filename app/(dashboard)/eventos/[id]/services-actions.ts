"use server";

import { revalidatePath } from "next/cache";
import { addServiceToEvent, removeServiceFromEvent } from "@/lib/events/eventServiceLines";

export async function addServiceAction(eventId: string, serviceId: string, qty: number) {
  await addServiceToEvent(eventId, serviceId, qty);
  revalidatePath(`/eventos/${eventId}/editar`);
}

export async function removeServiceAction(eventId: string, serviceId: string) {
  await removeServiceFromEvent(eventId, serviceId);
  revalidatePath(`/eventos/${eventId}/editar`);
}
