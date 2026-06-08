"use server";

import { revalidatePath } from "next/cache";
import {
  addStaffToEvent,
  removeStaffFromEvent,
  setStaffActualMinutes,
} from "@/lib/events/eventStaffLines";
import { assignmentMinutesSchema } from "@/lib/staff/schema";
import { requireSession } from "@/lib/auth/session";

type ActionResult = { ok: boolean; error?: string };

function revalidateEvent(eventId: string) {
  revalidatePath(`/eventos/${eventId}/editar`);
  revalidatePath(`/eventos/${eventId}`);
}

// Assign a staff member with an estimated number of minutes (multiple of 30).
export async function addStaffAction(
  eventId: string,
  staffId: string,
  estMinutes: number,
): Promise<ActionResult> {
  await requireSession();
  const parsed = assignmentMinutesSchema.safeParse(estMinutes);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await addStaffToEvent(eventId, staffId, parsed.data || null);
  revalidateEvent(eventId);
  return { ok: true };
}

export async function removeStaffAction(eventId: string, staffId: string): Promise<ActionResult> {
  await requireSession();
  await removeStaffFromEvent(eventId, staffId);
  revalidateEvent(eventId);
  return { ok: true };
}

// Log the real hours worked after the event (multiple of 30). Resolves the
// "falta registro de empleados" flag for this assignment.
export async function setStaffActualAction(
  eventId: string,
  staffId: string,
  actualMinutes: number,
): Promise<ActionResult> {
  await requireSession();
  const parsed = assignmentMinutesSchema.safeParse(actualMinutes);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await setStaffActualMinutes(eventId, staffId, parsed.data);
  revalidateEvent(eventId);
  return { ok: true };
}

// Payment lives on the dedicated Pago personal page (/pagos/personal), mirroring
// prestadores/proveedores — see app/(dashboard)/pagos/personal/actions.ts.
