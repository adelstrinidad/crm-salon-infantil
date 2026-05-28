"use server";

import { revalidatePath } from "next/cache";
import {
  eventTypeFormSchema,
  type EventTypeFormInput,
  createEventType,
  updateEventType,
  deleteEventType,
} from "@/lib/eventTypes/eventTypeService";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createEventTypeAction(input: EventTypeFormInput): Promise<ActionResult> {
  const parsed = eventTypeFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createEventType(parsed.data);
  revalidatePath("/tipos-evento");
  return { ok: true };
}

export async function updateEventTypeAction(id: string, input: EventTypeFormInput): Promise<ActionResult> {
  const parsed = eventTypeFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await updateEventType(id, parsed.data);
  revalidatePath("/tipos-evento");
  return { ok: true };
}

export async function deleteEventTypeAction(id: string): Promise<ActionResult> {
  await deleteEventType(id);
  revalidatePath("/tipos-evento");
  return { ok: true };
}
