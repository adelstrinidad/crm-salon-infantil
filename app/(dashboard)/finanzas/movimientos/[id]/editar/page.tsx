import { notFound } from "next/navigation";
import { getMovement, listAccounts } from "@/lib/finanzas/finanzasService";
import { MovementForm } from "@/components/finanzas/MovementForm";
import { updateMovementAction } from "../../../actions";
import type { MovementFormInput } from "@/lib/finanzas/schema";
import { centsToPesos } from "@/lib/money";
import { PageHeader } from "@/components/ui/page-header";

type Props = { params: Promise<{ id: string }> };

function toDateInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function EditarMovimientoPage({ params }: Props) {
  const { id } = await params;
  const [movement, accounts] = await Promise.all([
    getMovement(id).catch(() => null),
    listAccounts(),
  ]);
  if (!movement) return notFound();

  const defaultValues: Partial<MovementFormInput> = {
    type: movement.type as MovementFormInput["type"],
    amount: String(centsToPesos(movement.amount)),
    accountId: movement.accountId,
    toAccountId: movement.toAccountId ?? undefined,
    date: toDateInput(new Date(movement.date)),
    description: movement.description ?? "",
  };

  async function handleSubmit(data: MovementFormInput) {
    "use server";
    return updateMovementAction(id, data);
  }

  return (
    <div>
      <PageHeader title="Editar movimiento" />
      <MovementForm
        onSubmit={handleSubmit}
        accounts={accounts}
        defaultValues={defaultValues}
        submitLabel="Guardar cambios"
        cancelHref="/finanzas/movimientos"
      />
    </div>
  );
}
