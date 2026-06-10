"use server";

import { revalidatePath } from "next/cache";
import { payCompra } from "@/lib/compras/compraService";
import { requireSession } from "@/lib/auth/session";

// Settle a supplier purchase: mark the Compra paid and post its EGRESO movement
// atomically (payCompra). The amount is the compra total (cents); the caller
// passes the account to draw from and a description for the movement.
export async function pagarCompraAction(
  compraId: string,
  amount: number,
  accountId: string,
  description: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!accountId) return { ok: false, error: "Seleccioná una cuenta" };
  await payCompra(compraId, {
    accountId,
    type: "EGRESO" as const,
    amount,
    description,
    date: new Date(),
    toAccountId: undefined,
    eventId: undefined,
  });
  revalidatePath("/pagos/proveedores");
  revalidatePath("/compras");
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
