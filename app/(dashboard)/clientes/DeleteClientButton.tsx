"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteClientAction } from "./actions";

export function DeleteClientButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    setLoading(true);
    await deleteClientAction(id);
    setLoading(false);
  }
  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? "…" : "Eliminar"}
    </Button>
  );
}
