"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { registrarCobroAction } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/section-title";
import { Money } from "@/components/ui/money";
import { formatMoney, centsToPesos, parsePesosToCents } from "@/lib/money";
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
  saldo: number;
  accounts: Account[];
};

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const fmt = formatMoney;

export function RegistrarCobroPanel({ eventId, saldo, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [description, setDescription] = useState("");
  // `saldo` is in cents; the input shows pesos.
  const [amount, setAmount] = useState(saldo > 0 ? String(centsToPesos(saldo)) : "");
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await registrarCobroAction(eventId, {
      accountId,
      amount: parsePesosToCents(amount),
      description,
      date,
    });
    setLoading(false);
    if (!result.ok) setError(result.error ?? "Error");
    else {
      setOpen(false);
      setDescription("");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Registrar cobro
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle>Registrar cobro</SectionTitle>
              <Button
                onClick={() => setOpen(false)}
                variant="ghost"
                size="icon-sm"
                aria-label="Cerrar"
              >
                ×
              </Button>
            </div>

            {saldo > 0 && (
              <p className="text-sm">
                <span className="text-muted-foreground">Saldo pendiente: </span>
                <Money tone="loss" className="font-semibold">{fmt(saldo)}</Money>
              </p>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Cuenta *</Label>
                {accounts.length === 0 ? (
                  <EmptyState
                    icon={Wallet}
                    title="Sin cuentas configuradas"
                    description="Necesitás una cuenta para registrar el cobro."
                    action={
                      <Link
                        href="/finanzas/cuentas/nueva"
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Crear cuenta
                      </Link>
                    }
                    className="py-6"
                  />
                ) : (
                  <Select
                    items={Object.fromEntries(accounts.map((a) => [a.id, a.name]))}
                    value={accountId}
                    onValueChange={(v) => setAccountId(v as string)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar…" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-1">
                <Label>Descripción / Concepto</Label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Seña, Saldo final…"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Importe *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button
                onClick={handle}
                disabled={loading || !accountId || !amount}
                className="flex-1"
              >
                {loading ? "Registrando…" : "Cobrar"}
              </Button>
              <Button
                onClick={() => setOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
