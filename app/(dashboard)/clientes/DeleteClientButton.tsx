"use client";

import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteClientAction } from "./actions";

export function DeleteClientButton({ id }: { id: string }) {
  return (
    <ConfirmButton
      title="¿Eliminar este cliente?"
      confirmLabel="Eliminar"
      destructive
      size="sm"
      onConfirm={() => deleteClientAction(id)}
    >
      Eliminar
    </ConfirmButton>
  );
}
