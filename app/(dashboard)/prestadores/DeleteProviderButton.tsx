"use client";

import { Button } from "@/components/ui/button";
import { deleteProviderAction } from "./actions";

export function DeleteProviderButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!window.confirm("¿Eliminar este prestador?")) return;
    await deleteProviderAction(id);
  }
  return (
    <Button onClick={handleDelete} variant="destructive" size="sm">
      Eliminar
    </Button>
  );
}
