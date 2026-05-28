"use client";

import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteProveedorAction } from "./actions";

export function DeleteProveedorButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("¿Eliminar este proveedor?")) return;
    const result = await deleteProveedorAction(id);
    if (result.ok) {
      router.push("/proveedores");
      router.refresh();
    }
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
