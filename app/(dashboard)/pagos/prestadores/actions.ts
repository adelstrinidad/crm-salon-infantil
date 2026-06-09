"use server";

import { revalidatePath } from "next/cache";
import { payProvider, payService } from "@/lib/pagos/pagosService";
import { requireSession } from "@/lib/auth/session";

export type PaymentSourceKind = "event-provider" | "service";

// Settle a prestador payment. Two sources feed Pago prestadores:
//   - "event-provider": a provider assigned directly to the event (EventProvider)
//   - "service": a service used on the event, backed by a prestador (EventService)
// Each settles its own join row + records the EGRESO movement atomically.
export async function pagarPrestadorAction(
  kind: PaymentSourceKind,
  id: string,
  amount: number,
  accountId: string,
  description: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!accountId) return { ok: false, error: "Seleccioná una cuenta" };
  const movement = {
    accountId,
    type: "EGRESO" as const,
    amount,
    description,
    date: new Date(),
    toAccountId: undefined,
    eventId: undefined,
  };
  if (kind === "service") await payService(id, movement);
  else await payProvider(id, movement);
  revalidatePath("/pagos/prestadores");
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
