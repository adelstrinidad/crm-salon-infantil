"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "./session";

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return { error: "Credenciales incorrectas" };
  }

  await createSession();
  redirect("/eventos");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
