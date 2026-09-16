"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// The "new password" + confirmation pair, shared by every screen that sets a
// password. Errors come from the client-side Zod validation, so a typo never
// reaches the server (which matters most on the emailed link: it is single use).
type PasswordShape = { password: string; confirmPassword: string };

export function PasswordFields<T extends PasswordShape>({
  register,
  errors,
}: {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}) {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password" as never)}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{String(errors.password.message)}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Repetir contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword" as never)}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{String(errors.confirmPassword.message)}</p>
        )}
      </div>
    </>
  );
}
