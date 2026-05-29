import { listAccounts } from "@/lib/finanzas/finanzasService";
import { MovementForm } from "@/components/finanzas/MovementForm";
import { createMovementAction } from "../../actions";
import { PageHeader } from "@/components/ui/page-header";

export default async function NuevoMovimientoPage() {
  const accounts = await listAccounts();

  return (
    <div>
      <PageHeader title="Nuevo movimiento" />
      {accounts.length === 0 ? (
        <p className="text-muted-foreground">Primero creá al menos una cuenta.</p>
      ) : (
        <MovementForm onSubmit={createMovementAction} accounts={accounts} submitLabel="Registrar" />
      )}
    </div>
  );
}
