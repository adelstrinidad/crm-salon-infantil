"use client";

import { useRouter } from "next/navigation";
import { deleteMovementAction } from "./actions";

export function DeleteMovementButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  const router = useRouter();
  async function handle() {
    if (!window.confirm("¿Eliminar este movimiento?")) return;
    await deleteMovementAction(id);
    if (redirectTo) { router.push(redirectTo); router.refresh(); }
  }
  return (
    <button onClick={handle} className="text-xs text-red-600 hover:underline">
      Eliminar
    </button>
  );
}
