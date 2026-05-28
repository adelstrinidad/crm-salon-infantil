"use client";
// DeleteButton is a Client Component only because it needs window.confirm.
// The actual delete runs on the server via deleteEventAction.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteEventAction } from "./actions";

export function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("¿Eliminar este evento?")) return;
    setLoading(true);
    await deleteEventAction(id);
    // revalidatePath in the action refreshes the list; no client redirect needed
    setLoading(false);
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "…" : "Eliminar"}
    </Button>
  );
}
