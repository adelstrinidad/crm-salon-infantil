import { ClientForm } from "@/components/clients/ClientForm";
import { createClientAction } from "../actions";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevoClientePage() {
  return (
    <div>
      <PageHeader title="Nuevo cliente" />
      <ClientForm onSubmit={createClientAction} submitLabel="Crear cliente" />
    </div>
  );
}
