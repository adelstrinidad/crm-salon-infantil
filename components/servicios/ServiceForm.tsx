"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { serviceFormInputSchema, type ServiceFormInput } from "@/lib/services/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

type Proveedor = { id: string; name: string };

type ServiceFormProps = {
  onSubmit: (data: ServiceFormInput) => Promise<{ ok: boolean; error?: string }>;
  defaultValues?: Partial<ServiceFormInput>;
  submitLabel: string;
  proveedores?: Proveedor[];
};

export function ServiceForm({ onSubmit, defaultValues, submitLabel, proveedores = [] }: ServiceFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceFormInputSchema),
    defaultValues: { cost: "0", price: "0", ...defaultValues },
  });

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await onSubmit(data);
    if (result.ok) {
      router.push("/servicios");
      router.refresh();
    } else {
      setServerError(result.error ?? "Error al guardar");
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6 max-w-md">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre del servicio</Label>
        <Input id="name" {...register("name")} placeholder="DJ, Catering, Decoración…" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" {...register("description")} placeholder="Descripción del servicio…" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="cost">Costo (lo que pagás)</Label>
          <Input id="cost" type="number" step="0.01" {...register("cost")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="price">Precio (lo que cobrás)</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} />
        </div>
      </div>

      {proveedores.length > 0 && (
        <div className="space-y-1">
          <Label htmlFor="proveedorId">Proveedor externo</Label>
          <NativeSelect id="proveedorId" {...register("proveedorId")}>
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </NativeSelect>
        </div>
      )}

      {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : submitLabel}
        </Button>
        <Link href="/servicios" className={cn(buttonVariants({ variant: "outline" }))}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
