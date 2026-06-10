"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { stockAdjustInputSchema, type StockAdjustInput } from "@/lib/stock/schema";
import { STOCK_ADJUST_OPS, STOCK_ADJUST_OP_KEYS } from "@/lib/stock/kinds";
import { adjustStockAction } from "@/app/(dashboard)/insumos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OP_LABELS = Object.fromEntries(
  STOCK_ADJUST_OP_KEYS.map((k) => [k, STOCK_ADJUST_OPS[k].label]),
);

export function AdjustStockForm({ insumoId }: { insumoId: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StockAdjustInput>({
    resolver: zodResolver(stockAdjustInputSchema),
    defaultValues: { insumoId, op: "consumo", qty: "1", reason: "" },
  });

  const watchOp = watch("op");

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await adjustStockAction(data);
    if (result.ok) {
      reset({ insumoId, op: data.op, qty: "1", reason: "" });
      router.refresh();
    } else {
      setServerError(result.error);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <input type="hidden" {...register("insumoId")} />
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_6rem] gap-3">
        <div className="space-y-1">
          <Label htmlFor="op">Tipo</Label>
          <div className="w-full">
            <input type="hidden" {...register("op")} />
            <Select
              items={OP_LABELS}
              value={watchOp ?? ""}
              onValueChange={(v) => setValue("op", v as StockAdjustInput["op"], { shouldValidate: true })}
            >
              <SelectTrigger className="w-full" aria-label="Tipo de ajuste">
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {STOCK_ADJUST_OP_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>{STOCK_ADJUST_OPS[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="qty">Cantidad</Label>
          <Input id="qty" type="number" min="1" step="1" {...register("qty")} />
          {errors.qty && <p className="text-xs text-destructive">{errors.qty.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="reason">Motivo</Label>
        <Input id="reason" {...register("reason")} placeholder="Opcional — ej: fiesta sábado" />
      </div>
      {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Aplicando…" : "Aplicar ajuste"}
      </Button>
    </form>
  );
}
