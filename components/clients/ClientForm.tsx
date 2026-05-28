"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { clientFormSchema, type ClientFormInput } from "@/lib/clients/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  onSubmit: (d: ClientFormInput) => Promise<{ ok: boolean; error?: string }>;
  defaultValues?: Partial<ClientFormInput>;
  submitLabel: string;
};

export function ClientForm({ onSubmit, defaultValues, submitLabel }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientFormInput>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await onSubmit(data);
    if (result.ok) { router.push("/clientes"); router.refresh(); }
    else setServerError(result.error ?? "Error al guardar");
  });

  return (
    <form onSubmit={submit} className="space-y-6 max-w-md">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name")} placeholder="María García" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" {...register("phone")} placeholder="+54 11 1234-5678" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="maria@email.com" />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="dni">DNI</Label>
        <Input id="dni" {...register("dni")} placeholder="12.345.678" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" {...register("address")} placeholder="Calle, número, ciudad" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" {...register("notes")} rows={3} placeholder="Observaciones sobre el cliente…" />
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando…" : submitLabel}</Button>
        <Link href="/clientes" className={cn(buttonVariants({ variant: "outline" }))}>Cancelar</Link>
      </div>
    </form>
  );
}
