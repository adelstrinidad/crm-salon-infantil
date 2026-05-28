import { ProviderForm } from "@/components/prestadores/ProviderForm";
import { createProviderAction } from "../actions";

export default function NuevoPrestadorPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo prestador</h1>
      <ProviderForm onSubmit={createProviderAction} submitLabel="Crear prestador" />
    </div>
  );
}
