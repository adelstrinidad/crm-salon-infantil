"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { compraFormInputSchema, type CompraFormInput } from "@/lib/compras/schema";
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
import { Money } from "@/components/ui/money";
import { parsePesosToCents, formatMoney } from "@/lib/money";
import { computeCompraTotal } from "@/lib/compras/calc";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

type Props = {
  onSubmit: (data: CompraFormInput) => Promise<{ ok: boolean; error?: string }>;
  proveedores: Option[];
  insumos: Option[];
  cancelHref?: string;
};

const todayLocal = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export function CompraForm({ onSubmit, proveedores, insumos, cancelHref = "/compras" }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompraFormInput>({
    resolver: zodResolver(compraFormInputSchema),
    defaultValues: {
      proveedorId: "",
      date: todayLocal(),
      notes: "",
      lines: [{ insumoId: "", qty: "1", unitCost: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const watchLines = watch("lines");
  const watchProveedor = watch("proveedorId");

  // Live preview in cents from the raw string inputs.
  const totalCents = computeCompraTotal(
    (watchLines ?? []).map((l) => ({
      qty: Number.parseInt(l.qty || "0", 10) || 0,
      unitCost: parsePesosToCents(l.unitCost),
    })),
  );

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

  return (
    <form onSubmit={submit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="proveedorId">Proveedor *</Label>
          <div className="w-full">
            <input type="hidden" {...register("proveedorId")} />
            <Select
              items={Object.fromEntries(proveedores.map((p) => [p.id, p.name]))}
              value={watchProveedor ?? ""}
              onValueChange={(v) => setValue("proveedorId", v as string, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full" aria-label="Proveedor">
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.proveedorId && <p className="text-sm text-destructive">{errors.proveedorId.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="date">Fecha *</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Insumos comprados *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ insumoId: "", qty: "1", unitCost: "" })}
          >
            <Plus className="size-4" />
            Agregar línea
          </Button>
        </div>

        {errors.lines?.message && <p className="text-sm text-destructive">{errors.lines.message}</p>}

        <div className="space-y-3">
          {fields.map((field, i) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_5rem_8rem_auto] gap-2 sm:items-end rounded-lg border border-border bg-card p-3"
            >
              <div className="space-y-1">
                <Label htmlFor={`lines.${i}.insumoId`} className="text-xs">Insumo</Label>
                <div className="w-full">
                  <input type="hidden" {...register(`lines.${i}.insumoId` as const)} />
                  <Select
                    items={Object.fromEntries(insumos.map((s) => [s.id, s.name]))}
                    value={watch(`lines.${i}.insumoId`) ?? ""}
                    onValueChange={(v) =>
                      setValue(`lines.${i}.insumoId` as const, v as string, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="w-full" aria-label={`Insumo línea ${i + 1}`}>
                      <SelectValue placeholder="Seleccionar…" />
                    </SelectTrigger>
                    <SelectContent>
                      {insumos.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.lines?.[i]?.insumoId && (
                  <p className="text-xs text-destructive">{errors.lines[i]?.insumoId?.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor={`lines.${i}.qty`} className="text-xs">Cantidad</Label>
                <Input
                  id={`lines.${i}.qty`}
                  type="number"
                  min="1"
                  step="1"
                  {...register(`lines.${i}.qty` as const)}
                />
                {errors.lines?.[i]?.qty && (
                  <p className="text-xs text-destructive">{errors.lines[i]?.qty?.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor={`lines.${i}.unitCost`} className="text-xs">Costo unit. ($)</Label>
                <Input
                  id={`lines.${i}.unitCost`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  {...register(`lines.${i}.unitCost` as const)}
                />
                {errors.lines?.[i]?.unitCost && (
                  <p className="text-xs text-destructive">{errors.lines[i]?.unitCost?.message}</p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Quitar línea ${i + 1}`}
                disabled={fields.length === 1}
                onClick={() => remove(i)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 text-sm">
          <span className="text-muted-foreground">Total:</span>
          <Money className="font-semibold">{formatMoney(totalCents)}</Money>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Notas</Label>
        <Input id="notes" {...register("notes")} placeholder="Opcional" />
      </div>

      {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Registrar compra"}
        </Button>
        <Link href={cancelHref} className={cn(buttonVariants({ variant: "outline" }))}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
