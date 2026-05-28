import { EventForm } from "@/components/eventos/EventForm";
import { createEventAction } from "../actions";
import { listServices } from "@/lib/services/serviceService";
import { listProviders } from "@/lib/providers/providerService";
import { listEventTypes } from "@/lib/eventTypes/eventTypeService";
import { listClients } from "@/lib/clients/clientService";

export default async function NuevoEventoPage() {
  const [services, providers, eventTypes, clients] = await Promise.all([
    listServices(),
    listProviders(),
    listEventTypes(),
    listClients(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo evento</h1>
      <EventForm
        onSubmit={createEventAction}
        submitVariant="create"
        availableServices={services}
        availableProviders={providers}
        eventTypes={eventTypes}
        clients={clients}
      />
    </div>
  );
}
