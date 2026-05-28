import { notFound } from "next/navigation";
import { getProvider } from "@/lib/providers/providerService";
import { ProviderForm } from "@/components/prestadores/ProviderForm";
import { updateProviderAction } from "../../actions";
import type { ProviderFormInput } from "@/lib/providers/schema";

type Props = { params: Promise<{ id: string }> };

export default async function EditarPrestadorPage({ params }: Props) {
  const { id } = await params;
  const provider = await getProvider(id).catch(() => null);
  if (!provider) return notFound();

  const defaultValues: ProviderFormInput = {
    name: provider.name,
    role: provider.role ?? "",
    cost: String(provider.cost),
  };

  async function handleSubmit(data: ProviderFormInput) {
    "use server";
    return updateProviderAction(id, data);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar prestador</h1>
      <ProviderForm onSubmit={handleSubmit} defaultValues={defaultValues} submitLabel="Guardar cambios" />
    </div>
  );
}
