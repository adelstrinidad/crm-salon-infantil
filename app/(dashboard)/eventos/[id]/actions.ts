"use server";

import { revalidatePath } from "next/cache";
import { registrarCobro } from "@/lib/events/eventService";
import { cobroSchema, type CobroInput } from "@/lib/events/schema";
import { requireSession } from "@/lib/auth/session";

export async function registrarCobroAction(
  eventId: string,
  data: CobroInput
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();

  const parsed = cobroSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await registrarCobro(eventId, parsed.data);

  revalidatePath(`/eventos/${eventId}`);
  revalidatePath("/eventos");
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
