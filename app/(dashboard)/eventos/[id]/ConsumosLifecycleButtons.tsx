"use client";

import { useState } from "react";
import { Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { startConsumosAction, closeConsumosAction } from "./consumos-actions";

// "Iniciar evento": flips a confirmed booking to EN_CURSO and opens the
// consumption-capture window.
export function IniciarEventoButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await startConsumosAction(eventId);
    setLoading(false);
    if (!result.ok) setError(result.error);
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button onClick={handle} disabled={loading}>
        <Play className="size-4" />
        {loading ? "Iniciando…" : "Iniciar evento"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// "Cerrar consumos": freezes the bill — no more lines after this, so confirm.
export function CerrarConsumosButton({ eventId }: { eventId: string }) {
  return (
    <ConfirmButton
      title="¿Cerrar los consumos?"
      description="No se podrán agregar ni quitar líneas."
      confirmLabel="Sí, cerrar"
      variant="outline"
      onConfirm={() => closeConsumosAction(eventId)}
    >
      <Lock className="size-4" />
      Cerrar consumos
    </ConfirmButton>
  );
}
