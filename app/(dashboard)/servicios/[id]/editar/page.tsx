import { notFound } from "next/navigation";
import { getService } from "@/lib/services/serviceService";
import { listProveedores } from "@/lib/proveedores/proveedorService";
import { ServiceForm } from "@/components/servicios/ServiceForm";
import { updateServiceAction } from "../../actions";
import type { ServiceFormInput } from "@/lib/services/schema";

type Props = { params: Promise<{ id: string }> };

export default async function EditarServicioPage({ params }: Props) {
  const { id } = await params;
  const [service, proveedores] = await Promise.all([
    getService(id).catch(() => null),
    listProveedores(),
  ]);
  if (!service) return notFound();

  const defaultValues: ServiceFormInput = {
    name: service.name,
    description: service.description ?? "",
    cost: String(service.cost),
    price: String(service.price),
    proveedorId: service.proveedorId ?? "",
  };

  async function handleSubmit(data: ServiceFormInput) {
    "use server";
    return updateServiceAction(id, data);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar servicio</h1>
      <ServiceForm onSubmit={handleSubmit} defaultValues={defaultValues} submitLabel="Guardar cambios" proveedores={proveedores} />
    </div>
  );
}
