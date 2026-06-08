"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { movementFormInputSchema, MovementType, MOVEMENT_TYPE_LABELS, type MovementFormInput } from "@/lib/finanzas/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Account = { id: string; name: string };

type Props = {
  onSubmit: (d: MovementFormInput) => Promise<{ ok: boolean; error?: string }>;
  accounts: Account[];
  defaultValues?: Partial<MovementFormInput>;
  submitLabel: string;
  cancelHref?: string;
};

export function MovementForm({ onSubmit, accounts, defaultValues, submitLabel, cancelHref = "/finanzas" }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<MovementFormInput>({
    resolver: zodResolver(movementFormInputSchema),
    defaultValues: {
      type: MovementType.INGRESO,
      amount: "0",
      date: new Date().toISOString().slice(0, 10),
      ...defaultValues,
    },
  });

  const watchType = watch("type");
  const isTransfer = watchType === MovementType.TRANSFERENCIA;

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await onSubmit(data);
    if (result.ok) { router.push(cancelHref); router.refresh(); }
    else setServerError(result.error ?? "Error al guardar");
  });

  return (
    <form onSubmit={submit} className="space-y-6 max-w-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="type">Tipo</Label>
          <div className="w-full">
            <input type="hidden" {...register("type")} />
            <Select
              items={MOVEMENT_TYPE_LABELS}
              value={watchType ?? ""}
              onValueChange={(v) => setValue("type", v as MovementFormInput["type"], { shouldValidate: true })}
            >
              <SelectTrigger className="w-full" aria-label="Tipo">
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(MovementType).map((t) => (
                  <SelectItem key={t} value={t}>{MOVEMENT_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="amount">Monto</Label>
          <Input id="amount" type="number" step="0.01" {...register("amount")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="accountId">Cuenta origen</Label>
          <div className="w-full">
            <input type="hidden" {...register("accountId")} />
            <Select
              items={Object.fromEntries(accounts.map((a) => [a.id, a.name]))}
              value={watch("accountId") ?? ""}
              onValueChange={(v) => setValue("accountId", v as string, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full" aria-label="Cuenta origen">
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {errors.accountId && <p className="text-sm text-destructive">{errors.accountId.message}</p>}
        </div>
        {isTransfer && (
          <div className="space-y-1">
            <Label htmlFor="toAccountId">Cuenta destino</Label>
            <div className="w-full">
              <input type="hidden" {...register("toAccountId")} />
              <Select
                items={Object.fromEntries(accounts.map((a) => [a.id, a.name]))}
                value={watch("toAccountId") ?? ""}
                onValueChange={(v) => setValue("toAccountId", v as string, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full" aria-label="Cuenta destino">
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">Descripción</Label>
          <Input id="description" {...register("description")} placeholder="Opcional" />
        </div>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando…" : submitLabel}</Button>
        <Link href={cancelHref} className={cn(buttonVariants({ variant: "outline" }))}>Cancelar</Link>
      </div>
    </form>
  );
}
