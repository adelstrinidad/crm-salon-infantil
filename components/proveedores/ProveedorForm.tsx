"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { proveedorSchema, ProveedorFormValues } from "@/lib/proveedores/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  onSubmit: (data: ProveedorFormValues) => Promise<{ ok: boolean; error?: string }>;
  defaultValues?: Partial<ProveedorFormValues>;
  submitLabel: string;
  cancelHref?: string;
};

export function ProveedorForm({ onSubmit, defaultValues, submitLabel, cancelHref = "/proveedores" }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues,
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

  return (
    <form onSubmit={submit} className="space-y-6 max-w-md">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" {...register("name")} placeholder="Ej: Catering El Rancho" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" {...register("description")} placeholder="Qué proveee…" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" {...register("phone")} placeholder="+54 9 11…" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="hola@proveedor.com" />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
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
