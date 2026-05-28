import { ServiceForm } from "@/components/servicios/ServiceForm";
import { listProveedores } from "@/lib/proveedores/proveedorService";
import { createServiceAction } from "../actions";

export default async function NuevoServicioPage() {
  const proveedores = await listProveedores();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo servicio</h1>
      <ServiceForm onSubmit={createServiceAction} submitLabel="Crear servicio" proveedores={proveedores} />
    </div>
  );
}
