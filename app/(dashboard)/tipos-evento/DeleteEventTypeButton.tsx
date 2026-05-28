"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteEventTypeAction } from "./actions";

export function DeleteEventTypeButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("¿Eliminar este tipo de evento?")) return;
    setLoading(true);
    await deleteEventTypeAction(id);
    setLoading(false);
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? "…" : "Eliminar"}
    </Button>
  );
}
