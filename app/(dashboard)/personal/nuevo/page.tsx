import { StaffForm } from "@/components/personal/StaffForm";
import { createStaffAction } from "../actions";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevoPersonalPage() {
  return (
    <div>
      <PageHeader title="Nuevo empleado" />
      <StaffForm onSubmit={createStaffAction} submitLabel="Crear empleado" />
    </div>
  );
}
