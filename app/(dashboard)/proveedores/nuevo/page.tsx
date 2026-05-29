import { ProveedorForm } from "@/components/proveedores/ProveedorForm";
import { createProveedorAction } from "../actions";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevoProveedorPage() {
  return (
    <div>
      <PageHeader title="Nuevo proveedor" />
      <ProveedorForm onSubmit={createProveedorAction} submitLabel="Crear proveedor" />
    </div>
  );
}
