"use server";

import { revalidatePath } from "next/cache";
import { providerSchema } from "@/lib/providers/schema";
import type { ProviderFormInput } from "@/lib/providers/schema";
import { createProvider, updateProvider, deleteProvider } from "@/lib/providers/providerService";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createProviderAction(formInput: ProviderFormInput): Promise<ActionResult> {
  const parsed = providerSchema.safeParse(formInput);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createProvider(parsed.data);
  revalidatePath("/prestadores");
  return { ok: true };
}

export async function updateProviderAction(
  id: string,
  formInput: ProviderFormInput
): Promise<ActionResult> {
  const parsed = providerSchema.safeParse(formInput);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await updateProvider(id, parsed.data);
  revalidatePath("/prestadores");
  return { ok: true };
}

export async function deleteProviderAction(id: string): Promise<ActionResult> {
  await deleteProvider(id);
  revalidatePath("/prestadores");
  return { ok: true };
}
