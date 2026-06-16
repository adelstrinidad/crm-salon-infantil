"use client";
// Client Component: the delete needs a themed confirmation before running the
// server action (deleteEventAction revalidates the list — no client redirect).

import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteEventAction } from "./actions";

export function DeleteButton({ id }: { id: string }) {
  return (
    <ConfirmButton
      title="¿Eliminar este evento?"
      description="Se eliminarán también sus servicios, prestadores y personal asignados."
      confirmLabel="Eliminar"
      destructive
      size="sm"
      onConfirm={() => deleteEventAction(id)}
    >
      Eliminar
    </ConfirmButton>
  );
}
