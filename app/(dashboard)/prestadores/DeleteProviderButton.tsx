"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteProviderAction } from "./actions";

export function DeleteProviderButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!window.confirm("¿Eliminar este prestador?")) return;
    await deleteProviderAction(id);
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
