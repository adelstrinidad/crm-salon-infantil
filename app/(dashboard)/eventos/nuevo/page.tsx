import { EventForm } from "@/components/eventos/EventForm";
import { createEventAction } from "../actions";
import { listServices } from "@/lib/services/serviceService";
import { listProviders } from "@/lib/providers/providerService";
import { listStaff } from "@/lib/staff/staffService";
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

type Props = { searchParams: Promise<{ start?: string; end?: string }> };

// Accept only `YYYY-MM-DDTHH:mm` (datetime-local) to keep prefill safe.
function sanitizeDatetimeLocal(value: string | undefined): string | undefined {
  if (value && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  return undefined;
}

export default async function NuevoEventoPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [services, providers, staff, eventTypes, clients] = await Promise.all([
    listServices(),
    listProviders(),
    listStaff(),
    listEventTypes(),
    listClients(),
  ]);

  // Prefill the time range when arriving from a calendar slot click.
  const startAt = sanitizeDatetimeLocal(sp.start);
  const endAt = sanitizeDatetimeLocal(sp.end);

  return (
    <div>
      <PageHeader title="Nuevo evento" />
      <EventForm
        onSubmit={createEventAction}
        submitVariant="create"
        availableServices={services}
        availableProviders={providers}
        availableStaff={staff}
        eventTypes={eventTypes}
        clients={clients}
        createClient={quickCreateClientAction}
        defaultValues={{
          details: DEFAULT_DETAILS,
          ...(startAt ? { startAt } : {}),
          ...(endAt ? { endAt } : {}),
        }}
      />
    </div>
  );
}
