import { EventTypeForm } from "@/components/eventTypes/EventTypeForm";
import { createEventTypeAction } from "../actions";

export default function NuevoTipoEventoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo tipo de evento</h1>
      <EventTypeForm onSubmit={createEventTypeAction} submitLabel="Crear tipo" />
    </div>
  );
}
