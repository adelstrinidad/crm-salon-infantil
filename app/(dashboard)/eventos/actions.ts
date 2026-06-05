"use server";
// Server Actions are the trust boundary: always validate here, even if the form already validated.
// The action receives raw form input (strings) and parses it through eventSchema (strings → Dates).

import { revalidatePath } from "next/cache";
import { eventSchema } from "@/lib/events/schema";
import type { EventFormInput } from "@/lib/events/schema";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  rescheduleEvent,
  findBlockingOverlap,
  isBlockingState,
} from "@/lib/events/eventService";
import { addServiceToEvent } from "@/lib/events/eventServiceLines";
import { addProviderToEvent } from "@/lib/events/eventProviderLines";
import { requireSession } from "@/lib/auth/session";

type EventLines = { services: { serviceId: string; qty: number }[]; providerIds: string[] };
type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

// Hard double-booking guard: a confirmed booking cannot overlap another.
// Returns an error string when blocked, or null when the slot is free.
// Quotes (Presupuestado) and suspended events are exempt (see BLOCKING_STATES).
async function doubleBookingError(
  state: EventFormInput["state"],
  startAt: Date,
  endAt: Date,
  excludeId?: string,
): Promise<string | null> {
  if (!isBlockingState(state)) return null;
  const conflict = await findBlockingOverlap(startAt, endAt, excludeId);
  if (!conflict) return null;
  const when = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(conflict.startAt);
  return `Doble reserva: el horario se superpone con "${conflict.name}" (${when}). Elegí otro horario o suspendé el evento existente.`;
}

export async function createEventAction(
  formInput: EventFormInput,
  lines?: EventLines
): Promise<ActionResult> {
  await requireSession();
  const parsed = eventSchema.safeParse(formInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const conflict = await doubleBookingError(parsed.data.state, parsed.data.startAt, parsed.data.endAt);
  if (conflict) return { ok: false, error: conflict };
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
  await requireSession();
  const parsed = eventSchema.safeParse(formInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const conflict = await doubleBookingError(parsed.data.state, parsed.data.startAt, parsed.data.endAt, id);
  if (conflict) return { ok: false, error: conflict };
  await updateEvent(id, parsed.data);
  revalidatePath("/eventos");
  return { ok: true };
}

// Reschedule from the calendar (drag-and-drop). Times arrive as epoch ms.
export async function rescheduleEventAction(
  id: string,
  startMs: number,
  endMs: number,
): Promise<ActionResult> {
  await requireSession();
  const startAt = new Date(startMs);
  const endAt = new Date(endMs);
  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime()) || endAt <= startAt) {
    return { ok: false, error: "Rango de fechas inválido" };
  }
  await rescheduleEvent(id, startAt, endAt);
  revalidatePath("/calendario");
  revalidatePath("/eventos");
  return { ok: true };
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  await requireSession();
  await deleteEvent(id);
  revalidatePath("/eventos");
  return { ok: true };
}
