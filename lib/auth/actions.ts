"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "./session";
import { verifyPassword } from "./password";

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const emailOk = email === process.env.ADMIN_EMAIL;
  // Always run the hash verification (even on a wrong email) so response time
  // does not reveal whether the email matched.
  const passwordOk = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);

  if (!emailOk || !passwordOk) {
    return { error: "Credenciales incorrectas" };
  }

  await createSession();
  redirect("/eventos");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
