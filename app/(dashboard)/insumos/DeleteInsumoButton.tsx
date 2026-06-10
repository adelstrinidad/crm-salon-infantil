"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteInsumoAction } from "./actions";

export function DeleteInsumoButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("¿Eliminar este insumo?")) return;
    const result = await deleteInsumoAction(id);
    if (result.ok) {
      router.push("/insumos");
      router.refresh();
    }
  }

  return (
    <Button onClick={handleDelete} variant="destructive" size="sm">
      Eliminar
    </Button>
  );
}
