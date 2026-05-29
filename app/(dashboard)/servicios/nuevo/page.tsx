import { ServiceForm } from "@/components/servicios/ServiceForm";
import { listProveedores } from "@/lib/proveedores/proveedorService";
import { createServiceAction } from "../actions";
import { PageHeader } from "@/components/ui/page-header";

export default async function NuevoServicioPage() {
  const proveedores = await listProveedores();

  return (
    <div>
      <PageHeader title="Nuevo servicio" />
      <ServiceForm onSubmit={createServiceAction} submitLabel="Crear servicio" proveedores={proveedores} />
    </div>
  );
}
