"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteServiceAction } from "./actions";

export function DeleteServiceButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!window.confirm("¿Eliminar este servicio?")) return;
    await deleteServiceAction(id);
  }
  return (
    <button
      onClick={handleDelete}
      className={cn(buttonVariants({ variant: "destructive", size: "sm" }))}
    >
      Eliminar
    </button>
  );
}
