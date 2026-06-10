"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  insumoSchema,
  InsumoFormValues,
  INSUMO_UNIT_LABELS,
  INSUMO_UNITS,
} from "@/lib/insumos/schema";
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

type Props = {
  onSubmit: (data: InsumoFormValues) => Promise<{ ok: boolean; error?: string }>;
  defaultValues?: Partial<InsumoFormValues>;
  submitLabel: string;
  cancelHref?: string;
};

export function InsumoForm({ onSubmit, defaultValues, submitLabel, cancelHref = "/insumos" }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InsumoFormValues>({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      unit: "unidad",
      stockQty: 0,
      minStock: 0,
      ...defaultValues,
    },
  });

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await onSubmit(data);
    if (result.ok) {
      router.push(cancelHref);
      router.refresh();
    } else {
      setServerError(result.error ?? "Error al guardar");
    }
  });

  const watchUnit = watch("unit");

  return (
    <form onSubmit={submit} className="space-y-6 max-w-md">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" {...register("name")} placeholder="Ej: Gaseosa 2L" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="unit">Unidad</Label>
          <div className="w-full">
            <input type="hidden" {...register("unit")} />
            <Select
              items={INSUMO_UNIT_LABELS}
              value={watchUnit ?? ""}
              onValueChange={(v) => setValue("unit", v as InsumoFormValues["unit"], { shouldValidate: true })}
            >
              <SelectTrigger className="w-full" aria-label="Unidad">
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {INSUMO_UNITS.map((u) => (
                  <SelectItem key={u} value={u}>{INSUMO_UNIT_LABELS[u]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="stockQty">Stock actual</Label>
          <Input id="stockQty" type="number" min="0" step="1" {...register("stockQty", { valueAsNumber: true })} />
          {errors.stockQty && <p className="text-sm text-destructive">{errors.stockQty.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="minStock">Stock mínimo</Label>
          <Input id="minStock" type="number" min="0" step="1" {...register("minStock", { valueAsNumber: true })} />
          {errors.minStock && <p className="text-sm text-destructive">{errors.minStock.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Notas</Label>
        <Input id="notes" {...register("notes")} placeholder="Opcional" />
      </div>

      {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : submitLabel}
        </Button>
        <Link href={cancelHref} className={cn(buttonVariants({ variant: "outline" }))}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
