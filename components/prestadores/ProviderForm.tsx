"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { providerFormInputSchema, type ProviderFormInput } from "@/lib/providers/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ProviderFormProps = {
  onSubmit: (data: ProviderFormInput) => Promise<{ ok: boolean; error?: string }>;
  defaultValues?: Partial<ProviderFormInput>;
  submitLabel: string;
};

export function ProviderForm({ onSubmit, defaultValues, submitLabel }: ProviderFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProviderFormInput>({
    resolver: zodResolver(providerFormInputSchema),
    defaultValues: { cost: "0", ...defaultValues },
  });

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await onSubmit(data);
    if (result.ok) {
      router.push("/prestadores");
      router.refresh();
    } else {
      setServerError(result.error ?? "Error al guardar");
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6 max-w-md">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name")} placeholder="Juan Pérez" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="role">Rol</Label>
          <Input id="role" {...register("role")} placeholder="DJ, Fotógrafo…" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cost">Costo por evento</Label>
          <Input id="cost" type="number" step="0.01" {...register("cost")} />
        </div>
      </div>

      {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : submitLabel}
        </Button>
        <Link href="/prestadores" className={cn(buttonVariants({ variant: "outline" }))}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
