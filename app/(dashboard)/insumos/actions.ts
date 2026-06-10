"use server";

import { revalidatePath } from "next/cache";
import { insumoSchema, InsumoFormValues } from "@/lib/insumos/schema";
import { createInsumo, updateInsumo, deleteInsumo } from "@/lib/insumos/insumoService";
import { requireSession } from "@/lib/auth/session";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createInsumoAction(data: InsumoFormValues): Promise<ActionResult> {
  await requireSession();
  const parsed = insumoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createInsumo(parsed.data);
  revalidatePath("/insumos");
  return { ok: true };
}

export async function updateInsumoAction(id: string, data: InsumoFormValues): Promise<ActionResult> {
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
