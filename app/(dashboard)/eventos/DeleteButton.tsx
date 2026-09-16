"use client";
// Client Component: the delete needs a themed confirmation before running the
// server action (deleteEventAction revalidates the list — no client redirect).

import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteEventAction } from "./actions";

export function DeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmButton
      // Per-row accessible name so each event's delete button is uniquely
      // addressable (the visible label stays the short "Eliminar").
      aria-label={`Eliminar evento ${name}`}
      title="¿Eliminar este evento?"
      description="Se eliminarán también sus servicios, prestadores y personal asignados. Solo se pueden eliminar eventos sin movimientos financieros (cobros o pagos) y que no estén en curso ni cerrados."
      confirmLabel="Eliminar"
      destructive
      size="sm"
      onConfirm={() => deleteEventAction(id)}
    >
      Eliminar
    </ConfirmButton>
  );
}
