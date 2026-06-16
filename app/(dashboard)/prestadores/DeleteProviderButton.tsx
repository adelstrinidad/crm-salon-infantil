"use client";

import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteProviderAction } from "./actions";

export function DeleteProviderButton({ id }: { id: string }) {
  return (
    <ConfirmButton
      title="¿Eliminar este prestador?"
      confirmLabel="Eliminar"
      destructive
      size="sm"
      onConfirm={() => deleteProviderAction(id)}
    >
      Eliminar
    </ConfirmButton>
  );
}
