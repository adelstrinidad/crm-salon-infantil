import { notFound } from "next/navigation";
import { getClient } from "@/lib/clients/clientService";
import { ClientForm } from "@/components/clients/ClientForm";
import { updateClientAction } from "../../actions";
import type { ClientFormInput } from "@/lib/clients/schema";
import { PageHeader } from "@/components/ui/page-header";

type Props = { params: Promise<{ id: string }> };

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params;
  const client = await getClient(id).catch(() => null);
  if (!client) return notFound();

  const defaultValues: ClientFormInput = {
    name:    client.name,
    dni:     client.dni ?? "",
    phone:   client.phone ?? "",
    email:   client.email ?? "",
    address: client.address ?? "",
    notes:   client.notes ?? "",
  };

  async function handleSubmit(data: ClientFormInput) {
    "use server";
    return updateClientAction(id, data);
  }

  return (
    <div>
      <PageHeader title="Editar cliente" />
      <ClientForm onSubmit={handleSubmit} defaultValues={defaultValues} submitLabel="Guardar cambios" />
    </div>
  );
}
