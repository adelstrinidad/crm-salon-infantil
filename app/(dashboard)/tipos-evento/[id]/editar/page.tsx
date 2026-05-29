import { notFound } from "next/navigation";
import { getEventType } from "@/lib/eventTypes/eventTypeService";
import { EventTypeForm } from "@/components/eventTypes/EventTypeForm";
import { updateEventTypeAction } from "../../actions";
import type { EventTypeFormInput } from "@/lib/eventTypes/eventTypeService";
import { PageHeader } from "@/components/ui/page-header";

type Props = { params: Promise<{ id: string }> };

export default async function EditarTipoEventoPage({ params }: Props) {
  const { id } = await params;
  const eventType = await getEventType(id).catch(() => null);
  if (!eventType) return notFound();

  const defaultValues: EventTypeFormInput = { name: eventType.name };

  async function handleSubmit(data: EventTypeFormInput) {
    "use server";
    return updateEventTypeAction(id, data);
  }

  return (
    <div>
      <PageHeader title="Editar tipo de evento" />
      <EventTypeForm onSubmit={handleSubmit} defaultValues={defaultValues} submitLabel="Guardar cambios" />
    </div>
  );
}
