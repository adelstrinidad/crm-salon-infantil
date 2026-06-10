"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteCompraAction } from "./actions";

type Props = { id: string; redirectTo?: string; size?: "sm" | "xs" };

export function DeleteCompraButton({ id, redirectTo = "/compras", size = "sm" }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("¿Eliminar esta compra? Se revertirá el stock que sumó.")) return;
    const result = await deleteCompraAction(id);
    if (result.ok) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button onClick={handleDelete} variant="destructive" size={size}>
        Eliminar
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
