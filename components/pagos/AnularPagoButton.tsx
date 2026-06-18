"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REVERSAL_REASONS,
  type ReversalReason,
} from "@/lib/pagos/reversalReasons";
import { anularPagoAction } from "@/app/(dashboard)/pagos/anular-actions";

type Props = {
  // One of the four payable kinds (event-provider | service | staff | compra).
  kind: string;
  id: string;
};

const REASON_ITEMS = Object.fromEntries(
  Object.entries(REVERSAL_REASONS).map(([k, v]) => [k, v.label]),
);

// Reverse a settled payment in place: expand → pick a reason → enter the manager
// code → Confirmar. Mirrors PagarButton's two-step inline pattern but gated by
// the manager code (the reversal moves money). On success the row re-renders as
// pending via the action's revalidate.
export function AnularPagoButton({ kind, id }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReversalReason>("error-monto");
  const [reasonText, setReasonText] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setOpen(false);
    setReason("error-monto");
    setReasonText("");
    setManagerCode("");
    setError(null);
  }

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await anularPagoAction({
      kind,
      id,
      managerCode,
      reason,
      reasonText: reason === "otro" ? reasonText : undefined,
    });
    setLoading(false);
    if (!result.ok) setError(result.error ?? "Error");
    else reset();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="ghost" size="xs">
        Anular pago
      </Button>
    );
  }

  const needsText = reason === "otro";
  return (
    <div className="flex flex-col gap-2 items-stretch max-w-xs">
      <div className="flex flex-col gap-1">
        <Label htmlFor={`anular-motivo-${id}`} className="text-xs">
          Motivo
        </Label>
        <Select
          items={REASON_ITEMS}
          value={reason}
          onValueChange={(v) => setReason(v as ReversalReason)}
        >
          <SelectTrigger id={`anular-motivo-${id}`} aria-label="Motivo" className="w-full">
            <SelectValue placeholder="Motivo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REVERSAL_REASONS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {needsText && (
        <div className="flex flex-col gap-1">
          <Label htmlFor={`anular-detalle-${id}`} className="text-xs">
            Detalle
          </Label>
          <Input
            id={`anular-detalle-${id}`}
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="Motivo del ajuste"
          />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <Label htmlFor={`anular-codigo-${id}`} className="text-xs">
          Código del encargado *
        </Label>
        <Input
          id={`anular-codigo-${id}`}
          type="password"
          value={managerCode}
          onChange={(e) => setManagerCode(e.target.value)}
          placeholder="••••"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handle}
          disabled={loading || !managerCode || (needsText && !reasonText.trim())}
          variant="destructive"
          size="xs"
          className="flex-1"
        >
          {loading ? "…" : "Confirmar anulación"}
        </Button>
        <Button onClick={reset} variant="ghost" size="xs" className="flex-1">
          Cancelar
        </Button>
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
