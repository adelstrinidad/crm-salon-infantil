import { EventForm } from "@/components/eventos/EventForm";
import { createEventAction } from "../actions";
import { listServices } from "@/lib/services/serviceService";
import { listProviders } from "@/lib/providers/providerService";
import { listEventTypes } from "@/lib/eventTypes/eventTypeService";
import { listClients } from "@/lib/clients/clientService";
import { quickCreateClientAction } from "@/app/(dashboard)/clientes/actions";
import { PageHeader } from "@/components/ui/page-header";

const DEFAULT_DETAILS = `Te paso los Datos para confirmar
🗓️Fecha del Evento:
⏰ Horario:
😃Nombre del cumpleañero/a:
🎂 Edad que cumple:
💫Temática del cumple:
🤩Cantidad de niños invitados:
⭐️Cantidad de Adultos:`;

export default async function NuevoEventoPage() {
  const [services, providers, eventTypes, clients] = await Promise.all([
    listServices(),
    listProviders(),
    listEventTypes(),
    listClients(),
  ]);

  return (
    <div>
      <PageHeader title="Nuevo evento" />
      <EventForm
        onSubmit={createEventAction}
        submitVariant="create"
        availableServices={services}
        availableProviders={providers}
        eventTypes={eventTypes}
        clients={clients}
        createClient={quickCreateClientAction}
        defaultValues={{ details: DEFAULT_DETAILS }}
      />
    </div>
  );
}
