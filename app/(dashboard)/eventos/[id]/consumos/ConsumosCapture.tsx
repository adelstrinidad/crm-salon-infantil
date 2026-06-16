"use client";

import { useState } from "react";
import { Trash2, UtensilsCrossed } from "lucide-react";
import { addConsumoAction, removeConsumoAction } from "../consumos-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/money";
import { computeConsumosSummary } from "@/lib/consumos/calc";
import {
  TABLE_NUMBERS,
  tableLabel,
  PAYER_TYPES,
  PAYER_TYPE_LABELS,
  type PayerType,
} from "@/lib/consumos/schema";
import {
  REMOVAL_REASONS,
  REMOVAL_REASON_KEYS,
  type RemovalReason,
} from "@/lib/consumos/removalReasons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fmt = formatMoney;

type InsumoOption = {
  id: string;
  name: string;
  unit: string;
  stockQty: number;
  eventPrice: number; // cents
};

type ConsumoLine = {
  id: string;
  tableNumber: number;
  qty: number;
  unitPrice: number; // cents
  insumoName: string;
  payerType: string; // "CLIENTE" | "INVITADO"
  payerLabel: string | null;
  paid: boolean;
};

type Props = {
  eventId: string;
  open: boolean; // capture window open (started && not closed)
  lines: ConsumoLine[];
  insumos: InsumoOption[];
};

export function ConsumosCapture({ eventId, open, lines, insumos }: Props) {
  const [tableNumber, setTableNumber] = useState("1");
  const [insumoId, setInsumoId] = useState("");
  const [qty, setQty] = useState("1");
  const [payerType, setPayerType] = useState<PayerType>("CLIENTE");
  const [payerLabel, setPayerLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiding, setVoiding] = useState<ConsumoLine | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = computeConsumosSummary(lines);
  const linesByTable = summary.byTable.map(({ tableNumber: t, total }) => ({
    tableNumber: t,
    total,
    lines: lines.filter((l) => l.tableNumber === t),
  }));

  async function handleAdd() {
    setLoading(true);
    setError(null);
    const result = await addConsumoAction(eventId, {
      insumoId,
      tableNumber: Number(tableNumber),
      qty: Number(qty),
      payerType,
      payerLabel: payerLabel.trim() || undefined,
    });
    setLoading(false);
    if (!result.ok) setError(result.error);
    else setQty("1");
  }


  const insumoItems = Object.fromEntries(insumos.map((i) => [i.id, i.name]));

  return (
    <div className="space-y-6">
      {open && (
        <Card className="p-5 space-y-4">
          <SectionTitle className="text-base">Agregar consumo</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <Label>Mesa *</Label>
              <Select
                items={Object.fromEntries(TABLE_NUMBERS.map((n) => [String(n), tableLabel(n)]))}
                value={tableNumber}
                onValueChange={(v) => setTableNumber(v as string)}
              >
                <SelectTrigger className="w-full" aria-label="Mesa">
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {TABLE_NUMBERS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{tableLabel(n)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Insumo *</Label>
              <Select items={insumoItems} value={insumoId} onValueChange={(v) => setInsumoId(v as string)}>
                <SelectTrigger className="w-full" aria-label="Insumo">
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {insumos.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} — {fmt(i.eventPrice)} (stock: {i.stockQty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="consumo-qty">Cantidad *</Label>
              <Input
                id="consumo-qty"
                type="number"
                min="1"
                step="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Paga *</Label>
              <Select
                items={PAYER_TYPE_LABELS}
                value={payerType}
                onValueChange={(v) => setPayerType(v as PayerType)}
              >
                <SelectTrigger className="w-full" aria-label="Paga">
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {PAYER_TYPES.map((p) => (
                    <SelectItem key={p} value={p}>{PAYER_TYPE_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            {payerType === "INVITADO" && (
              <div className="space-y-1">
                <Label htmlFor="consumo-invitado">Invitado *</Label>
                <Input
                  id="consumo-invitado"
                  type="text"
                  value={payerLabel}
                  onChange={(e) => setPayerLabel(e.target.value)}
                  placeholder="Ej: Tío Juan"
                />
              </div>
            )}
            <Button
              onClick={handleAdd}
              disabled={
                loading || !insumoId || !qty || (payerType === "INVITADO" && !payerLabel.trim())
              }
            >
              {loading ? "Agregando…" : "Agregar"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </Card>
      )}

      {lines.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={UtensilsCrossed}
            title="Sin consumos registrados"
            description="Registrá lo que pida cada mesa durante el evento."
            className="py-8"
          />
        </Card>
      ) : (
        <>
          {linesByTable.map(({ tableNumber: t, total, lines: tableLines }) => (
            <Card key={t} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle className="text-base">{tableLabel(t)}</SectionTitle>
                <span className="text-sm font-medium">{fmt(total)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left">Insumo</th>
                      <th className="px-3 py-2 text-center">Cant.</th>
                      <th className="px-3 py-2 text-right">Precio/u</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      {open && <th className="px-3 py-2 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {tableLines.map((l) => (
                      <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-3 py-2 font-medium">
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            {l.insumoName}
                            {l.payerType === "INVITADO" && (
                              <span className="inline-flex items-center rounded-full border bg-violet-100/70 text-violet-900 border-violet-200 px-2 py-0.5 text-xs font-medium">
                                Invitado: {l.payerLabel}
                              </span>
                            )}
                            {l.paid && (
                              <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2 py-0.5 text-xs font-medium">
                                Pagado
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">{l.qty}</td>
                        <td className="px-3 py-2 text-right">{fmt(l.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-medium">{fmt(l.unitPrice * l.qty)}</td>
                        {open && (
                          <td className="px-3 py-2 text-right">
                            {!l.paid && (
                              <Button
                                onClick={() => setVoiding(l)}
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Anular ${l.insumoName}`}
                                className="text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}

          <Card className="p-5 flex items-center justify-between">
            <span className="font-medium">Total consumos</span>
            <span className="font-semibold text-lg">{fmt(summary.total)}</span>
          </Card>
        </>
      )}

      {voiding && (
        <AnularConsumoModal
          eventId={eventId}
          line={voiding}
          onClose={() => setVoiding(null)}
        />
      )}
    </div>
  );
}

// Voiding a line is a manager-approved operation: reason (+ detail for "otro")
// and the approval code, validated server-side with rate limiting.
function AnularConsumoModal({
  eventId,
  line,
  onClose,
}: {
  eventId: string;
  line: ConsumoLine;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<RemovalReason>("arrepentimiento");
  const [reasonText, setReasonText] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await removeConsumoAction(eventId, line.id, {
      reason,
      reasonText,
      managerCode,
    });
    setLoading(false);
    if (!result.ok) setError(result.error);
    else onClose();
  }

  const reasonItems = Object.fromEntries(
    REMOVAL_REASON_KEYS.map((k) => [k, REMOVAL_REASONS[k].label]),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <SectionTitle>Anular consumo</SectionTitle>
          <Button onClick={onClose} variant="ghost" size="icon-sm" aria-label="Cerrar">
            ×
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {tableLabel(line.tableNumber)} — {line.insumoName} × {line.qty} (
          {fmt(line.unitPrice * line.qty)})
        </p>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Motivo *</Label>
            <Select
              items={reasonItems}
              value={reason}
              onValueChange={(v) => setReason(v as RemovalReason)}
            >
              <SelectTrigger className="w-full" aria-label="Motivo">
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {REMOVAL_REASON_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>{REMOVAL_REASONS[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reason === "merma" && (
              <p className="text-xs text-muted-foreground">
                Merma: el stock no vuelve — la pérdida queda registrada como merma.
              </p>
            )}
          </div>

          {reason === "otro" && (
            <div className="space-y-1">
              <Label htmlFor="anular-detalle">Detalle *</Label>
              <Input
                id="anular-detalle"
                type="text"
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="Explicá el motivo…"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="anular-codigo">Código del encargado *</Label>
            <Input
              id="anular-codigo"
              type="password"
              autoComplete="off"
              value={managerCode}
              onChange={(e) => setManagerCode(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button
            onClick={handle}
            disabled={loading || !managerCode || (reason === "otro" && !reasonText.trim())}
            variant="destructive"
            className="flex-1"
          >
            {loading ? "Anulando…" : "Anular"}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
