"use client";

import { Button } from "@/components/ui/button";
import { deleteServiceAction } from "./actions";

export function DeleteServiceButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!window.confirm("¿Eliminar este servicio?")) return;
    await deleteServiceAction(id);
  }
  return (
    <Button onClick={handleDelete} variant="destructive" size="sm">
      Eliminar
    </Button>
  );
}
