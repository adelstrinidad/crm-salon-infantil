import { notFound } from "next/navigation";
import { getEventWithAll } from "@/lib/events/eventProviderLines";
import { getMovementsByEvent } from "@/lib/finanzas/finanzasService";
import { getClient } from "@/lib/clients/clientService";
import { PrintButton } from "./PrintButton";
import type { EventState } from "@/lib/events/schema";

type Props = { params: Promise<{ id: string }> };

const STATE_LABELS: Record<EventState, string> = {
  PRESUPUESTADO: "Presupuestado",
  RESERVADO: "Reservado",
  SENADO: "Señado",
  PAGADO: "Pagado",
  CERRADO: "Cerrado",
  SUSPENDIDO: "Suspendido",
};

function fmt(n: number) {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(d));
}

export default async function PresupuestoPage({ params }: Props) {
  const { id } = await params;

  const [event, movements] = await Promise.all([
    getEventWithAll(id).catch(() => null),
    getMovementsByEvent(id),
  ]);
  if (!event) return notFound();

  const client = event.clientId ? await getClient(event.clientId).catch(() => null) : null;

  const servicePrice = event.services.reduce((s, l) => s + l.service.price * l.qty, 0);
  const totalBonificado = event.bonificados.reduce((s, l) => s + l.service.price * l.qty, 0);
  const subtotal = servicePrice - totalBonificado;
  const totalPrice = event.totalPrice > 0 ? event.totalPrice : subtotal;
  const cobrado = movements.filter((m) => m.type === "INGRESO").reduce((s, m) => s + m.amount, 0);
  const saldo = totalPrice - cobrado;

  return (
    <>
      {/* Print controls — hidden when printing */}
      <div className="flex gap-3 p-4 print:hidden">
        <PrintButton />
        <a href={`/eventos/${id}`} className="px-4 py-2 text-sm border rounded-lg hover:bg-muted/50">
          ← Volver al evento
        </a>
      </div>

      {/* ── PAGE 1: Budget detail ── */}
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-6 print:px-0 print:py-0 print:max-w-none">

        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Presupuesto</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Código del evento: <strong>{id.slice(-6).toUpperCase()}</strong>
            </p>
          </div>
          <div className="text-sm text-right text-muted-foreground">
            <p>Fecha: {new Date().toLocaleDateString("es-AR")}</p>
          </div>
        </div>

        {/* Client + Venue info */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Cliente</p>
            <p className="font-medium">{event.clientName}</p>
            {client?.phone && <p className="text-muted-foreground">{client.phone}</p>}
            {client?.email && <p className="text-muted-foreground">{client.email}</p>}
            {client?.notes && <p className="text-muted-foreground italic">{client.notes}</p>}
          </div>
          <div className="space-y-1 text-right">
            <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Salón</p>
            <p className="font-medium">Salón Infantil</p>
          </div>
        </div>

        {/* Event detail grid */}
        <div className="border rounded-lg p-4 space-y-3 text-sm">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Detalle del evento</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-muted-foreground text-xs">Nombre del evento</p>
              <p className="font-medium">{event.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Tipo</p>
              <p>{event.eventType}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Estado</p>
              <p>{STATE_LABELS[event.state as EventState]}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Fecha inicio</p>
              <p>{fmtDate(event.startAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Finalización</p>
              <p>{fmtDate(event.endAt)}</p>
            </div>
          </div>
          {event.details && (
            <div className="border-t pt-2">
              <p className="text-muted-foreground text-xs mb-1">Detalle:</p>
              <p className="whitespace-pre-wrap">{event.details}</p>
            </div>
          )}
        </div>

        {/* Services table */}
        {event.services.length > 0 && (
          <div>
            <h2 className="font-semibold mb-2">Servicios</h2>
            <table className="w-full text-sm border-collapse border">
              <thead>
                <tr className="bg-muted/40">
                  <th className="border px-3 py-2 text-left">Nombre</th>
                  <th className="border px-3 py-2 text-left">Descripción</th>
                  <th className="border px-3 py-2 text-center">Cant.</th>
                  <th className="border px-3 py-2 text-right">Precio/u</th>
                  <th className="border px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {event.services.map((l) => (
                  <tr key={l.id}>
                    <td className="border px-3 py-2">{l.service.name}</td>
                    <td className="border px-3 py-2 text-muted-foreground">{l.service.description ?? ""}</td>
                    <td className="border px-3 py-2 text-center">{l.qty}</td>
                    <td className="border px-3 py-2 text-right">{fmt(l.service.price)}</td>
                    <td className="border px-3 py-2 text-right font-medium">{fmt(l.service.price * l.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bonificados */}
        {event.bonificados.length > 0 && (
          <div>
            <h2 className="font-semibold mb-2">Servicios bonificados</h2>
            <table className="w-full text-sm border-collapse border">
              <thead>
                <tr className="bg-muted/40">
                  <th className="border px-3 py-2 text-left">Servicio</th>
                  <th className="border px-3 py-2 text-center">Cant.</th>
                  <th className="border px-3 py-2 text-right">Valor bonificado</th>
                </tr>
              </thead>
              <tbody>
                {event.bonificados.map((l) => (
                  <tr key={l.id}>
                    <td className="border px-3 py-2">{l.service.name}</td>
                    <td className="border px-3 py-2 text-center">{l.qty}</td>
                    <td className="border px-3 py-2 text-right text-orange-600">-{fmt(l.service.price * l.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Financial summary */}
        <div className="flex justify-end">
          <table className="text-sm border-collapse border min-w-[240px]">
            <tbody>
              <tr className="bg-muted/40">
                <td className="border px-4 py-2 font-medium">Subtotal servicios</td>
                <td className="border px-4 py-2 text-right">{fmt(servicePrice)}</td>
              </tr>
              {totalBonificado > 0 && (
                <tr>
                  <td className="border px-4 py-2 text-muted-foreground">Bonificaciones</td>
                  <td className="border px-4 py-2 text-right text-orange-600">-{fmt(totalBonificado)}</td>
                </tr>
              )}
              <tr className="font-semibold">
                <td className="border px-4 py-2">Total</td>
                <td className="border px-4 py-2 text-right">{fmt(totalPrice)}</td>
              </tr>
              {cobrado > 0 && (
                <tr>
                  <td className="border px-4 py-2 text-muted-foreground">Abonado</td>
                  <td className="border px-4 py-2 text-right text-green-600">-{fmt(cobrado)}</td>
                </tr>
              )}
              <tr className={`font-semibold ${saldo > 0 ? "text-red-600" : "text-green-600"}`}>
                <td className="border px-4 py-2">Saldo</td>
                <td className="border px-4 py-2 text-right">{fmt(saldo)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground text-center">Comprobante no válido como factura</p>
      </div>

      {/* ── PAGE 2: Terms (print only / separate section) ── */}
      <div className="max-w-3xl mx-auto px-8 py-6 print:px-0 print:break-before-page border-t mt-8 print:mt-0 print:border-none">

        {/* Header repeated */}
        <div className="flex items-start justify-between border-b pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Presupuesto</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Código del evento: <strong>{id.slice(-6).toUpperCase()}</strong>
            </p>
          </div>
          <div className="text-sm text-right text-muted-foreground">
            <p>Fecha: {new Date().toLocaleDateString("es-AR")}</p>
          </div>
        </div>

        <h2 className="font-semibold text-base mb-4">Términos y condiciones</h2>
        <ul className="space-y-3 text-sm">
          <li>
            <span className="font-medium">Validez del presupuesto: </span>
            El presupuesto tiene una validez de 10 días desde la fecha de emisión.
          </li>
          <li>
            <span className="font-medium">Reservas: </span>
            La fecha quedará confirmada únicamente con el pago de la seña/anticipo acordado. El saldo restante deberá abonarse en los plazos establecidos previamente.
          </li>
          <li>
            <span className="font-medium">Normas de uso del salón: </span>
            No se permiten mascotas, alimentos ni bebidas que no hayan sido autorizados. El cliente se compromete a respetar la capacidad máxima del salón.
          </li>
          <li>
            <span className="font-medium">Responsabilidad por daños: </span>
            El cliente será responsable por cualquier daño ocasionado a las instalaciones, mobiliario o equipamiento durante el evento.
          </li>
          <li>
            <span className="font-medium">Cancelaciones: </span>
            En caso de cancelación por parte del cliente, el anticipo abonado no será reembolsable. Podrán evaluarse reprogramaciones sujetas a disponibilidad del salón.
          </li>
        </ul>

        {/* Signature area */}
        <div className="grid grid-cols-2 gap-12 mt-12 text-sm text-center">
          <div>
            <div className="border-t border-gray-400 pt-2">Firma del cliente</div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2">Firma del salón</div>
          </div>
        </div>
      </div>
    </>
  );
}
