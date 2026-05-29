"use server";

import { revalidatePath } from "next/cache";
import { addProviderToEvent, removeProviderFromEvent } from "@/lib/events/eventProviderLines";
import { requireSession } from "@/lib/auth/session";

export async function addProviderAction(eventId: string, providerId: string) {
  await requireSession();
  await addProviderToEvent(eventId, providerId);
  revalidatePath(`/eventos/${eventId}/editar`);
}

export async function removeProviderAction(eventId: string, providerId: string) {
  await requireSession();
  await removeProviderFromEvent(eventId, providerId);
  revalidatePath(`/eventos/${eventId}/editar`);
}
