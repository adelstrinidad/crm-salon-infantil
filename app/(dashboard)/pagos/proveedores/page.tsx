import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCompraPayments } from "@/lib/compras/compraService";
import { listAccounts } from "@/lib/finanzas/finanzasService";
import { listProveedores } from "@/lib/proveedores/proveedorService";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Money } from "@/components/ui/money";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectFilter } from "@/components/ui/select-filter";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { PagarCompraButton } from "./PagarCompraButton";
import { AnularPagoButton } from "@/components/pagos/AnularPagoButton";

type Props = {
  searchParams: Promise<{ from?: string; to?: string; proveedorId?: string; estado?: string }>;
};

function localDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const fmtDate = (d: Date) => new Date(d).toLocaleDateString("es-AR");

export default async function PagosProveedoresPage({ searchParams }: Props) {
  const params = await searchParams;

  const from = params.from ? new Date(params.from + "T00:00:00") : undefined;
  const to = params.to ? new Date(params.to + "T23:59:59") : undefined;
  const proveedorId = params.proveedorId || undefined;
  const estado = params.estado ?? "";
  const paid = estado === "pagada" ? true : estado === "pendiente" ? false : undefined;

  const [compras, accounts, proveedores] = await Promise.all([
    getCompraPayments({ from, to, proveedorId, paid }),
    listAccounts(),
    listProveedores(),
  ]);

  const totalPendiente = compras.filter((c) => !c.paid).reduce((s, c) => s + c.total, 0);
  const totalPagado = compras.filter((c) => c.paid).reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pago a proveedores"
        action={
          <Link href="/compras/nuevo" className={cn(buttonVariants())}>
            Nueva compra
          </Link>
        }
      />

      {/* Filters */}
      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1 w-full sm:w-44">
            <label className="text-sm font-medium">Fecha desde</label>
            <Input type="date" name="from" defaultValue={from ? localDate(from) : ""} />
          </div>
          <div className="space-y-1 w-full sm:w-40">
            <label className="text-sm font-medium">Hasta</label>
            <Input type="date" name="to" defaultValue={to ? localDate(to) : ""} />
          </div>
          <div className="space-y-1 w-full sm:w-48">
            <label className="text-sm font-medium">Proveedor</label>
            <SelectFilter
              name="proveedorId"
              defaultValue={params.proveedorId ?? ""}
              allLabel="Todos"
              options={proveedores.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
          <div className="space-y-1 w-full sm:w-44">
            <label className="text-sm font-medium">Estado</label>
            <SelectFilter
              name="estado"
              defaultValue={params.estado ?? ""}
              allLabel="Todas"
              options={[
                { value: "pendiente", label: "Pendiente" },
                { value: "pagada", label: "Pagada" },
              ]}
            />
          </div>
          <Button type="submit">Filtrar</Button>
        </form>
      </Card>

      {compras.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Sin compras en el período"
          description="Registrá una compra de insumos a un proveedor para verla acá y poder pagarla."
          action={
            <Link href="/compras/nuevo" className={cn(buttonVariants())}>
              Nueva compra
            </Link>
          }
        />
      ) : (
        <>
          {/* Summary */}
          <div className="flex gap-6 text-sm px-1">
            <span>
              <span className="text-muted-foreground">Pendiente: </span>
              <Money tone="loss" className="font-medium">{formatMoney(totalPendiente)}</Money>
            </span>
            <span>
              <span className="text-muted-foreground">Pagado: </span>
              <Money tone="success" className="font-medium">{formatMoney(totalPagado)}</Money>
            </span>
            <span className="text-muted-foreground">{compras.length} compra{compras.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Proveedor</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-right">Insumos</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Fecha de pago</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {compras.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-2 font-medium">
                      <Link href={`/compras/${c.id}`} className="hover:underline">{c.proveedor.name}</Link>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{fmtDate(c.date)}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{c._count.lines}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatMoney(c.total)}</td>
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                      {c.paidAt ? fmtDate(c.paidAt) : "—"}
                    </td>
                    <td className="px-4 py-2">
                      {c.paid ? (
                        <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
                          Pagada
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {!c.paid && accounts.length > 0 && (
                        <PagarCompraButton id={c.id} accounts={accounts} />
                      )}
                      {!c.paid && accounts.length === 0 && (
                        <span className="text-xs text-muted-foreground">Sin cuentas</span>
                      )}
                      {c.paid && <AnularPagoButton kind="compra" id={c.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
