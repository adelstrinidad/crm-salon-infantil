"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientFormSchema, type ClientFormInput } from "@/lib/clients/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CreateClientResult =
  | { ok: true; client: { id: string; name: string } }
  | { ok: false; error: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (client: { id: string; name: string }) => void;
  createClient: (data: ClientFormInput) => Promise<CreateClientResult>;
};

export function AddClientModal({ open, onClose, onCreated, createClient }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormInput>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { name: "", dni: "", phone: "", email: "", address: "", notes: "" },
  });

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await createClient(data);
    if (result.ok) {
      onCreated(result.client);
      reset();
    } else {
      setServerError(result.error ?? "Error al crear cliente");
    }
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <Label htmlFor="ac-name">Nombre completo *</Label>
              <Input id="ac-name" {...register("name")} placeholder="Nombre y apellido" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="ac-phone">Teléfono</Label>
              <Input id="ac-phone" {...register("phone")} placeholder="11 1234-5678" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ac-email">Correo electrónico</Label>
              <Input id="ac-email" type="email" {...register("email")} placeholder="correo@ejemplo.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="ac-dni">DNI</Label>
              <Input id="ac-dni" {...register("dni")} placeholder="12.345.678" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="ac-address">Dirección</Label>
            <Input id="ac-address" {...register("address")} placeholder="Calle, número, ciudad" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ac-notes">Notas</Label>
            <Textarea id="ac-notes" {...register("notes")} rows={3} placeholder="Información adicional del cliente…" />
          </div>

          {serverError && <p className="text-sm text-destructive font-medium">{serverError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando…" : "Agregar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
