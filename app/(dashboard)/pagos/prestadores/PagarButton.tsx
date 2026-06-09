"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pagarPrestadorAction, type PaymentSourceKind } from "./actions";

type Account = { id: string; name: string };

type Props = {
  kind: PaymentSourceKind;
  id: string;
  amount: number;
  description: string;
  accounts: Account[];
};

export function PagarButton({ kind, id, amount, description, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await pagarPrestadorAction(kind, id, amount, accountId, description);
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
      <Select
        items={Object.fromEntries(accounts.map((a) => [a.id, a.name]))}
        value={accountId}
        onValueChange={(v) => setAccountId(v as string)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Cuenta" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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
