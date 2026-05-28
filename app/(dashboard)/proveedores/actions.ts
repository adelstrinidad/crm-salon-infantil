"use server";

import { revalidatePath } from "next/cache";
import { proveedorSchema, ProveedorFormValues } from "@/lib/proveedores/schema";
import { createProveedor, updateProveedor, deleteProveedor } from "@/lib/proveedores/proveedorService";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createProveedorAction(data: ProveedorFormValues): Promise<ActionResult> {
  const parsed = proveedorSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createProveedor(parsed.data);
  revalidatePath("/proveedores");
  return { ok: true };
}

export async function updateProveedorAction(id: string, data: ProveedorFormValues): Promise<ActionResult> {
  const parsed = proveedorSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await updateProveedor(id, parsed.data);
  revalidatePath("/proveedores");
  return { ok: true };
}

export async function deleteProveedorAction(id: string): Promise<ActionResult> {
  await deleteProveedor(id);
  revalidatePath("/proveedores");
  return { ok: true };
}
