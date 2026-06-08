"use server";

import { revalidatePath } from "next/cache";
import { staffSchema } from "@/lib/staff/schema";
import type { StaffFormInput } from "@/lib/staff/schema";
import { createStaff, updateStaff, deleteStaff } from "@/lib/staff/staffService";
import { requireSession } from "@/lib/auth/session";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createStaffAction(formInput: StaffFormInput): Promise<ActionResult> {
  await requireSession();
  const parsed = staffSchema.safeParse(formInput);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await createStaff(parsed.data);
  revalidatePath("/personal");
  return { ok: true };
}

export async function updateStaffAction(
  id: string,
  formInput: StaffFormInput
): Promise<ActionResult> {
  await requireSession();
  const parsed = staffSchema.safeParse(formInput);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await updateStaff(id, parsed.data);
  revalidatePath("/personal");
  return { ok: true };
}

export async function deleteStaffAction(id: string): Promise<ActionResult> {
  await requireSession();
  await deleteStaff(id);
  revalidatePath("/personal");
  return { ok: true };
}
