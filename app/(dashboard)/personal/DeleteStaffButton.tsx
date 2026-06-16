"use client";

import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteStaffAction } from "./actions";

export function DeleteStaffButton({ id }: { id: string }) {
  return (
    <ConfirmButton
      title="¿Eliminar este empleado?"
      confirmLabel="Eliminar"
      destructive
      size="sm"
      onConfirm={() => deleteStaffAction(id)}
    >
      Eliminar
    </ConfirmButton>
  );
}
