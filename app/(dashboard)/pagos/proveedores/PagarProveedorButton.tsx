"use client";

import { useState } from "react";
import { pagarProveedorAction } from "./actions";

type Account = { id: string; name: string };

type Props = {
  eventServiceId: string;
  amount: number;
  description: string;
  accounts: Account[];
};

export function PagarProveedorButton({ eventServiceId, amount, description, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await pagarProveedorAction(eventServiceId, amount, accountId, description);
    setLoading(false);
    if (!result.ok) setError(result.error ?? "Error");
    else setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Pagar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        className="border rounded px-2 py-1 text-xs"
      >
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
      <button
        onClick={handle}
        disabled={loading || !accountId}
        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "…" : "Confirmar"}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Cancelar
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
