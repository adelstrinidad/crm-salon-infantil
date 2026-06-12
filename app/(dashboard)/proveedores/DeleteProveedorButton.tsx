"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteProveedorAction } from "./actions";

export function DeleteProveedorButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <ConfirmButton
      title="¿Eliminar este proveedor?"
      confirmLabel="Eliminar"
      destructive
      size="sm"
      onConfirm={async () => {
        const result = await deleteProveedorAction(id);
        if (result.ok) {
          router.push("/proveedores");
          router.refresh();
        }
        return result;
      }}
    >
      Eliminar
    </ConfirmButton>
  );
}
