"use server";

import { revalidatePath } from "next/cache";
import { accountFormInputSchema, movementSchema } from "@/lib/finanzas/schema";
import type { AccountFormInput, MovementFormInput } from "@/lib/finanzas/schema";
import {
  createAccount, updateAccount, deleteAccount,
  createMovement, updateMovement, deleteMovement,
} from "@/lib/finanzas/finanzasService";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createAccountAction(input: AccountFormInput): Promise<ActionResult> {
  const parsed = accountFormInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createAccount(parsed.data);
  revalidatePath("/finanzas");
  return { ok: true };
}

export async function updateAccountAction(id: string, input: AccountFormInput): Promise<ActionResult> {
  const parsed = accountFormInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await updateAccount(id, parsed.data);
  revalidatePath("/finanzas");
  return { ok: true };
}

export async function deleteAccountAction(id: string): Promise<ActionResult> {
  await deleteAccount(id);
  revalidatePath("/finanzas");
  return { ok: true };
}

export async function createMovementAction(input: MovementFormInput): Promise<ActionResult> {
  const parsed = movementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createMovement(parsed.data);
  revalidatePath("/finanzas");
  return { ok: true };
}

export async function updateMovementAction(id: string, input: MovementFormInput): Promise<ActionResult> {
  const parsed = movementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await updateMovement(id, parsed.data);
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}

export async function deleteMovementAction(id: string): Promise<ActionResult> {
  await deleteMovement(id);
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
