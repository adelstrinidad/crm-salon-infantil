"use client";

// "Ver detalle" for the event's Movimientos card: the full movement table lives
// here in a themed dialog so the card itself only shows a summary. Rows are
// precomputed server-side (account name flattened, running "Acumulado" already
// resolved) so this component stays presentational.
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signTone } from "@/components/ui/money";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export type MovimientoRow = {
  id: string;
  date: string; // ISO; formatted here
  description: string | null;
  accountName: string;
  type: string;
  amount: number; // cents
  acumulado: number | null; // running cobrado; null for non-counting rows
};

export function MovimientosDetailModal({ rows }: { rows: MovimientoRow[] }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" aria-label="Ver detalle de movimientos">
            Ver detalle
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Movimientos del evento</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Descripción</th>
                <th className="px-3 py-2 text-left">Cuenta</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-right">Monto</th>
                <th className="px-3 py-2 text-right">Acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((m) => {
                const tone = signTone(m.type === "INGRESO" ? 1 : -1);
                return (
                  <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(m.date).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-3 py-2">{m.description ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.accountName}</td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          tone === "success"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-loss/10 text-loss border-loss/20",
                        )}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{formatMoney(m.amount)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {m.acumulado !== null ? formatMoney(m.acumulado) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
