import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompra } from "@/lib/compras/compraService";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { formatMoney } from "@/lib/money";
import { INSUMO_UNIT_LABELS, type InsumoUnit } from "@/lib/insumos/schema";
import { cn } from "@/lib/utils";
import { DeleteCompraButton } from "../DeleteCompraButton";

type Props = { params: Promise<{ id: string }> };

const fmtDate = (d: Date) => new Date(d).toLocaleDateString("es-AR");
const unitLabel = (u: string) => INSUMO_UNIT_LABELS[u as InsumoUnit] ?? u;

export default async function CompraDetailPage({ params }: Props) {
  const { id } = await params;
  const compra = await getCompra(id);
  if (!compra) return notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Compra — ${compra.proveedor.name}`}
        action={
          <Link href="/compras" className={cn(buttonVariants({ variant: "outline" }))}>
            Volver
          </Link>
        }
      />

      <Card className="p-4 space-y-2 text-sm">
        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <span><span className="text-muted-foreground">Proveedor: </span>{compra.proveedor.name}</span>
          <span><span className="text-muted-foreground">Fecha: </span>{fmtDate(compra.date)}</span>
          <span>
            <span className="text-muted-foreground">Estado: </span>
            {compra.paid ? (
              <span className="text-success font-medium">Pagada{compra.paidAt ? ` · ${fmtDate(compra.paidAt)}` : ""}</span>
            ) : (
              <span className="text-amber-900 font-medium">Pendiente</span>
            )}
          </span>
        </div>
        {compra.notes && <p className="text-muted-foreground">{compra.notes}</p>}
      </Card>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Insumo</th>
              <th className="px-4 py-3 text-right font-medium">Cantidad</th>
              <th className="px-4 py-3 text-right font-medium">Costo unit.</th>
              <th className="px-4 py-3 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {compra.lines.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-2 font-medium">{l.insumo.name}</td>
                <td className="px-4 py-2 text-right">{l.qty} {unitLabel(l.insumo.unit)}</td>
                <td className="px-4 py-2 text-right text-muted-foreground">{formatMoney(l.unitCost)}</td>
                <td className="px-4 py-2 text-right font-medium">{formatMoney(l.qty * l.unitCost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td className="px-4 py-3 font-medium" colSpan={3}>Total</td>
              <td className="px-4 py-3 text-right">
                <Money className="font-semibold">{formatMoney(compra.total)}</Money>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!compra.paid && (
        <div className="flex items-center gap-3">
          <Link href="/pagos/proveedores" className={cn(buttonVariants())}>
            Ir a pagar
          </Link>
          <DeleteCompraButton id={compra.id} />
        </div>
      )}
    </div>
  );
}
