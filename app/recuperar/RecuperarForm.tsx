"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  managerCodeResetSchema,
  requestResetSchema,
  type ManagerCodeResetInput,
  type RequestResetInput,
} from "@/lib/auth/schema";
import { resetWithManagerCodeAction, requestPasswordResetAction } from "@/lib/auth/actions";
import { PasswordFields } from "./PasswordFields";

type Mode = "codigo" | "email";

// Two recovery routes on one screen: the manager approval code (works with no
// email configured, for someone standing at the venue) and an emailed link.
// Both validate on the client with the same Zod schema the Server Action uses,
// so a mismatched password never costs a round trip.
export function RecuperarForm() {
  const [mode, setMode] = useState<Mode>("codigo");
  const [codeDone, setCodeDone] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const codeForm = useForm<ManagerCodeResetInput>({
    resolver: zodResolver(managerCodeResetSchema),
    defaultValues: { managerCode: "", password: "", confirmPassword: "" },
  });

  const mailForm = useForm<RequestResetInput>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  const submitCode = codeForm.handleSubmit(async (data) => {
    setServerError(null);
    const result = await resetWithManagerCodeAction(data);
    if (result.ok) setCodeDone(true);
    else setServerError(result.error);
  });

  const submitMail = mailForm.handleSubmit(async (data) => {
    setServerError(null);
    const result = await requestPasswordResetAction(data);
    if (result.ok) setMailSent(true);
    else setServerError(result.error);
  });

  const switchMode = (next: Mode) => {
    setServerError(null);
    setMode(next);
  };

  if (codeDone) {
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
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Método de recuperación"
        className="flex gap-1 rounded-md bg-muted p-1"
      >
        <TabButton active={mode === "codigo"} onClick={() => switchMode("codigo")}>
          Código de encargado
        </TabButton>
        <TabButton active={mode === "email"} onClick={() => switchMode("email")}>
          Enlace por email
        </TabButton>
      </div>

      {mode === "codigo" ? (
        <form onSubmit={submitCode} className="space-y-4" noValidate>
          <p className="text-sm text-muted-foreground">
            Ingresá el código de encargado y elegí una contraseña nueva.
          </p>
          <div className="space-y-1">
            <Label htmlFor="managerCode">Código de encargado</Label>
            <Input
              id="managerCode"
              type="password"
              autoComplete="off"
              aria-invalid={!!codeForm.formState.errors.managerCode}
              {...codeForm.register("managerCode")}
            />
            {codeForm.formState.errors.managerCode && (
              <p className="text-sm text-destructive">
                {codeForm.formState.errors.managerCode.message}
              </p>
            )}
          </div>
          <PasswordFields register={codeForm.register} errors={codeForm.formState.errors} />
          {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}
          <Button type="submit" disabled={codeForm.formState.isSubmitting} size="lg" className="w-full">
            {codeForm.formState.isSubmitting ? "Guardando…" : "Cambiar contraseña"}
          </Button>
        </form>
      ) : mailSent ? (
        <p className="text-sm">
          Si ese email corresponde a una cuenta, te enviamos un enlace para restablecer la
          contraseña. Vence en 1 hora.
        </p>
      ) : (
        <form onSubmit={submitMail} className="space-y-4" noValidate>
          <p className="text-sm text-muted-foreground">
            Te enviamos un enlace de un solo uso al email de la cuenta.
          </p>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!mailForm.formState.errors.email}
              {...mailForm.register("email")}
            />
            {mailForm.formState.errors.email && (
              <p className="text-sm text-destructive">{mailForm.formState.errors.email.message}</p>
            )}
          </div>
          {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}
          <Button type="submit" disabled={mailForm.formState.isSubmitting} size="lg" className="w-full">
            {mailForm.formState.isSubmitting ? "Enviando…" : "Enviar enlace"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm">
        <Link href="/login" className="text-muted-foreground underline hover:text-foreground">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex-1 rounded px-3 py-1.5 text-sm transition-colors",
        active ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
