"use client";

import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteEventTypeAction } from "./actions";

export function DeleteEventTypeButton({ id }: { id: string }) {
  return (
    <ConfirmButton
      title="¿Eliminar este tipo de evento?"
      confirmLabel="Eliminar"
      destructive
      size="sm"
      onConfirm={() => deleteEventTypeAction(id)}
    >
      Eliminar
    </ConfirmButton>
  );
}
