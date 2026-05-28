import { ClientForm } from "@/components/clients/ClientForm";
import { createClientAction } from "../actions";

export default function NuevoClientePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo cliente</h1>
      <ClientForm onSubmit={createClientAction} submitLabel="Crear cliente" />
    </div>
  );
}
