import Link from "next/link";
import { listEventsPage } from "@/lib/events/eventService";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pager } from "@/components/ui/pager";
import { parsePage, buildPaginated } from "@/lib/pagination";
import { formatMoney } from "@/lib/money";
import { DeleteButton } from "./DeleteButton";
import { cn } from "@/lib/utils";
import type { Event } from "@/app/generated/prisma/client";

type Props = { searchParams: Promise<{ page?: string }> };

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
            + Nuevo evento
          </Link>
        }
      />

      {events.length === 0 ? (
        <p className="text-muted-foreground">No hay eventos todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Inicio</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Precio</th>
                <th className="px-4 py-3 text-left">Acciones</th>
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
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Intl.DateTimeFormat("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(event.startAt))}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge state={event.state} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatMoney(event.totalPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
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
      )}

      {total > 0 && (
        <div className="mt-4">
          <Pager page={page} pageCount={pageCount} total={total} basePath="/eventos" />
        </div>
      )}
    </div>
  );
}
