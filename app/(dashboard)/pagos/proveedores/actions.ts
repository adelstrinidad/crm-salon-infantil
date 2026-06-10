"use server";

import { revalidatePath } from "next/cache";
import { settleCompraPayment } from "@/lib/compras/compraService";
import { requireSession } from "@/lib/auth/session";

// Settle a supplier purchase: mark the Compra paid and post its EGRESO movement
// atomically. The amount and description are computed server-side from the
// compra itself (never trusted from the client).
export async function pagarCompraAction(
  compraId: string,
  accountId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!accountId) return { ok: false, error: "Seleccioná una cuenta" };

  const result = await settleCompraPayment(compraId, accountId);
  if (!result.ok) return result;

  revalidatePath("/pagos/proveedores");
  revalidatePath("/compras");
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
