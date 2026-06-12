"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteInsumoAction } from "./actions";

export function DeleteInsumoButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <ConfirmButton
      title="¿Eliminar este insumo?"
      description="Se borra también su historial de stock."
      confirmLabel="Eliminar"
      destructive
      size="sm"
      onConfirm={async () => {
        const result = await deleteInsumoAction(id);
        if (result.ok) {
          router.push("/insumos");
          router.refresh();
        }
        return result;
      }}
    >
      Eliminar
    </ConfirmButton>
  );
}
