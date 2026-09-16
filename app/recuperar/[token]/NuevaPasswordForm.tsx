"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { tokenResetSchema, type TokenResetInput } from "@/lib/auth/schema";
import { resetWithTokenAction } from "@/lib/auth/actions";
import { PasswordFields } from "../PasswordFields";

// The link is single use, so the password is validated on the client first: a
// typo or a mismatch must never reach the Server Action, which would otherwise
// be the user's one shot at this token.
export function NuevaPasswordForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<TokenResetInput>({
    resolver: zodResolver(tokenResetSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const submit = form.handleSubmit(async (data) => {
    setServerError(null);
    const result = await resetWithTokenAction(data);
    if (result.ok) setDone(true);
    else setServerError(result.error);
  });

  if (done) {
    return (
      <div className="space-y-4">
        <p className="text-sm">Listo: tu contraseña fue actualizada.</p>
        <Link href="/login" className="block">
          <Button size="lg" className="w-full">
            Ir a iniciar sesión
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <input type="hidden" {...form.register("token")} />
      <PasswordFields register={form.register} errors={form.formState.errors} />
      {serverError && (
        <div className="space-y-1">
          <p className="text-sm text-destructive font-medium">{serverError}</p>
          <Link
            href="/recuperar"
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Pedir un enlace nuevo
          </Link>
        </div>
      )}
      <Button type="submit" disabled={form.formState.isSubmitting} size="lg" className="w-full">
        {form.formState.isSubmitting ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
