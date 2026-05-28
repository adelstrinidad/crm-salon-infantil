"use server";

import { revalidatePath } from "next/cache";
import { createMovement } from "@/lib/finanzas/finanzasService";

export async function registrarCobroAction(
  eventId: string,
  data: {
    accountId: string;
    amount: number;
    description: string;
    date: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  if (!data.accountId) return { ok: false, error: "Seleccioná una cuenta" };
  if (!data.amount || data.amount <= 0) return { ok: false, error: "Ingresá un importe válido" };

  await createMovement({
    accountId: data.accountId,
    type: "INGRESO",
    amount: data.amount,
    description: data.description || undefined,
    date: new Date(data.date),
    toAccountId: undefined,
    eventId,
  });

  revalidatePath(`/eventos/${eventId}`);
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
