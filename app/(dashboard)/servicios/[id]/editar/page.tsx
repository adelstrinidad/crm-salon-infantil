import { notFound } from "next/navigation";
import { getService } from "@/lib/services/serviceService";
import { listProveedores } from "@/lib/proveedores/proveedorService";
import { ServiceForm } from "@/components/servicios/ServiceForm";
import { updateServiceAction } from "../../actions";
import type { ServiceFormInput } from "@/lib/services/schema";
import { centsToPesos } from "@/lib/money";
import { PageHeader } from "@/components/ui/page-header";

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
    cost: String(centsToPesos(service.cost)),
    price: String(centsToPesos(service.price)),
    proveedorId: service.proveedorId ?? "",
  };

  async function handleSubmit(data: ServiceFormInput) {
    "use server";
    return updateServiceAction(id, data);
  }

  return (
    <div>
      <PageHeader title="Editar servicio" />
      <ServiceForm onSubmit={handleSubmit} defaultValues={defaultValues} submitLabel="Guardar cambios" proveedores={proveedores} />
    </div>
  );
}
