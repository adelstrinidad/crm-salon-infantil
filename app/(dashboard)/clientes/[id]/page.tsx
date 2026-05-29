import { notFound } from "next/navigation";
import Link from "next/link";
import { getClientWithEvents } from "@/lib/clients/clientService";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionTitle } from "@/components/ui/section-title";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function ClienteDetailPage({ params }: Props) {
  const { id } = await params;
  const client = await getClientWithEvents(id).catch(() => null);
  if (!client) return notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        title={client.name}
        description={
          [client.phone && `📞 ${client.phone}`, client.email && `✉ ${client.email}`]
            .filter(Boolean)
            .join("  ·  ") || undefined
        }
        action={
          <Link
            href={`/clientes/${id}/editar`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Editar
          </Link>
        }
      />
      {client.notes && (
        <p className="text-sm text-muted-foreground italic -mt-4">{client.notes}</p>
      )}

      <div>
        <SectionTitle className="mb-3">Eventos ({client.events.length})</SectionTitle>
        {client.events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin eventos vinculados.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Evento</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Inicio</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {client.events.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/eventos/${e.id}/editar`} className="hover:underline font-medium">{e.name}</Link>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{e.eventType}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Date(e.startAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge state={e.state} />
                    </td>
                    <td className="px-4 py-2">{formatMoney(e.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
