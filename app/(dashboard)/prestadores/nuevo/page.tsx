import { ProviderForm } from "@/components/prestadores/ProviderForm";
import { createProviderAction } from "../actions";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevoPrestadorPage() {
  return (
    <div>
      <PageHeader title="Nuevo prestador" />
      <ProviderForm onSubmit={createProviderAction} submitLabel="Crear prestador" />
    </div>
  );
}
