"use server";

import { revalidatePath } from "next/cache";
import { compraSchema, type CompraFormInput } from "@/lib/compras/schema";
import { createCompra, deleteCompra } from "@/lib/compras/compraService";
import { requireSession } from "@/lib/auth/session";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCompraAction(data: CompraFormInput): Promise<ActionResult> {
  await requireSession();
  const parsed = compraSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createCompra(parsed.data);
  revalidatePath("/compras");
  revalidatePath("/insumos"); // stock changed
  return { ok: true };
}

export async function deleteCompraAction(id: string): Promise<ActionResult> {
  await requireSession();
  try {
    await deleteCompra(id);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo eliminar" };
  }
  revalidatePath("/compras");
  revalidatePath("/insumos"); // stock reversed
  return { ok: true };
}
