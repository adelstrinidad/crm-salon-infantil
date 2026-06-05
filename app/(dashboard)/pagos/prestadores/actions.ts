"use server";

import { revalidatePath } from "next/cache";
import { payProvider } from "@/lib/pagos/pagosService";
import { requireSession } from "@/lib/auth/session";

export async function pagarPrestadorAction(
  eventProviderId: string,
  amount: number,
  accountId: string,
  description: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!accountId) return { ok: false, error: "Seleccioná una cuenta" };
  await payProvider(eventProviderId, {
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
