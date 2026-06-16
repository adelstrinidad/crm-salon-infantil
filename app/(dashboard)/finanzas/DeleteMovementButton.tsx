"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { deleteMovementAction } from "./actions";

export function DeleteMovementButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  const router = useRouter();

  return (
    <ConfirmButton
      title="¿Eliminar este movimiento?"
      confirmLabel="Eliminar"
      destructive
      variant="ghost"
      size="xs"
      className="text-destructive hover:underline"
      onConfirm={async () => {
        await deleteMovementAction(id);
        if (redirectTo) {
          router.push(redirectTo);
          router.refresh();
        }
      }}
    >
      Eliminar
    </ConfirmButton>
  );
}
