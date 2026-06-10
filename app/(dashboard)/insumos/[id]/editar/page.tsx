import { notFound } from "next/navigation";
import { getInsumo } from "@/lib/insumos/insumoService";
import { InsumoForm } from "@/components/insumos/InsumoForm";
import { updateInsumoAction } from "../../actions";
import type { InsumoFormValues } from "@/lib/insumos/schema";
import { PageHeader } from "@/components/ui/page-header";

type Props = { params: Promise<{ id: string }> };

export default async function EditarInsumoPage({ params }: Props) {
  const { id } = await params;
  const insumo = await getInsumo(id).catch(() => null);
  if (!insumo) return notFound();

  const defaultValues: InsumoFormValues = {
    name: insumo.name,
    unit: insumo.unit as InsumoFormValues["unit"],
    stockQty: insumo.stockQty,
    minStock: insumo.minStock,
    notes: insumo.notes ?? "",
  };

  async function handleSubmit(data: InsumoFormValues) {
    "use server";
    return updateInsumoAction(id, data);
  }

  return (
    <div>
      <PageHeader title="Editar insumo" />
      <InsumoForm onSubmit={handleSubmit} defaultValues={defaultValues} submitLabel="Guardar cambios" />
    </div>
  );
}
