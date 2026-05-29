import Link from "next/link";
import { Plus, PartyPopper, ChevronRight } from "lucide-react";
import { listEventsPage } from "@/lib/events/eventService";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pager } from "@/components/ui/pager";
import { EmptyState } from "@/components/ui/empty-state";
import { parsePage, buildPaginated } from "@/lib/pagination";
import { formatMoney } from "@/lib/money";
import { DeleteButton } from "./DeleteButton";
import { cn } from "@/lib/utils";
import type { Event } from "@/app/generated/prisma/client";

type Props = { searchParams: Promise<{ page?: string }> };

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(d),
  );
}

export default async function EventosPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const pageParams = parsePage(pageParam);
  const { rows, total } = await listEventsPage({ skip: pageParams.skip, take: pageParams.take });
  const { rows: events, page, pageCount } = buildPaginated(rows, total, pageParams);

  return (
    <div>
      <PageHeader
        title="Eventos"
        action={
          <Link href="/eventos/nuevo" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nuevo evento
          </Link>
        }
      />

      {events.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="Todavía no hay eventos"
          description="Creá tu primer evento para empezar a gestionar reservas, pagos y presupuestos."
          action={
            <Link href="/eventos/nuevo" className={cn(buttonVariants())}>
              <Plus className="size-4" />
              Nuevo evento
            </Link>
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
                {events.map((event: Event) => (
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
                      <StatusBadge state={event.state} />
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
            {events.map((event: Event) => (
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
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge state={event.state} />
                      <span className="text-sm font-medium">{formatMoney(event.totalPrice)}</span>
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
          <Pager page={page} pageCount={pageCount} total={total} basePath="/eventos" />
        </div>
      )}
    </div>
  );
}
