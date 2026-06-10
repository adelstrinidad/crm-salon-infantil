import { InsumoForm } from "@/components/insumos/InsumoForm";
import { createInsumoAction } from "../actions";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevoInsumoPage() {
  return (
    <div>
      <PageHeader title="Nuevo insumo" />
      <InsumoForm onSubmit={createInsumoAction} submitLabel="Crear insumo" />
    </div>
  );
}
