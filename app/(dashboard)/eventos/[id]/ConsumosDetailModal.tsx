"use client";

// "Ver detalle" for the event's Consumos card: the full per-line breakdown,
// grouped by table, lives here in a themed dialog. The card itself shows only
// the Vendido/Cobrado/Pendiente summary and the actionable bits (cobrar
// invitado, registrar pago). Lines are passed as plain rows from the server.
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { consumoLineTotal } from "@/lib/consumos/calc";
import { tableLabel, PAYER_TYPE_LABELS, type PayerType } from "@/lib/consumos/schema";
import { formatMoney } from "@/lib/money";

export type ConsumoDetailRow = {
  id: string;
  tableNumber: number;
  insumoName: string;
  payerType: string;
  payerLabel: string | null;
  qty: number;
  unitPrice: number; // cents
  paid: boolean;
};

function payerText(row: ConsumoDetailRow): string {
  return row.payerType === "INVITADO"
    ? (row.payerLabel ?? "Invitado")
    : (PAYER_TYPE_LABELS[row.payerType as PayerType] ?? row.payerType);
}

export function ConsumosDetailModal({ lines }: { lines: ConsumoDetailRow[] }) {
  // Group by table, ascending — same ordering the capture page uses.
  const tables = [...new Set(lines.map((l) => l.tableNumber))].sort((a, b) => a - b);
  const grandTotal = lines.reduce((s, l) => s + consumoLineTotal(l), 0);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" aria-label="Ver detalle de consumos">
            Ver detalle
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle de consumos</DialogTitle>
        </DialogHeader>
        {/* Header + footer stay fixed; only the table list scrolls. */}
        <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
          {tables.map((t) => {
            const tableLines = lines.filter((l) => l.tableNumber === t);
            const tableTotal = tableLines.reduce((s, l) => s + consumoLineTotal(l), 0);
            return (
              <div key={t}>
                <p className="text-sm font-medium mb-1">{tableLabel(t)}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                      <tr>
                        <th className="px-3 py-2 text-left">Insumo</th>
                        <th className="px-3 py-2 text-left">Paga</th>
                        <th className="px-3 py-2 text-center">Cant.</th>
                        <th className="px-3 py-2 text-right">Precio/u</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {tableLines.map((l) => (
                        <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-3 py-2 font-medium">{l.insumoName}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {payerText(l)}
                            {l.paid && (
                              <span className="ml-1.5 inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2 py-0.5 text-xs font-medium">
                                Pagado
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">{l.qty}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(l.unitPrice)}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatMoney(consumoLineTotal(l))}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="px-3 py-2" colSpan={4}>
                          Total {tableLabel(t)}
                        </td>
                        <td className="px-3 py-2 text-right">{formatMoney(tableTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
          <span>Total consumos</span>
          <span>{formatMoney(grandTotal)}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
