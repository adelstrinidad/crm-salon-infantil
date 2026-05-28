import { listAccounts } from "@/lib/finanzas/finanzasService";
import { MovementForm } from "@/components/finanzas/MovementForm";
import { createMovementAction } from "../../actions";

export default async function NuevoMovimientoPage() {
  const accounts = await listAccounts();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo movimiento</h1>
      {accounts.length === 0 ? (
        <p className="text-muted-foreground">Primero creá al menos una cuenta.</p>
      ) : (
        <MovementForm onSubmit={createMovementAction} accounts={accounts} submitLabel="Registrar" />
      )}
    </div>
  );
}
