import { notFound } from "next/navigation";
import { getEventWithAll } from "@/lib/events/eventProviderLines";
import { listServices } from "@/lib/services/serviceService";
import { listProviders } from "@/lib/providers/providerService";
import { listEventTypes } from "@/lib/eventTypes/eventTypeService";
import { listClients } from "@/lib/clients/clientService";
import { EventForm } from "@/components/eventos/EventForm";
import { EventServicePicker } from "@/components/eventos/EventServicePicker";
import { EventProviderPicker } from "@/components/eventos/EventProviderPicker";
import { EventBonificadoPicker } from "@/components/eventos/EventBonificadoPicker";
import { updateEventAction } from "../../actions";
import { computeEventFinancials } from "@/lib/events/financials";
import { centsToPesos, formatMoney } from "@/lib/money";
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
  const [event, allServices, allProviders, allEventTypes, allClients] = await Promise.all([
    getEventWithAll(id).catch(() => null),
    listServices(),
    listProviders(),
    listEventTypes(),
    listClients(),
  ]);
  if (!event) return notFound();

  const { serviceCost, servicePrice, providerCost, totalBonificado, totalCost, subtotal, profit } =
    computeEventFinancials(event);

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
    totalPrice: String(centsToPesos(event.totalPrice)),
  };

  async function handleSubmit(data: EventFormInput) {
    "use server";
    return updateEventAction(id, data);
  }

  return (
    <div className="space-y-10">
      <div>
        <PageHeader title="Editar evento" />
        <EventForm
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          submitLabel="Guardar cambios"
          stickyBar={false}
          hideActions={true}
          formId="event-edit-form"
          eventTypes={allEventTypes}
          clients={allClients}
        />
      </div>

      <hr />

      <EventServicePicker eventId={id} lines={event.services} available={allServices} />

      <hr />

      <EventProviderPicker eventId={id} lines={event.providers} available={allProviders} />

      <hr />

      <EventBonificadoPicker eventId={id} lines={event.bonificados} available={allServices} />

      <hr />

      <div className="space-y-2 text-sm">
        <SectionTitle>Resumen financiero</SectionTitle>
        <div className="grid grid-cols-2 gap-1 max-w-xs">
          <span className="text-muted-foreground">Precio servicios</span>
          <span>{formatMoney(servicePrice)}</span>
          <span className="text-muted-foreground">Costo servicios</span>
          <span>{formatMoney(serviceCost)}</span>
          <span className="text-muted-foreground">Costo prestadores</span>
          <span>{formatMoney(providerCost)}</span>
          <span className="text-muted-foreground">Total bonificado</span>
          <span className="text-accent">-{formatMoney(totalBonificado)}</span>
          <span className="text-muted-foreground font-medium">Subtotal</span>
          <span className="font-medium">{formatMoney(subtotal)}</span>
          <span className="text-muted-foreground font-medium">Costo total</span>
          <span className="font-medium">{formatMoney(totalCost)}</span>
          <span className="text-muted-foreground font-medium">Ganancia estimada</span>
          <Money value={profit} signed className="font-medium">
            {formatMoney(profit)}
          </Money>
        </div>
      </div>

      <div className="flex gap-3 border-t pt-6">
        <button
          type="submit"
          form="event-edit-form"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          Guardar cambios
        </button>
        <Link
          href="/eventos"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          Cancelar
        </Link>
      </div>
    </div>
  );
}
