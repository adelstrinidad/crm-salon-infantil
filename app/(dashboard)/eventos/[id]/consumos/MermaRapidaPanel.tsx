"use client";

import { useState } from "react";
import { adjustStockAction } from "@/app/(dashboard)/insumos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InsumoOption = { id: string; name: string; stockQty: number };

// Breakage/spill that never reached a bill (a dropped tray): plain merma stock
// adjustment, pre-tagged with the event so the ledger tells where it happened.
// Charged-line breakage goes through the void modal with reason "merma" instead.
export function MermaRapidaPanel({
  eventName,
  insumos,
}: {
  eventName: string;
  insumos: InsumoOption[];
}) {
  const [open, setOpen] = useState(false);
  const [insumoId, setInsumoId] = useState("");
  const [qty, setQty] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await adjustStockAction({
      insumoId,
      op: "merma",
      qty,
      reason: `Merma en evento — ${eventName}`,
    });
    setLoading(false);
    if (!result.ok) setError(result.error);
    else {
      setOpen(false);
      setQty("1");
      setInsumoId("");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Registrar merma
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle>Registrar merma</SectionTitle>
              <Button onClick={() => setOpen(false)} variant="ghost" size="icon-sm" aria-label="Cerrar">
                ×
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Rotura o derrame sin cargo a ninguna mesa. Si la línea ya estaba
              cargada, anulala con motivo “Merma”.
            </p>

            <Card className="p-0 border-0 shadow-none space-y-3">
              <div className="space-y-1">
                <Label>Insumo *</Label>
                <Select
                  items={Object.fromEntries(insumos.map((i) => [i.id, i.name]))}
                  value={insumoId}
                  onValueChange={(v) => setInsumoId(v as string)}
                >
                  <SelectTrigger className="w-full" aria-label="Insumo de merma">
                    <SelectValue placeholder="Seleccionar…" />
                  </SelectTrigger>
                  <SelectContent>
                    {insumos.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name} (stock: {i.stockQty})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="merma-qty">Cantidad *</Label>
                <Input
                  id="merma-qty"
                  type="number"
                  min="1"
                  step="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
            </Card>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button
                onClick={handle}
                disabled={loading || !insumoId || !qty}
                variant="destructive"
                className="flex-1"
              >
                {loading ? "Registrando…" : "Registrar merma"}
              </Button>
              <Button onClick={() => setOpen(false)} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
