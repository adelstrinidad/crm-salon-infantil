"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { changeManagerCodeSchema, type ChangeManagerCodeInput ,
  MIN_MANAGER_CODE_LENGTH,
  MAX_MANAGER_CODE_LENGTH,
} from "@/lib/auth/schema";
import { changeManagerCodeAction, requestManagerCodeResetAction } from "@/lib/auth/actions";

export function CambiarCodigoForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  const form = useForm<ChangeManagerCodeInput>({
    resolver: zodResolver(changeManagerCodeSchema),
    defaultValues: { currentCode: "", code: "", confirmCode: "" },
  });

  const submit = form.handleSubmit(async (data) => {
    setServerError(null);
    setDone(false);
    const result = await changeManagerCodeAction(data);
    if (result.ok) {
      setDone(true);
      form.reset({ currentCode: "", code: "", confirmCode: "" });
    } else {
      setServerError(result.error);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4 max-w-sm" noValidate>
      <div className="space-y-1">
        <Label htmlFor="currentCode">Código actual</Label>
        <PasswordInput
          id="currentCode"
          secretLabel="Código actual"
          autoComplete="off"
          maxLength={MAX_MANAGER_CODE_LENGTH}
          aria-invalid={!!form.formState.errors.currentCode}
          {...form.register("currentCode")}
        />
        {form.formState.errors.currentCode && (
          <p className="text-sm text-destructive">{form.formState.errors.currentCode.message}</p>
        )}
      </div>
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
      {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}
      {done && <p className="text-sm text-foreground font-medium">Código actualizado.</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Guardando…" : "Cambiar código"}
        </Button>
        {/* The escape hatch when the current code is lost: a single-use link to
            the account's email, the same anchor the password recovery uses. */}
        <Button
          type="button"
          variant="outline"
          disabled={sendingLink || linkSent}
          onClick={async () => {
            setServerError(null);
            setSendingLink(true);
            const result = await requestManagerCodeResetAction();
            setSendingLink(false);
            if (result.ok) setLinkSent(true);
            else setServerError(result.error);
          }}
        >
          {sendingLink ? "Enviando…" : "¿Olvidaste el código?"}
        </Button>
      </div>
      {linkSent && (
        <p className="text-sm">
          Te enviamos un enlace al email de la cuenta para elegir un código nuevo. Vence en 1 hora.
        </p>
      )}
    </form>
  );
}
