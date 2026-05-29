"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { pagarPrestadorAction } from "./actions";

type Account = { id: string; name: string };

type Props = {
  eventProviderId: string;
  amount: number;
  description: string;
  accounts: Account[];
};

export function PagarButton({ eventProviderId, amount, description, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await pagarPrestadorAction(eventProviderId, amount, accountId, description);
    setLoading(false);
    if (!result.ok) setError(result.error ?? "Error");
    else setOpen(false);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="xs">
        Pagar
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        className="border border-border bg-background rounded px-2 py-1 text-xs"
      >
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
      <Button onClick={handle} disabled={loading || !accountId} size="xs">
        {loading ? "…" : "Confirmar"}
      </Button>
      <Button onClick={() => setOpen(false)} variant="ghost" size="xs">
        Cancelar
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
