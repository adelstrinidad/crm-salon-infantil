import Link from "next/link";
import { listEvents } from "@/lib/events/eventService";
import { buttonVariants } from "@/components/ui/button";
import { EventState } from "@/lib/events/schema";
import { DeleteButton } from "./DeleteButton";
import { cn } from "@/lib/utils";
import type { Event } from "@/app/generated/prisma/client";

const STATE_LABELS: Record<EventState, string> = {
  PRESUPUESTADO: "Presupuestado",
  RESERVADO: "Reservado",
  SENADO: "Señado",
  PAGADO: "Pagado",
  CERRADO: "Cerrado",
  SUSPENDIDO: "Suspendido",
};

const STATE_COLORS: Record<EventState, string> = {
  PRESUPUESTADO: "bg-yellow-100 text-yellow-800",
  RESERVADO: "bg-blue-100 text-blue-800",
  SENADO: "bg-purple-100 text-purple-800",
  PAGADO: "bg-green-100 text-green-800",
  CERRADO: "bg-gray-100 text-gray-800",
  SUSPENDIDO: "bg-red-100 text-red-800",
};

export default async function EventosPage() {
  const events = await listEvents();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <Link href="/eventos/nuevo" className={cn(buttonVariants())}>
          + Nuevo evento
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500">No hay eventos todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
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
            <tbody className="divide-y divide-gray-100">
              {events.map((event: Event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/eventos/${event.id}`} className="hover:underline">
                      {event.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{event.eventType}</td>
                  <td className="px-4 py-3 text-gray-600">{event.clientName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Intl.DateTimeFormat("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(event.startAt))}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      STATE_COLORS[event.state as EventState]
                    )}>
                      {STATE_LABELS[event.state as EventState]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ${event.totalPrice.toFixed(2)}
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
    </div>
  );
}
