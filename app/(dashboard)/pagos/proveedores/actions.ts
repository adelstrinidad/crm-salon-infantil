"use server";

import { revalidatePath } from "next/cache";
import { markServicePaid } from "@/lib/pagos/pagosService";
import { createMovement } from "@/lib/finanzas/finanzasService";
import { requireSession } from "@/lib/auth/session";

export async function pagarProveedorAction(
  eventServiceId: string,
  amount: number,
  accountId: string,
  description: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!accountId) return { ok: false, error: "Seleccioná una cuenta" };
  await markServicePaid(eventServiceId);
  await createMovement({
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
