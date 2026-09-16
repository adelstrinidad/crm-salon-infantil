"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/auth/actions";
import { MAX_PASSWORD_LENGTH, MAX_EMAIL_LENGTH } from "@/lib/auth/schema";

const initialState = { error: undefined };

export function LoginForm() {
  const [state, action, isPending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      return loginAction(formData);
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={MAX_EMAIL_LENGTH}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput
          id="password"
          secretLabel="Contraseña"
          name="password"
          required
          autoComplete="current-password"
          maxLength={MAX_PASSWORD_LENGTH}
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive font-medium">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending} size="lg" className="w-full">
        {isPending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
