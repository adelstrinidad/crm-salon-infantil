"use server";

import { revalidatePath } from "next/cache";
import { addProviderToEvent, removeProviderFromEvent } from "@/lib/events/eventProviderLines";

export async function addProviderAction(eventId: string, providerId: string) {
  await addProviderToEvent(eventId, providerId);
  revalidatePath(`/eventos/${eventId}/editar`);
}

export async function removeProviderAction(eventId: string, providerId: string) {
  await removeProviderFromEvent(eventId, providerId);
  revalidatePath(`/eventos/${eventId}/editar`);
}
