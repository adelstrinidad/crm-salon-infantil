"use server";

import { revalidatePath } from "next/cache";
import {
  reverseProviderPayment,
  reverseServicePayment,
  reverseStaffPayment,
  type ReversalInput,
} from "@/lib/pagos/pagosService";
import { reverseCompraPayment } from "@/lib/compras/compraService";
import { reversalSchema } from "@/lib/pagos/schema";
import { verifyManagerCode } from "@/lib/auth/managerCode";
import { requireSession } from "@/lib/auth/session";

// Reverse a settled payment ("Anular pago") for any of the four payable kinds.
// Sensitive (moves money), so it is gated by the manager code — verified here at
// the boundary, like the consumos void. The amount is read server-side from the
// original movement; the client only supplies which line, the code and a reason.
export async function anularPagoAction(input: {
  kind: string;
  id: string;
  managerCode: string;
  reason: string;
  reasonText?: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireSession();

  const parsed = reversalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { kind, id, managerCode, reason, reasonText } = parsed.data;

  const approval = await verifyManagerCode(managerCode);
  if (!approval.ok) return { ok: false, error: approval.error };

  const reversal: ReversalInput = { reason, reasonText };

  if (kind === "compra") {
    const result = await reverseCompraPayment(id, reversal);
    if (!result.ok) return result;
    revalidatePath("/pagos/proveedores");
    revalidatePath("/compras");
    revalidatePath("/finanzas");
    revalidatePath("/finanzas/movimientos");
    return { ok: true };
  }

  const result =
    kind === "service"
      ? await reverseServicePayment(id, reversal)
      : kind === "staff"
        ? await reverseStaffPayment(id, reversal)
        : await reverseProviderPayment(id, reversal);
  if (!result.ok) return result;

  revalidatePath(kind === "staff" ? "/pagos/personal" : "/pagos/prestadores");
  if (result.eventId) {
    revalidatePath(`/eventos/${result.eventId}`);
    revalidatePath(`/eventos/${result.eventId}/editar`);
  }
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
