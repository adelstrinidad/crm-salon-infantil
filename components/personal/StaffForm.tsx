"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { staffFormInputSchema, type StaffFormInput } from "@/lib/staff/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StaffFormProps = {
  onSubmit: (data: StaffFormInput) => Promise<{ ok: boolean; error?: string }>;
  defaultValues?: Partial<StaffFormInput>;
  submitLabel: string;
};

export function StaffForm({ onSubmit, defaultValues, submitLabel }: StaffFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormInput>({
    resolver: zodResolver(staffFormInputSchema),
    defaultValues: { hourlyRate: "0", active: true, ...defaultValues },
  });

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await onSubmit(data);
    if (result.ok) {
      router.push("/personal");
      router.refresh();
    } else {
      setServerError(result.error ?? "Error al guardar");
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6 max-w-md">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name")} placeholder="Ana Torres" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="role">Rol</Label>
          <Input id="role" {...register("role")} placeholder="Mozo, Coordinador…" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hourlyRate">Costo por hora</Label>
          <Input id="hourlyRate" type="number" step="0.01" {...register("hourlyRate")} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("active")} className="size-4 rounded border-input" />
        Activo
      </label>

      {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : submitLabel}
        </Button>
        <Link href="/personal" className={cn(buttonVariants({ variant: "outline" }))}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
