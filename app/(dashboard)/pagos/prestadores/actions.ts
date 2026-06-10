"use server";

import { revalidatePath } from "next/cache";
import {
  settleProviderPayment,
  settleServicePayment,
} from "@/lib/pagos/pagosService";
import { requireSession } from "@/lib/auth/session";

export type PaymentSourceKind = "event-provider" | "service";

// Settle a prestador payment. Two sources feed Pago prestadores:
//   - "event-provider": a provider assigned directly to the event (EventProvider)
//   - "service": a service used on the event, backed by a prestador (EventService)
// The amount and description are computed server-side from the line itself
// (never trusted from the client); each settles its own join row + records the
// EGRESO movement atomically.
export async function pagarPrestadorAction(
  kind: PaymentSourceKind,
  id: string,
  accountId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!accountId) return { ok: false, error: "Seleccioná una cuenta" };

  const result =
    kind === "service"
      ? await settleServicePayment(id, accountId)
      : await settleProviderPayment(id, accountId);
  if (!result.ok) return result;

  revalidatePath("/pagos/prestadores");
  if (result.eventId) {
    revalidatePath(`/eventos/${result.eventId}`);
    revalidatePath(`/eventos/${result.eventId}/editar`);
  }
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
