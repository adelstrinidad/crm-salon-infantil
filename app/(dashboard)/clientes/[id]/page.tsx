import { notFound } from "next/navigation";
import Link from "next/link";
import { getClientWithEvents } from "@/lib/clients/clientService";

type Props = { params: Promise<{ id: string }> };

const STATE_LABELS: Record<string, string> = {
  PRESUPUESTADO: "Presupuestado",
  RESERVADO: "Reservado",
  SENADO: "Señado",
  PAGADO: "Pagado",
  CERRADO: "Cerrado",
  SUSPENDIDO: "Suspendido",
};

export default async function ClienteDetailPage({ params }: Props) {
  const { id } = await params;
  const client = await getClientWithEvents(id).catch(() => null);
  if (!client) return notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
            {client.phone && <p>📞 {client.phone}</p>}
            {client.email && <p>✉ {client.email}</p>}
            {client.notes && <p className="mt-2 italic">{client.notes}</p>}
          </div>
        </div>
        <Link href={`/clientes/${id}/editar`} className="text-sm px-3 py-1.5 rounded border hover:bg-muted">
          Editar
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Eventos ({client.events.length})</h2>
        {client.events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin eventos vinculados.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4">Evento</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Inicio</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2">Precio</th>
              </tr>
            </thead>
            <tbody>
              {client.events.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="py-2 pr-4">
                    <Link href={`/eventos/${e.id}/editar`} className="hover:underline font-medium">{e.name}</Link>
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">{e.eventType}</td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {new Date(e.startAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{STATE_LABELS[e.state] ?? e.state}</span>
                  </td>
                  <td className="py-2">${e.totalPrice.toLocaleString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
