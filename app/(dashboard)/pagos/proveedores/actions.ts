"use server";

import { revalidatePath } from "next/cache";
import { payService } from "@/lib/pagos/pagosService";
import { requireSession } from "@/lib/auth/session";

export async function pagarProveedorAction(
  eventServiceId: string,
  amount: number,
  accountId: string,
  description: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!accountId) return { ok: false, error: "Seleccioná una cuenta" };
  await payService(eventServiceId, {
    accountId,
    type: "EGRESO",
    amount,
    description,
    date: new Date(),
    toAccountId: undefined,
    eventId: undefined,
  });
  revalidatePath("/pagos/proveedores");
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
