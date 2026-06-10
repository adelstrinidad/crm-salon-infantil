"use server";

import { revalidatePath } from "next/cache";
import { settleStaffPayment } from "@/lib/pagos/pagosService";
import { requireSession } from "@/lib/auth/session";

// Pay an internal staff assignment. The amount is computed server-side from the
// REAL hours logged (never trusts the client) — see settleStaffPayment.
export async function pagarPersonalAction(
  eventStaffId: string,
  accountId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!accountId) return { ok: false, error: "Seleccioná una cuenta" };

  const result = await settleStaffPayment(eventStaffId, accountId);
  if (!result.ok) return result;

  revalidatePath("/pagos/personal");
  if (result.eventId) {
    revalidatePath(`/eventos/${result.eventId}`);
    revalidatePath(`/eventos/${result.eventId}/editar`);
  }
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
