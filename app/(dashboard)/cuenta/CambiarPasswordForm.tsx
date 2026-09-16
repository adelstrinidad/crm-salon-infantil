"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/auth/schema";
import { changePasswordAction } from "@/lib/auth/actions";
import { PasswordFields } from "@/app/recuperar/PasswordFields";

export function CambiarPasswordForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  const submit = form.handleSubmit(async (data) => {
    setServerError(null);
    setDone(false);
    const result = await changePasswordAction(data);
    if (result.ok) {
      setDone(true);
      form.reset({ currentPassword: "", password: "", confirmPassword: "" });
    } else {
      setServerError(result.error);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4 max-w-sm" noValidate>
      <div className="space-y-1">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!form.formState.errors.currentPassword}
          {...form.register("currentPassword")}
        />
        {form.formState.errors.currentPassword && (
          <p className="text-sm text-destructive">
            {form.formState.errors.currentPassword.message}
          </p>
        )}
      </div>
      <PasswordFields register={form.register} errors={form.formState.errors} />
      {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}
      {done && <p className="text-sm text-foreground font-medium">Contraseña actualizada.</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
