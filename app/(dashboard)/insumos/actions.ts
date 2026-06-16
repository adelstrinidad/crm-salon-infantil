"use server";

import { revalidatePath } from "next/cache";
import { insumoSchema, InsumoFormInput } from "@/lib/insumos/schema";
import { createInsumo, updateInsumo, deleteInsumo } from "@/lib/insumos/insumoService";
import { stockAdjustSchema, type StockAdjustInput } from "@/lib/stock/schema";
import { adjustStock } from "@/lib/stock/stockService";
import { requireSession } from "@/lib/auth/session";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createInsumoAction(data: InsumoFormInput): Promise<ActionResult> {
  await requireSession();
  const parsed = insumoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createInsumo(parsed.data);
  revalidatePath("/insumos");
  return { ok: true };
}

export async function updateInsumoAction(id: string, data: InsumoFormInput): Promise<ActionResult> {
  await requireSession();
  const parsed = insumoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await updateInsumo(id, parsed.data);
  revalidatePath("/insumos");
  return { ok: true };
}

export async function deleteInsumoAction(id: string): Promise<ActionResult> {
  await requireSession();
  await deleteInsumo(id);
  revalidatePath("/insumos");
  return { ok: true };
}

export async function adjustStockAction(data: StockAdjustInput): Promise<ActionResult> {
  await requireSession();
  const parsed = stockAdjustSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await adjustStock(parsed.data);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo ajustar el stock" };
  }
  revalidatePath("/insumos");
  revalidatePath(`/insumos/${data.insumoId}`);
  return { ok: true };
}
