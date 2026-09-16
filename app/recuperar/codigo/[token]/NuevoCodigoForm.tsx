"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { managerCodeTokenSchema, type ManagerCodeTokenInput ,
  MIN_MANAGER_CODE_LENGTH,
  MAX_MANAGER_CODE_LENGTH,
} from "@/lib/auth/schema";
import { resetManagerCodeWithTokenAction, type ResetResult } from "@/lib/auth/actions";

export function NuevoCodigoForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ManagerCodeTokenInput>({
    resolver: zodResolver(managerCodeTokenSchema),
    defaultValues: { token, code: "", confirmCode: "" },
  });

  const submit = form.handleSubmit(async (data) => {
    setServerError(null);
    const result: ResetResult = await resetManagerCodeWithTokenAction(data);
    if (result.ok) setDone(true);
    else setServerError(result.error);
  });

  if (done) {
    return (
      <div className="space-y-4">
        <p className="text-sm">Listo: el código de encargado fue actualizado.</p>
        <Link href="/cuenta" className="block">
          <Button size="lg" className="w-full">
            Volver a Mi cuenta
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <input type="hidden" {...form.register("token")} />
      <div className="space-y-1">
        <Label htmlFor="code">Código nuevo</Label>
        <PasswordInput
          id="code"
          secretLabel="Código nuevo"
          autoComplete="off"
          maxLength={MAX_MANAGER_CODE_LENGTH}
          aria-invalid={!!form.formState.errors.code}
          {...form.register("code")}
        />
        {form.formState.errors.code ? (
          <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Entre {MIN_MANAGER_CODE_LENGTH} y {MAX_MANAGER_CODE_LENGTH} caracteres
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="confirmCode">Repetir código</Label>
        <PasswordInput
          id="confirmCode"
          secretLabel="Repetir código"
          autoComplete="off"
          maxLength={MAX_MANAGER_CODE_LENGTH}
          aria-invalid={!!form.formState.errors.confirmCode}
          {...form.register("confirmCode")}
        />
        {form.formState.errors.confirmCode && (
          <p className="text-sm text-destructive">{form.formState.errors.confirmCode.message}</p>
        )}
      </div>
      {serverError && (
        <div className="space-y-1">
          <p className="text-sm text-destructive font-medium">{serverError}</p>
          <Link
            href="/cuenta"
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Pedir un enlace nuevo
          </Link>
        </div>
      )}
      <Button type="submit" disabled={form.formState.isSubmitting} size="lg" className="w-full">
        {form.formState.isSubmitting ? "Guardando…" : "Guardar código"}
      </Button>
    </form>
  );
}
