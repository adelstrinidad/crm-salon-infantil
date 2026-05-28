import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventWithAll } from "@/lib/events/eventProviderLines";
import { getMovementsByEvent, listAccounts } from "@/lib/finanzas/finanzasService";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventState } from "@/lib/events/schema";
import { RegistrarCobroPanel } from "./RegistrarCobroPanel";

type Props = { params: Promise<{ id: string }> };

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

function fmt(n: number) {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(d));
}

export default async function EventoDetailPage({ params }: Props) {
  const { id } = await params;

  const [event, movements, accounts] = await Promise.all([
    getEventWithAll(id).catch(() => null),
    getMovementsByEvent(id),
    listAccounts(),
  ]);
  if (!event) return notFound();

  const serviceCost = event.services.reduce((s, l) => s + l.service.cost * l.qty, 0);
  const servicePrice = event.services.reduce((s, l) => s + l.service.price * l.qty, 0);
  const providerCost = event.providers.reduce((s, l) => s + l.provider.cost, 0);
  const totalBonificado = event.bonificados.reduce((s, l) => s + l.service.price * l.qty, 0);
  const totalCost = serviceCost + providerCost;
  const subtotal = servicePrice - totalBonificado;
  const profit = subtotal - totalCost;

  const cobrado = movements
    .filter((m) => m.type === "INGRESO")
    .reduce((s, m) => s + m.amount, 0);
  const saldo = event.totalPrice - cobrado;

  let cobradoAcumulado = 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            <Link href="/eventos" className="hover:underline">Eventos</Link>
            {" / "}
            {event.name}
          </p>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <span className={cn(
            "inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium",
            STATE_COLORS[event.state as EventState]
          )}>
            {STATE_LABELS[event.state as EventState]}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/eventos/${id}/editar`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Editar
          </Link>
          <Link
            href={`/eventos/${id}/presupuesto`}
            target="_blank"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Generar presupuesto
          </Link>
          <RegistrarCobroPanel eventId={id} saldo={saldo} accounts={accounts} />
        </div>
      </div>

      {/* Info + Financial summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información básica */}
        <div className="border rounded-lg p-4 space-y-2 text-sm">
          <h2 className="font-semibold text-base mb-3">Información básica</h2>
          <div className="space-y-1.5">
            <div>
              <span className="font-medium">Cliente: </span>
              <span>{event.clientName}</span>
            </div>
            <div>
              <span className="font-medium">Tipo de evento: </span>
              <span>{event.eventType}</span>
            </div>
            <div>
              <span className="font-medium">Estado: </span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                STATE_COLORS[event.state as EventState]
              )}>
                {STATE_LABELS[event.state as EventState]}
              </span>
            </div>
            <div>
              <span className="font-medium">Inicio: </span>
              <span>{fmtDate(event.startAt)}</span>
            </div>
            <div>
              <span className="font-medium">Fin: </span>
              <span>{fmtDate(event.endAt)}</span>
            </div>
            {event.details && (
              <div>
                <p className="font-medium mb-0.5">Detalle:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.details}</p>
              </div>
            )}
            {event.notes && (
              <div>
                <p className="font-medium mb-0.5">Notas:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contabilidad */}
        <div className="border rounded-lg p-4 text-sm">
          <h2 className="font-semibold text-base mb-3">Contabilidad</h2>
          <table className="w-full border-collapse mb-4">
            <tbody>
              <tr className="border-b">
                <td className="py-1.5 text-muted-foreground">Precio total</td>
                <td className="py-1.5 text-right font-medium">{fmt(event.totalPrice)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1.5 text-muted-foreground">Cobrado</td>
                <td className="py-1.5 text-right font-medium text-green-600">{fmt(cobrado)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1.5 text-muted-foreground">Saldo</td>
                <td className={cn("py-1.5 text-right font-medium", saldo > 0 ? "text-red-600" : "text-green-600")}>
                  {fmt(saldo)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="space-y-1 pt-2 border-t">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo servicios</span>
              <span>{fmt(serviceCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo prestadores</span>
              <span>{fmt(providerCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total bonificado</span>
              <span className="text-orange-600">-{fmt(totalBonificado)}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="font-medium">Costo total</span>
              <span className="font-medium">{fmt(totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Ganancia estimada</span>
              <span className={cn("font-medium", profit >= 0 ? "text-green-600" : "text-red-600")}>
                {fmt(profit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold text-base mb-3">Servicios</h2>
        {event.services.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin servicios asignados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left bg-muted/40">
                  <th className="py-2 px-3">Nombre</th>
                  <th className="py-2 px-3">Proveedor</th>
                  <th className="py-2 px-3 text-center">Cant.</th>
                  <th className="py-2 px-3 text-right">Costo/u</th>
                  <th className="py-2 px-3 text-right">Precio/u</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {event.services.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-muted/40">
                    <td className="py-2 px-3 font-medium">{l.service.name}</td>
                    <td className="py-2 px-3 text-muted-foreground">{l.service.proveedor?.name ?? "—"}</td>
                    <td className="py-2 px-3 text-center">{l.qty}</td>
                    <td className="py-2 px-3 text-right">{fmt(l.service.cost)}</td>
                    <td className="py-2 px-3 text-right">{fmt(l.service.price)}</td>
                    <td className="py-2 px-3 text-right font-medium">{fmt(l.service.price * l.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bonificados */}
      {event.bonificados.length > 0 && (
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-base mb-3">Bonificados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left bg-muted/40">
                  <th className="py-2 px-3">Servicio</th>
                  <th className="py-2 px-3 text-center">Cant.</th>
                  <th className="py-2 px-3 text-right">Valor bonificado</th>
                </tr>
              </thead>
              <tbody>
                {event.bonificados.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-muted/40">
                    <td className="py-2 px-3">{l.service.name}</td>
                    <td className="py-2 px-3 text-center">{l.qty}</td>
                    <td className="py-2 px-3 text-right text-orange-600">-{fmt(l.service.price * l.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prestadores */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold text-base mb-3">Prestadores</h2>
        {event.providers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin prestadores asignados.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left bg-muted/40">
                <th className="py-2 px-3">Nombre</th>
                <th className="py-2 px-3">Rol</th>
                <th className="py-2 px-3 text-right">Costo</th>
                <th className="py-2 px-3">Pago</th>
              </tr>
            </thead>
            <tbody>
              {event.providers.map((l) => (
                <tr key={l.id} className="border-b hover:bg-muted/40">
                  <td className="py-2 px-3 font-medium">{l.provider.name}</td>
                  <td className="py-2 px-3 text-muted-foreground">{l.provider.role ?? "—"}</td>
                  <td className="py-2 px-3 text-right">{fmt(l.provider.cost)}</td>
                  <td className="py-2 px-3">
                    {l.paid ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        Pagado {l.paidAt ? new Date(l.paidAt).toLocaleDateString("es-AR") : ""}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Movimientos */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold text-base mb-3">Movimientos</h2>

        {/* Summary cards */}
        <div className="flex flex-wrap gap-4 mb-4">
          {[
            { label: "Precio total", value: fmt(event.totalPrice) },
            { label: "Cobrado", value: fmt(cobrado), color: "text-green-600" },
            { label: "Saldo", value: fmt(saldo), color: saldo > 0 ? "text-red-600" : "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="border rounded px-4 py-2 text-sm min-w-[120px]">
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className={cn("font-semibold text-base", color ?? "")}>{value}</p>
            </div>
          ))}
        </div>

        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin movimientos registrados para este evento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left bg-muted/40">
                  <th className="py-2 px-3">Fecha</th>
                  <th className="py-2 px-3">Descripción</th>
                  <th className="py-2 px-3">Cuenta</th>
                  <th className="py-2 px-3">Tipo</th>
                  <th className="py-2 px-3 text-right">Monto</th>
                  <th className="py-2 px-3 text-right">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => {
                  if (m.type === "INGRESO") cobradoAcumulado += m.amount;
                  return (
                    <tr key={m.id} className="border-b hover:bg-muted/40">
                      <td className="py-2 px-3 whitespace-nowrap">{new Date(m.date).toLocaleDateString("es-AR")}</td>
                      <td className="py-2 px-3">{m.description ?? "—"}</td>
                      <td className="py-2 px-3 text-muted-foreground">{m.account.name}</td>
                      <td className="py-2 px-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {m.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-medium">{fmt(m.amount)}</td>
                      <td className="py-2 px-3 text-right text-muted-foreground">
                        {m.type === "INGRESO" ? fmt(cobradoAcumulado) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
