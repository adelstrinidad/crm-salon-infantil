import { notFound } from "next/navigation";
import { getEventWithAll } from "@/lib/events/eventProviderLines";
import { listServices } from "@/lib/services/serviceService";
import { listProviders } from "@/lib/providers/providerService";
import { listStaff } from "@/lib/staff/staffService";
import { listEventTypes } from "@/lib/eventTypes/eventTypeService";
import { listClients } from "@/lib/clients/clientService";
import { EventForm } from "@/components/eventos/EventForm";
import { EventServicePicker } from "@/components/eventos/EventServicePicker";
import { EventProviderPicker } from "@/components/eventos/EventProviderPicker";
import { EventBonificadoPicker } from "@/components/eventos/EventBonificadoPicker";
import { AutosaveProvider, AutosaveIndicator } from "@/components/eventos/autosave";
import { EventStaffPicker } from "@/components/eventos/EventStaffPicker";
import { updateEventAction } from "../../actions";
import { computeEventFinancials } from "@/lib/events/financials";
import { formatMoney } from "@/lib/money";
import type { EventFormInput, EventState } from "@/lib/events/schema";
import { PageHeader } from "@/components/ui/page-header";
import { SectionTitle } from "@/components/ui/section-title";
import { Money } from "@/components/ui/money";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

function toDatetimeLocal(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default async function EditarEventoPage({ params }: Props) {
  const { id } = await params;
  const [event, allServices, allProviders, allStaff, allEventTypes, allClients] =
    await Promise.all([
      getEventWithAll(id).catch(() => null),
      listServices(),
      listProviders(),
      listStaff(),
      listEventTypes(),
      listClients(),
    ]);
  if (!event) return notFound();

  // Edit page only needs a light live preview of the package price/profit while
  // composing (the full breakdown lives on the detail page's "Contabilidad").
  const { subtotal, profit } = computeEventFinancials(event);

  const defaultValues: EventFormInput = {
    name: event.name,
    eventType: event.eventType,
    clientName: event.clientName,
    clientId: event.clientId ?? undefined,
    startAt: toDatetimeLocal(event.startAt),
    endAt: toDatetimeLocal(event.endAt),
    state: event.state as EventState,
    details: event.details ?? "",
    notes: event.notes ?? "",
  };

  async function handleSubmit(data: EventFormInput) {
    "use server";
    return updateEventAction(id, data);
  }

  return (
    <AutosaveProvider>
      <div className="space-y-10 max-w-2xl">
        <div>
          <div className="flex items-center justify-between gap-4">
            <PageHeader title="Editar evento" />
            <AutosaveIndicator />
          </div>
          <EventForm
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            stickyBar={false}
            hideActions={true}
            autosave={true}
            eventTypes={allEventTypes}
            clients={allClients}
          />
        </div>

      <hr />

      {/* Anchor ids + scroll-margin let the detail-page "Agregar …" CTAs deep
          link straight to the right picker (e.g. /editar#prestadores). */}
      <div id="servicios" className="scroll-mt-6">
        <EventServicePicker eventId={id} lines={event.services} available={allServices} />
      </div>

      <hr />

      <div id="prestadores" className="scroll-mt-6">
        <EventProviderPicker eventId={id} lines={event.providers} available={allProviders} />
      </div>

      <hr />

      <div id="personal" className="scroll-mt-6">
        <EventStaffPicker eventId={id} lines={event.staff} available={allStaff} />
      </div>

      <hr />

      <EventBonificadoPicker eventId={id} lines={event.bonificados} available={allServices} />

      <hr />

      <div className="space-y-2 text-sm">
        <SectionTitle>Resumen del paquete</SectionTitle>
        <p className="text-xs text-muted-foreground max-w-sm">
          Vista rápida del precio y la ganancia mientras armás el evento. El detalle
          completo y los consumos del evento se ven en la página del evento.
        </p>
        <div className="grid grid-cols-2 gap-1 max-w-xs pt-1">
          <span className="text-muted-foreground font-medium">Precio total</span>
          <span className="font-medium">{formatMoney(subtotal)}</span>
          <span className="text-muted-foreground font-medium">Ganancia estimada</span>
          <Money value={profit} signed className="font-medium">
            {formatMoney(profit)}
          </Money>
        </div>
      </div>

        {/* No "Guardar" button: every field and picker auto-saves; the header
            indicator reports the status. This is just a way back to the list. */}
        <div className="flex gap-3 border-t pt-6">
          <Link
            href="/eventos"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            Volver a eventos
          </Link>
        </div>
      </div>
    </AutosaveProvider>
  );
}
