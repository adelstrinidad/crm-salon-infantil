import { notFound } from "next/navigation";
import { getAccount } from "@/lib/finanzas/finanzasService";
import { AccountForm } from "@/components/finanzas/AccountForm";
import { updateAccountAction } from "../../../actions";
import type { AccountFormInput } from "@/lib/finanzas/schema";
import { PageHeader } from "@/components/ui/page-header";

type Props = { params: Promise<{ id: string }> };

export default async function EditarCuentaPage({ params }: Props) {
  const { id } = await params;
  const account = await getAccount(id).catch(() => null);
  if (!account) return notFound();

  const defaultValues: AccountFormInput = {
    name: account.name,
    description: account.description ?? "",
  };

  async function handleSubmit(data: AccountFormInput) {
    "use server";
    return updateAccountAction(id, data);
  }

  return (
    <div>
      <PageHeader title="Editar cuenta" />
      <AccountForm onSubmit={handleSubmit} defaultValues={defaultValues} submitLabel="Guardar cambios" />
    </div>
  );
}
