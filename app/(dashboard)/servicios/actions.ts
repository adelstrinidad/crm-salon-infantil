"use server";

import { revalidatePath } from "next/cache";
import { serviceSchema } from "@/lib/services/schema";
import type { ServiceFormInput } from "@/lib/services/schema";
import { createService, updateService, deleteService } from "@/lib/services/serviceService";
import { requireSession } from "@/lib/auth/session";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createServiceAction(formInput: ServiceFormInput): Promise<ActionResult> {
  await requireSession();
  const parsed = serviceSchema.safeParse(formInput);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createService(parsed.data);
  revalidatePath("/servicios");
  return { ok: true };
}

export async function updateServiceAction(
  id: string,
  formInput: ServiceFormInput
): Promise<ActionResult> {
  await requireSession();
  const parsed = serviceSchema.safeParse(formInput);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await updateService(id, parsed.data);
  revalidatePath("/servicios");
  return { ok: true };
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  await requireSession();
  await deleteService(id);
  revalidatePath("/servicios");
  return { ok: true };
}
