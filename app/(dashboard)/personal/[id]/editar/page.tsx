import { notFound } from "next/navigation";
import { getStaff } from "@/lib/staff/staffService";
import { StaffForm } from "@/components/personal/StaffForm";
import { updateStaffAction } from "../../actions";
import type { StaffFormInput } from "@/lib/staff/schema";
import { centsToPesos } from "@/lib/money";
import { PageHeader } from "@/components/ui/page-header";

type Props = { params: Promise<{ id: string }> };

export default async function EditarPersonalPage({ params }: Props) {
  const { id } = await params;
  const staff = await getStaff(id).catch(() => null);
  if (!staff) return notFound();

  const defaultValues: StaffFormInput = {
    name: staff.name,
    role: staff.role ?? "",
    hourlyRate: String(centsToPesos(staff.hourlyRate)),
    active: staff.active,
  };

  async function handleSubmit(data: StaffFormInput) {
    "use server";
    return updateStaffAction(id, data);
  }

  return (
    <div>
      <PageHeader title="Editar empleado" />
      <StaffForm onSubmit={handleSubmit} defaultValues={defaultValues} submitLabel="Guardar cambios" />
    </div>
  );
}
