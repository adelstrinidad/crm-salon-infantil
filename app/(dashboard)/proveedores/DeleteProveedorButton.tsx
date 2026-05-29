"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    <Button onClick={handleDelete} variant="destructive" size="sm">
      Eliminar
    </Button>
  );
}
