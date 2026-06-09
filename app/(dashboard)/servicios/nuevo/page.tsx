import { ServiceForm } from "@/components/servicios/ServiceForm";
import { listProviders } from "@/lib/providers/providerService";
import { createServiceAction } from "../actions";
import { PageHeader } from "@/components/ui/page-header";

export default async function NuevoServicioPage() {
  const prestadores = await listProviders();

  return (
    <div>
      <PageHeader title="Nuevo servicio" />
      <ServiceForm onSubmit={createServiceAction} submitLabel="Crear servicio" prestadores={prestadores} />
    </div>
  );
}
