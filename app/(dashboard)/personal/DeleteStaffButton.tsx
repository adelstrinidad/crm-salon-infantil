"use client";

import { Button } from "@/components/ui/button";
import { deleteStaffAction } from "./actions";

export function DeleteStaffButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!window.confirm("¿Eliminar este empleado?")) return;
    await deleteStaffAction(id);
  }
  return (
    <Button onClick={handleDelete} variant="destructive" size="sm">
      Eliminar
    </Button>
  );
}
