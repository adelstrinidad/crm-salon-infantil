"use client";

import { useState } from "react";
import { registrarCobroAction } from "./actions";

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

function fmt(n: number) {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

export function RegistrarCobroPanel({ eventId, saldo, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(saldo > 0 ? String(saldo) : "");
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await registrarCobroAction(eventId, {
      accountId,
      amount: parseFloat(amount),
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
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-muted/50 transition-colors"
      >
        Registrar cobro
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Registrar cobro</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>

            {saldo > 0 && (
              <p className="text-sm">
                <span className="text-muted-foreground">Saldo pendiente: </span>
                <span className="font-semibold text-red-600">{fmt(saldo)}</span>
              </p>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Cuenta *</label>
                {accounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin cuentas configuradas.</p>
                ) : (
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Descripción / Concepto</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Seña, Saldo final…"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Importe *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handle}
                disabled={loading || !accountId || !amount}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Registrando…" : "Cobrar"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-lg border text-sm hover:bg-muted/50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
