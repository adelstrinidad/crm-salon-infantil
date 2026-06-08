"use server";

import { revalidatePath } from "next/cache";
import {
  addProviderToEvent,
  removeProviderFromEvent,
  setProviderCost,
} from "@/lib/events/eventProviderLines";
import { requireSession } from "@/lib/auth/session";

type ActionResult = { ok: boolean; error?: string };

function revalidateEvent(eventId: string) {
  revalidatePath(`/eventos/${eventId}/editar`);
  revalidatePath(`/eventos/${eventId}`);
}

// A per-event cost in cents: always an explicit non-negative integer (never null).
function validateCost(cost: number): string | null {
  if (!Number.isInteger(cost) || cost < 0) return "El costo debe ser un monto válido (≥ 0)";
  return null;
}

// `cost` omitted → snapshot the provider's catalog cost; otherwise use the value
// (0 included). Never stores null.
export async function addProviderAction(
  eventId: string,
  providerId: string,
  cost?: number,
): Promise<ActionResult> {
  await requireSession();
  if (cost !== undefined) {
    const err = validateCost(cost);
    if (err) return { ok: false, error: err };
  }
  await addProviderToEvent(eventId, providerId, cost);
  revalidateEvent(eventId);
  return { ok: true };
}

// Update the explicit per-event cost of an already-attached provider.
export async function setProviderCostAction(
  eventId: string,
  providerId: string,
  cost: number,
): Promise<ActionResult> {
  await requireSession();
  const err = validateCost(cost);
  if (err) return { ok: false, error: err };
  await setProviderCost(eventId, providerId, cost);
  revalidateEvent(eventId);
  return { ok: true };
}

export async function removeProviderAction(eventId: string, providerId: string): Promise<ActionResult> {
  await requireSession();
  await removeProviderFromEvent(eventId, providerId);
  revalidateEvent(eventId);
  return { ok: true };
}
