"use client";

import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteServiceAction } from "./actions";

export function DeleteServiceButton({ id }: { id: string }) {
  return (
    <ConfirmButton
      title="¿Eliminar este servicio?"
      confirmLabel="Eliminar"
      destructive
      size="sm"
      onConfirm={() => deleteServiceAction(id)}
    >
      Eliminar
    </ConfirmButton>
  );
}
