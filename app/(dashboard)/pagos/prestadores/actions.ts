"use server";

import { revalidatePath } from "next/cache";
import { markProviderPaid } from "@/lib/pagos/pagosService";
import { createMovement } from "@/lib/finanzas/finanzasService";

export async function pagarPrestadorAction(
  eventProviderId: string,
  amount: number,
  accountId: string,
  description: string
): Promise<{ ok: boolean; error?: string }> {
  if (!accountId) return { ok: false, error: "Seleccioná una cuenta" };
  await markProviderPaid(eventProviderId);
  await createMovement({
    accountId,
    type: "EGRESO",
    amount,
    description,
    date: new Date(),
    toAccountId: undefined,
    eventId: undefined,
  });
  revalidatePath("/pagos/prestadores");
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
