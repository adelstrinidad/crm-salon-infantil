import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvent } from "@/lib/events/eventService";
import { getEventConsumos, getRemovedConsumos } from "@/lib/consumos/consumoService";
import { splitConsumosByPayer } from "@/lib/consumos/calc";
import { removalReasonLabel } from "@/lib/consumos/removalReasons";
import { tableLabel } from "@/lib/consumos/schema";
import { listInsumos } from "@/lib/insumos/insumoService";
import { listAccounts } from "@/lib/finanzas/finanzasService";
import { CobrarInvitadoPanel } from "../CobrarInvitadoPanel";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { ConsumosCapture } from "./ConsumosCapture";
import { MermaRapidaPanel } from "./MermaRapidaPanel";
import { CerrarConsumosButton } from "../ConsumosLifecycleButtons";

type Props = { params: Promise<{ id: string }> };

export default async function ConsumosPage({ params }: Props) {
  const { id } = await params;

  const [event, consumos, removed, insumos, accounts] = await Promise.all([
    getEvent(id).catch(() => null),
    getEventConsumos(id),
    getRemovedConsumos(id),
    listInsumos(),
    listAccounts(),
  ]);
  if (!event) return notFound();

  const open = event.consumosStartedAt != null && event.consumosClosedAt == null;
  const { invitados } = splitConsumosByPayer(consumos);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            <Link href="/eventos" className="hover:underline">Eventos</Link>
            {" / "}
            <Link href={`/eventos/${id}`} className="hover:underline">{event.name}</Link>
            {" / Consumos"}
          </p>
          <h1 className="font-heading text-2xl font-medium tracking-tight text-foreground">
            Consumos — {event.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge state={event.state} />
            {event.consumosClosedAt && (
              <span className="inline-flex items-center rounded-full border bg-muted text-foreground border-border px-2.5 py-0.5 text-xs font-medium">
                Consumos cerrados
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/eventos/${id}`} className={cn(buttonVariants({ variant: "outline" }))}>
            Volver al evento
          </Link>
          {event.consumosClosedAt != null && (
            <Link
              href={`/eventos/${id}/consumos/reporte`}
              target="_blank"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Ver reporte
            </Link>
          )}
          {open && (
            <MermaRapidaPanel
              eventName={event.name}
              insumos={insumos.map((i) => ({ id: i.id, name: i.name, stockQty: i.stockQty }))}
            />
          )}
          {open && <CerrarConsumosButton eventId={id} />}
        </div>
      </div>

      <ConsumosCapture
        eventId={id}
        open={open}
        lines={consumos.map((c) => ({
          id: c.id,
          tableNumber: c.tableNumber,
          qty: c.qty,
          unitPrice: c.unitPrice,
          insumoName: c.insumo.name,
          payerType: c.payerType,
          payerLabel: c.payerLabel,
          paid: c.paid,
        }))}
        insumos={insumos.map((i) => ({
          id: i.id,
          name: i.name,
          unit: i.unit,
          stockQty: i.stockQty,
          eventPrice: i.eventPrice,
        }))}
      />

      {/* Self-paying guests: each settles independently, at any moment. */}
      {invitados.length > 0 && (
        <Card className="p-5">
          <SectionTitle className="text-base mb-3">Invitados</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Invitado</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Pendiente</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invitados.map((g) => (
                  <tr key={g.label} className="hover:bg-muted/40 transition-colors">
                    <td className="px-3 py-2 font-medium">{g.label}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(g.total)}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(g.pendingTotal)}</td>
                    <td className="px-3 py-2">
                      {g.paid ? (
                        <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
                          Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {!g.paid && (
                        <CobrarInvitadoPanel
                          eventId={id}
                          payerLabel={g.label}
                          total={g.pendingTotal}
                          accounts={accounts}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Append-only void audit — every anulación stays visible. */}
      {removed.length > 0 && (
        <Card className="p-5">
          <SectionTitle className="text-base mb-3">Anulaciones</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Mesa</th>
                  <th className="px-3 py-2 text-left">Insumo</th>
                  <th className="px-3 py-2 text-center">Cant.</th>
                  <th className="px-3 py-2 text-right">Importe</th>
                  <th className="px-3 py-2 text-left">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {removed.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(r.removedAt).toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-3 py-2">{tableLabel(r.tableNumber)}</td>
                    <td className="px-3 py-2 font-medium">{r.insumoName}</td>
                    <td className="px-3 py-2 text-center">{r.qty}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(r.unitPrice * r.qty)}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {removalReasonLabel(r.reason)}
                      {r.reasonText ? ` — ${r.reasonText}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
