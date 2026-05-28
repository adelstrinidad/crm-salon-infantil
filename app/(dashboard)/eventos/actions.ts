"use server";
// Server Actions are the trust boundary: always validate here, even if the form already validated.
// The action receives raw form input (strings) and parses it through eventSchema (strings → Dates).

import { revalidatePath } from "next/cache";
import { eventSchema } from "@/lib/events/schema";
import type { EventFormInput } from "@/lib/events/schema";
import { createEvent, updateEvent, deleteEvent } from "@/lib/events/eventService";
import { addServiceToEvent } from "@/lib/events/eventServiceLines";
import { addProviderToEvent } from "@/lib/events/eventProviderLines";

type EventLines = { services: { serviceId: string; qty: number }[]; providerIds: string[] };
type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

export async function createEventAction(
  formInput: EventFormInput,
  lines?: EventLines
): Promise<ActionResult> {
  const parsed = eventSchema.safeParse(formInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const event = await createEvent(parsed.data);
  if (lines?.services?.length) {
    await Promise.all(lines.services.map((l) => addServiceToEvent(event.id, l.serviceId, l.qty)));
  }
  if (lines?.providerIds?.length) {
    await Promise.all(lines.providerIds.map((pid) => addProviderToEvent(event.id, pid)));
  }
  revalidatePath("/eventos");
  return { ok: true, id: event.id };
}

export async function updateEventAction(
  id: string,
  formInput: EventFormInput
): Promise<ActionResult> {
  const parsed = eventSchema.safeParse(formInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  await updateEvent(id, parsed.data);
  revalidatePath("/eventos");
  return { ok: true };
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  await deleteEvent(id);
  revalidatePath("/eventos");
  return { ok: true };
}
