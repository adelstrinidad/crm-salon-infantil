import { EventTypeForm } from "@/components/eventTypes/EventTypeForm";
import { createEventTypeAction } from "../actions";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevoTipoEventoPage() {
  return (
    <div>
      <PageHeader title="Nuevo tipo de evento" />
      <EventTypeForm onSubmit={createEventTypeAction} submitLabel="Crear tipo" />
    </div>
  );
}
