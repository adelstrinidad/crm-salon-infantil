"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { eventTypeFormSchema, type EventTypeFormInput } from "@/lib/eventTypes/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  onSubmit: (d: EventTypeFormInput) => Promise<{ ok: boolean; error?: string }>;
  defaultValues?: Partial<EventTypeFormInput>;
  submitLabel: string;
};

export function EventTypeForm({ onSubmit, defaultValues, submitLabel }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EventTypeFormInput>({
    resolver: zodResolver(eventTypeFormSchema),
    defaultValues,
  });

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await onSubmit(data);
    if (result.ok) { router.push("/tipos-evento"); router.refresh(); }
    else setServerError(result.error ?? "Error al guardar");
  });

  return (
    <form onSubmit={submit} className="space-y-6 max-w-md">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name")} placeholder="Cumpleaños, Baby shower, etc." />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando…" : submitLabel}</Button>
        <Link href="/tipos-evento" className={cn(buttonVariants({ variant: "outline" }))}>Cancelar</Link>
      </div>
    </form>
  );
}
