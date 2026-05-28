import { notFound } from "next/navigation";
import { getProveedor } from "@/lib/proveedores/proveedorService";
import { ProveedorForm } from "@/components/proveedores/ProveedorForm";
import { updateProveedorAction } from "../../actions";
import type { ProveedorFormValues } from "@/lib/proveedores/schema";

type Props = { params: Promise<{ id: string }> };

export default async function EditarProveedorPage({ params }: Props) {
  const { id } = await params;
  const proveedor = await getProveedor(id).catch(() => null);
  if (!proveedor) return notFound();

  const defaultValues: ProveedorFormValues = {
    name: proveedor.name,
    description: proveedor.description ?? "",
    phone: proveedor.phone ?? "",
    email: proveedor.email ?? "",
  };

  async function handleSubmit(data: ProveedorFormValues) {
    "use server";
    return updateProveedorAction(id, data);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar proveedor</h1>
      <ProveedorForm onSubmit={handleSubmit} defaultValues={defaultValues} submitLabel="Guardar cambios" />
    </div>
  );
}
