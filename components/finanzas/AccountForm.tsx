"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { accountFormInputSchema, type AccountFormInput } from "@/lib/finanzas/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  onSubmit: (d: AccountFormInput) => Promise<{ ok: boolean; error?: string }>;
  defaultValues?: Partial<AccountFormInput>;
  submitLabel: string;
};

export function AccountForm({ onSubmit, defaultValues, submitLabel }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AccountFormInput>({
    resolver: zodResolver(accountFormInputSchema),
    defaultValues,
  });

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await onSubmit(data);
    if (result.ok) { router.push("/finanzas"); router.refresh(); }
    else setServerError(result.error ?? "Error al guardar");
  });

  return (
    <form onSubmit={submit} className="space-y-6 max-w-md">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre de la cuenta</Label>
        <Input id="name" {...register("name")} placeholder="Caja, Banco, etc." />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" {...register("description")} placeholder="Opcional" />
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando…" : submitLabel}</Button>
        <Link href="/finanzas" className={cn(buttonVariants({ variant: "outline" }))}>Cancelar</Link>
      </div>
    </form>
  );
}
