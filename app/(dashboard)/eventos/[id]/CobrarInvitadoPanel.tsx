"use client";

import { useState } from "react";
import { cobrarConsumosInvitadoAction } from "./consumos-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/ui/section-title";
import { Money } from "@/components/ui/money";
import { formatMoney } from "@/lib/money";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Account = { id: string; name: string };

type Props = {
  eventId: string;
  payerLabel: string; // who the guest is
  total: number; // cents pending for this guest — recomputed server-side on submit
  accounts: Account[];
};

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Charge one self-paying guest's pending lines — available at any moment after
// the event starts (a guest leaving early settles on the spot).
export function CobrarInvitadoPanel({ eventId, payerLabel, total, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await cobrarConsumosInvitadoAction(eventId, payerLabel, {
      accountId,
      description: "",
      date,
    });
    setLoading(false);
    if (!result.ok) setError(result.error);
    else setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        Cobrar
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle>Cobrar a {payerLabel}</SectionTitle>
              <Button onClick={() => setOpen(false)} variant="ghost" size="icon-sm" aria-label="Cerrar">
                ×
              </Button>
            </div>

            <p className="text-sm">
              <span className="text-muted-foreground">Pendiente: </span>
              <Money tone="loss" className="font-semibold">{formatMoney(total)}</Money>
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Cuenta *</Label>
                <Select
                  items={Object.fromEntries(accounts.map((a) => [a.id, a.name]))}
                  value={accountId}
                  onValueChange={(v) => setAccountId(v as string)}
                >
                  <SelectTrigger className="w-full" aria-label="Cuenta">
                    <SelectValue placeholder="Seleccionar…" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Fecha</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button onClick={handle} disabled={loading || !accountId} className="flex-1">
                {loading ? "Cobrando…" : "Confirmar cobro"}
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
