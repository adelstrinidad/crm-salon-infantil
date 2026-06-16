import { notFound } from "next/navigation";
import { getEvent } from "@/lib/events/eventService";
import { getEventConsumos, getRemovedConsumos } from "@/lib/consumos/consumoService";
import { getClient } from "@/lib/clients/clientService";
import { computeConsumosSummary, splitConsumosByPayer } from "@/lib/consumos/calc";
import { removalReasonLabel } from "@/lib/consumos/removalReasons";
import { tableLabel } from "@/lib/consumos/schema";
import { formatMoney } from "@/lib/money";
import { Money } from "@/components/ui/money";
import { PrintButton } from "../../presupuesto/PrintButton";

type Props = { params: Promise<{ id: string }> };

const fmt = formatMoney;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(d));
}

// Printable consumption bill, shared with the client to settle what each table
// requested during the event. Mirrors the presupuesto print layout.
export default async function ConsumosReportePage({ params }: Props) {
  const { id } = await params;

  const [event, consumos, removed] = await Promise.all([
    getEvent(id).catch(() => null),
    getEventConsumos(id),
    getRemovedConsumos(id),
  ]);
  if (!event) return notFound();

  const client = event.clientId ? await getClient(event.clientId).catch(() => null) : null;
  // The main bill the organizer pays = CLIENTE lines; self-paying guests get
  // their own annex, each settled independently.
  const { cliente: clientLines, invitados } = splitConsumosByPayer(consumos);
  const summary = computeConsumosSummary(clientLines);
  const byTable = summary.byTable.map(({ tableNumber, total }) => ({
    tableNumber,
    total,
    lines: clientLines.filter((c) => c.tableNumber === tableNumber),
  }));
  const allPaid =
    consumos.length > 0 && consumos.every((c) => c.paid);

  return (
    <>
      {/* Print controls — hidden when printing */}
      <div className="flex gap-3 p-4 print:hidden">
        <PrintButton />
        <a href={`/eventos/${id}`} className="px-4 py-2 text-sm border rounded-lg hover:bg-muted/50">
          ← Volver al evento
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-6 space-y-6 print:px-0 print:py-0 print:max-w-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-heading font-medium">Consumos del evento</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Código del evento: <strong>{id.slice(-6).toUpperCase()}</strong>
            </p>
          </div>
          <div className="text-sm text-right text-muted-foreground">
            <p>Fecha: {new Date().toLocaleDateString("es-AR")}</p>
            {allPaid && <p className="mt-1 font-semibold text-emerald-700">PAGADO</p>}
          </div>
        </div>

        {/* Client + Venue info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Cliente</p>
            <p className="font-medium">{event.clientName}</p>
            {client?.phone && <p className="text-muted-foreground">{client.phone}</p>}
            {client?.email && <p className="text-muted-foreground">{client.email}</p>}
          </div>
          <div className="space-y-1 text-right">
            <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Salón</p>
            <p className="font-medium">Salón Infantil</p>
          </div>
        </div>

        {/* Event detail */}
        <div className="border rounded-lg p-4 space-y-3 text-sm">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Detalle del evento</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-muted-foreground text-xs">Nombre del evento</p>
              <p className="font-medium">{event.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Inicio</p>
              <p>{fmtDate(event.startAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Fin</p>
              <p>{fmtDate(event.endAt)}</p>
            </div>
          </div>
        </div>

        {/* Per-table consumption tables — the organizer's bill */}
        {byTable.length === 0 && invitados.length === 0 ? (
          <p className="text-sm text-muted-foreground">No se registraron consumos durante el evento.</p>
        ) : (
          byTable.map(({ tableNumber, total, lines }) => (
            <div key={tableNumber}>
              <h2 className="font-heading font-medium mb-2">{tableLabel(tableNumber)}</h2>
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="border border-border px-3 py-2 text-left">Insumo</th>
                    <th className="border border-border px-3 py-2 text-center">Cant.</th>
                    <th className="border border-border px-3 py-2 text-right">Precio/u</th>
                    <th className="border border-border px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id}>
                      <td className="border border-border px-3 py-2">{l.insumo.name}</td>
                      <td className="border border-border px-3 py-2 text-center">{l.qty}</td>
                      <td className="border border-border px-3 py-2 text-right">{fmt(l.unitPrice)}</td>
                      <td className="border border-border px-3 py-2 text-right font-medium">
                        {fmt(l.unitPrice * l.qty)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="border border-border px-3 py-2" colSpan={3}>
                      Subtotal {tableLabel(tableNumber)}
                    </td>
                    <td className="border border-border px-3 py-2 text-right">{fmt(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        )}

        {/* Client bill total */}
        {byTable.length > 0 && (
          <div className="flex justify-end">
            <table className="text-sm border border-border min-w-[240px]">
              <tbody>
                <tr className="font-semibold">
                  <td className="border border-border px-4 py-2">Total a pagar (cliente)</td>
                  <td className="border border-border px-4 py-2 text-right">
                    <Money tone={clientLines.every((c) => c.paid) && clientLines.length > 0 ? "success" : "loss"}>
                      {fmt(summary.total)}
                    </Money>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Self-paying guests annex — informative, not part of the client bill */}
        {invitados.length > 0 && (
          <div>
            <h2 className="font-heading font-medium mb-2">Consumos de invitados (pagan aparte)</h2>
            <table className="w-full text-sm border border-border">
              <thead>
                <tr className="bg-muted/40">
                  <th className="border border-border px-3 py-2 text-left">Invitado</th>
                  <th className="border border-border px-3 py-2 text-left">Detalle</th>
                  <th className="border border-border px-3 py-2 text-right">Total</th>
                  <th className="border border-border px-3 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {invitados.map((g) => (
                  <tr key={g.label}>
                    <td className="border border-border px-3 py-2 font-medium">{g.label}</td>
                    <td className="border border-border px-3 py-2 text-muted-foreground">
                      {g.lines
                        .map((l) => `${l.insumo.name} × ${l.qty} (${tableLabel(l.tableNumber)})`)
                        .join(", ")}
                    </td>
                    <td className="border border-border px-3 py-2 text-right">{fmt(g.total)}</td>
                    <td className="border border-border px-3 py-2">
                      {g.paid ? (
                        <span className="text-emerald-700 font-medium">Pagado</span>
                      ) : (
                        <span className="text-amber-700 font-medium">Pendiente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Void transparency: what was charged and then voided, with reason. */}
        {removed.length > 0 && (
          <div>
            <h2 className="font-heading font-medium mb-2">Anulaciones</h2>
            <table className="w-full text-sm border border-border">
              <thead>
                <tr className="bg-muted/40">
                  <th className="border border-border px-3 py-2 text-left">Mesa</th>
                  <th className="border border-border px-3 py-2 text-left">Insumo</th>
                  <th className="border border-border px-3 py-2 text-center">Cant.</th>
                  <th className="border border-border px-3 py-2 text-right">Importe</th>
                  <th className="border border-border px-3 py-2 text-left">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {removed.map((r) => (
                  <tr key={r.id}>
                    <td className="border border-border px-3 py-2">{tableLabel(r.tableNumber)}</td>
                    <td className="border border-border px-3 py-2">{r.insumoName}</td>
                    <td className="border border-border px-3 py-2 text-center">{r.qty}</td>
                    <td className="border border-border px-3 py-2 text-right text-muted-foreground">
                      {fmt(r.unitPrice * r.qty)}
                    </td>
                    <td className="border border-border px-3 py-2 text-muted-foreground">
                      {removalReasonLabel(r.reason)}
                      {r.reasonText ? ` — ${r.reasonText}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">Comprobante no válido como factura</p>
      </div>
    </>
  );
}
