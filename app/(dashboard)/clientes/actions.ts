"use server";

import { revalidatePath } from "next/cache";
import { clientFormSchema, type ClientFormInput } from "@/lib/clients/schema";
import { createClient, updateClient, deleteClient } from "@/lib/clients/clientService";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createClientAction(input: ClientFormInput): Promise<ActionResult> {
  const parsed = clientFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createClient(parsed.data);
  revalidatePath("/clientes");
  return { ok: true };
}

export async function quickCreateClientAction(
  input: ClientFormInput,
): Promise<{ ok: true; client: { id: string; name: string } } | { ok: false; error: string }> {
  const parsed = clientFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const client = await createClient(parsed.data);
  revalidatePath("/clientes");
  return { ok: true, client: { id: client.id, name: client.name } };
}

export async function updateClientAction(id: string, input: ClientFormInput): Promise<ActionResult> {
  const parsed = clientFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await updateClient(id, parsed.data);
  revalidatePath("/clientes");
  return { ok: true };
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  await deleteClient(id);
  revalidatePath("/clientes");
  return { ok: true };
}
