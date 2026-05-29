"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addProviderAction, removeProviderAction } from "@/app/(dashboard)/eventos/[id]/providers-actions";
import { SectionTitle } from "@/components/ui/section-title";
import { formatMoney } from "@/lib/money";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProviderLine = {
  providerId: string;
  provider: { name: string; role: string | null; cost: number };
};

type AvailableProvider = { id: string; name: string; role: string | null; cost: number };

type Props = {
  eventId: string;
  lines: ProviderLine[];
  available: AvailableProvider[];
};

export function EventProviderPicker({ eventId, lines, available }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);

  const attachedIds = new Set(lines.map((l) => l.providerId));
  const unattached = available.filter((p) => !attachedIds.has(p.id));

  const totalCost = lines.reduce((s, l) => s + l.provider.cost, 0);

  async function handleAdd() {
    if (!selectedId) return;
    setBusy(true);
    await addProviderAction(eventId, selectedId);
    setSelectedId("");
    setBusy(false);
  }

  async function handleRemove(providerId: string) {
    setBusy(true);
    await removeProviderAction(eventId, providerId);
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Prestadores del evento</SectionTitle>

      {lines.length > 0 ? (
        <table className="w-full text-sm mb-2 border border-border">
          <thead>
            <tr className="border-b text-left">
              <th className="py-1 pr-4">Nombre</th>
              <th className="py-1 pr-4">Rol</th>
              <th className="py-1 pr-4">Costo</th>
              <th className="py-1"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.providerId} className="border-b">
                <td className="py-1 pr-4">{l.provider.name}</td>
                <td className="py-1 pr-4 text-muted-foreground">{l.provider.role ?? "—"}</td>
                <td className="py-1 pr-4">{formatMoney(l.provider.cost)}</td>
                <td className="py-1">
                  <button
                    onClick={() => handleRemove(l.providerId)}
                    disabled={busy}
                    className="text-destructive hover:underline text-xs"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
            <tr className="font-medium">
              <td colSpan={2} className="pt-2">Total prestadores</td>
              <td className="pt-2">{formatMoney(totalCost)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted-foreground">Sin prestadores asignados.</p>
      )}

      {unattached.length > 0 && (
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Agregar prestador</label>
            <Select
              items={Object.fromEntries(unattached.map((p) => [p.id, `${p.name}${p.role ? ` (${p.role})` : ""}`]))}
              value={selectedId}
              onValueChange={(v) => setSelectedId((v as string) ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {unattached.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}{p.role ? ` (${p.role})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={busy || !selectedId} size="sm">
            Agregar
          </Button>
        </div>
      )}
    </div>
  );
}
