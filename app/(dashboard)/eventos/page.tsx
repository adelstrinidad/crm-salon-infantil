import Link from "next/link";
import { Plus, PartyPopper, ChevronRight, Search } from "lucide-react";
import { listEventsFiltered } from "@/lib/events/eventService";
import { listEventTypes } from "@/lib/eventTypes/eventTypeService";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge, statusBadgeLabel } from "@/components/ui/status-badge";
import { Pager } from "@/components/ui/pager";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SelectFilter } from "@/components/ui/select-filter";
import { SortSelect } from "@/components/ui/sort-select";
import { parsePage, buildPaginated } from "@/lib/pagination";
import { EventState } from "@/lib/events/schema";
import { EVENT_SORT_OPTIONS, DEFAULT_EVENT_SORT } from "@/lib/events/listFilters";
import { formatMoney } from "@/lib/money";
import { DeleteButton } from "./DeleteButton";
import { cn } from "@/lib/utils";

function StaffPendingBadge() {
  return (
    <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2 py-0.5 text-[11px] font-medium">
      Falta registro
    </span>
  );
}

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    state?: string;
    eventType?: string;
    from?: string;
    to?: string;
    sort?: string;
  }>;
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(d),
  );
}

export default async function EventosPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageParams = parsePage(params.page, 15);

  const from = params.from ? new Date(params.from + "T00:00:00") : undefined;
  const to = params.to ? new Date(params.to + "T23:59:59") : undefined;
  const sort = params.sort || DEFAULT_EVENT_SORT;

  const [{ rows, total }, eventTypes] = await Promise.all([
    listEventsFiltered({
      q: params.q || undefined,
      state: params.state || undefined,
      eventType: params.eventType || undefined,
      from,
      to,
      sort,
      skip: pageParams.skip,
      take: pageParams.take,
    }),
    listEventTypes(),
  ]);
  const { rows: events, page, pageCount } = buildPaginated(rows, total, pageParams);
  type EventRow = (typeof events)[number];
  const isStaffPending = (e: EventRow) => e.staff.some((s) => s.actualMinutes == null);

  // Filters that should be preserved across pager links.
  const filterQuery = {
    q: params.q,
    state: params.state,
    eventType: params.eventType,
    from: params.from,
    to: params.to,
    sort: params.sort,
  };
  const hasFilters = Boolean(
    params.q || params.state || params.eventType || params.from || params.to,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventos"
        action={
          <Link href="/eventos/nuevo" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nuevo evento
          </Link>
        }
      />

      {/* Filters + sort */}
      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1 w-full sm:w-56">
            <label className="text-sm font-medium">Buscar</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Nombre o cliente…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1 w-full sm:w-44">
            <label className="text-sm font-medium">Estado</label>
            <SelectFilter
              name="state"
              defaultValue={params.state ?? ""}
              allLabel="Todos"
              options={Object.values(EventState).map((s) => ({
                value: s,
                label: statusBadgeLabel(s),
              }))}
            />
          </div>
          <div className="space-y-1 w-full sm:w-44">
            <label className="text-sm font-medium">Tipo</label>
            <SelectFilter
              name="eventType"
              defaultValue={params.eventType ?? ""}
              allLabel="Todos"
              options={eventTypes.map((t) => ({ value: t.name, label: t.name }))}
            />
          </div>
          <div className="space-y-1 w-full sm:w-40">
            <label className="text-sm font-medium">Desde</label>
            <Input type="date" name="from" defaultValue={params.from ?? ""} />
          </div>
          <div className="space-y-1 w-full sm:w-40">
            <label className="text-sm font-medium">Hasta</label>
            <Input type="date" name="to" defaultValue={params.to ?? ""} />
          </div>
          <div className="space-y-1 w-full sm:w-52">
            <label className="text-sm font-medium">Ordenar por</label>
            <SortSelect name="sort" defaultValue={sort} options={EVENT_SORT_OPTIONS} />
          </div>
          <Button type="submit">Filtrar</Button>
          <Link href="/eventos" className={cn(buttonVariants({ variant: "outline" }))}>
            Limpiar
          </Link>
        </form>
      </Card>

      {events.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title={hasFilters ? "Sin resultados" : "Todavía no hay eventos"}
          description={
            hasFilters
              ? "Ningún evento coincide con los filtros. Probá ajustarlos o limpiarlos."
              : "Creá tu primer evento para empezar a gestionar reservas, pagos y presupuestos."
          }
          action={
            hasFilters ? (
              <Link href="/eventos" className={cn(buttonVariants({ variant: "outline" }))}>
                Limpiar filtros
              </Link>
            ) : (
              <Link href="/eventos/nuevo" className={cn(buttonVariants())}>
                <Plus className="size-4" />
                Nuevo evento
              </Link>
            )
          }
        />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Inicio</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Precio</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {events.map((event: EventRow) => (
                  <tr key={event.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/eventos/${event.id}`} className="hover:underline">
                        {event.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{event.eventType}</td>
                    <td className="px-4 py-3 text-muted-foreground">{event.clientName}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {fmtDate(event.startAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge state={event.state} />
                        {isStaffPending(event) && <StaffPendingBadge />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatMoney(event.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/eventos/${event.id}/editar`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Editar
                        </Link>
                        <DeleteButton id={event.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {events.map((event: EventRow) => (
              <li
                key={event.id}
                className="rounded-xl border border-border bg-card shadow-sm"
              >
                <Link
                  href={`/eventos/${event.id}`}
                  className="flex items-start justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{event.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground truncate">
                      {event.eventType} · {event.clientName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{fmtDate(event.startAt)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge state={event.state} />
                      <span className="text-sm font-medium">{formatMoney(event.totalPrice)}</span>
                      {isStaffPending(event) && <StaffPendingBadge />}
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground mt-1" />
                </Link>
                <div className="flex gap-2 border-t border-border/60 px-4 py-2.5">
                  <Link
                    href={`/eventos/${event.id}/editar`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Editar
                  </Link>
                  <DeleteButton id={event.id} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {total > 0 && (
        <div className="mt-4">
          <Pager
            page={page}
            pageCount={pageCount}
            total={total}
            basePath="/eventos"
            query={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
