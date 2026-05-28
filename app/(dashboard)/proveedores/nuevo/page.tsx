import { ProveedorForm } from "@/components/proveedores/ProveedorForm";
import { createProveedorAction } from "../actions";

export default function NuevoProveedorPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo proveedor</h1>
      <ProveedorForm onSubmit={createProveedorAction} submitLabel="Crear proveedor" />
    </div>
  );
}
