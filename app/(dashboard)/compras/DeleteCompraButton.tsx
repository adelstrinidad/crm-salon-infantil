"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteCompraAction } from "./actions";

type Props = { id: string; redirectTo?: string; size?: "sm" | "xs" };

export function DeleteCompraButton({ id, redirectTo = "/compras", size = "sm" }: Props) {
  const router = useRouter();

  return (
    <ConfirmButton
      title="¿Eliminar esta compra?"
      description="Se revertirá el stock que sumó."
      confirmLabel="Eliminar"
      destructive
      size={size}
      onConfirm={async () => {
        const result = await deleteCompraAction(id);
        if (result.ok) {
          router.push(redirectTo);
          router.refresh();
        }
        return result;
      }}
    >
      Eliminar
    </ConfirmButton>
  );
}
