"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addProviderAction,
  removeProviderAction,
  setProviderCostAction,
} from "@/app/(dashboard)/eventos/[id]/providers-actions";
import { SectionTitle } from "@/components/ui/section-title";
import { formatMoney, parsePesosToCents, centsToPesos } from "@/lib/money";
import { useAutosave } from "@/components/eventos/autosave";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProviderLine = {
  providerId: string;
  cost: number; // explicit per-event cost in cents (never null)
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
  // Cost (pesos) for the provider being added.
  const [pendingCost, setPendingCost] = useState("");
  // Per-row draft cost (pesos) while editing.
  const [costDraft, setCostDraft] = useState<Record<string, string>>({});
  // Providers whose cost row is currently in edit mode (input shown).
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { run: autosaveRun } = useAutosave();

  function startEdit(providerId: string, currentPesos: number) {
    setError(null);
    setCostDraft((p) => ({ ...p, [providerId]: String(currentPesos) }));
    setEditingIds((prev) => new Set(prev).add(providerId));
  }

  function cancelEdit(providerId: string) {
    setError(null);
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(providerId);
      return next;
    });
    // Drop the draft so the row falls back to the saved value.
    setCostDraft((p) => {
      const next = { ...p };
      delete next[providerId];
      return next;
    });
  }

  const attachedIds = new Set(lines.map((l) => l.providerId));
  const unattached = available.filter((p) => !attachedIds.has(p.id));

  // Defensive: never let a missing/garbage cost render as NaN.
  const totalCost = lines.reduce((s, l) => s + (Number.isFinite(l.cost) ? l.cost : 0), 0);

  // The cost field is required: blank or non-numeric is invalid. To set "free"
  // you must type 0 — an empty field is never accepted.
  const invalidCost = (s: string) => s.trim() === "" || !Number.isFinite(Number.parseFloat(s));

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    const res = await autosaveRun(fn);
    if (!res.ok) setError(res.error ?? "Error");
    setBusy(false);
    return res;
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Prestadores del evento</SectionTitle>
      <p className="text-sm text-muted-foreground">
        El costo es por evento: al elegir el prestador se precarga su costo de catálogo y podés
        ajustarlo si varía (ej. catering). Es obligatorio — si es gratis para este evento poné 0,
        no lo dejes vacío. Este monto es lo que figura a pagar en los reportes.
      </p>

      {error && <p className="text-sm text-destructive font-medium">{error}</p>}

      {lines.length > 0 ? (
        <table className="w-full text-sm mb-2 border border-border">
          <thead>
            <tr className="border-b text-left">
              <th className="py-1 pr-4">Nombre</th>
              <th className="py-1 pr-4">Rol</th>
              <th className="py-1 pr-4">Costo (por evento)</th>
              <th className="py-1"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const catalog = Number.isFinite(l.cost) ? centsToPesos(l.cost) : 0;
              const editing = editingIds.has(l.providerId);
              const draft = costDraft[l.providerId] ?? String(catalog);
              return (
                <tr key={l.providerId} className="border-b">
                  <td className="py-1 pr-4">{l.provider.name}</td>
                  <td className="py-1 pr-4 text-muted-foreground">{l.provider.role ?? "—"}</td>
                  <td className="py-1 pr-4">
                    {editing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          autoFocus
                          className="w-28"
                          value={draft}
                          disabled={busy}
                          onChange={(e) =>
                            setCostDraft((p) => ({ ...p, [l.providerId]: e.target.value }))
                          }
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={busy || invalidCost(draft)}
                          onClick={async () => {
                            if (invalidCost(draft)) {
                              setError("El costo es obligatorio (poné 0 si es gratis)");
                              return;
                            }
                            const res = await run(() =>
                              setProviderCostAction(eventId, l.providerId, parsePesosToCents(draft)),
                            );
                            if (res.ok) cancelEdit(l.providerId);
                          }}
                        >
                          Guardar
                        </Button>
                        <button
                          type="button"
                          onClick={() => cancelEdit(l.providerId)}
                          disabled={busy}
                          className="text-muted-foreground hover:underline text-xs disabled:opacity-40"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatMoney(l.cost)}</span>
                        <button
                          type="button"
                          onClick={() => startEdit(l.providerId, catalog)}
                          disabled={busy}
                          className="text-primary hover:underline text-xs disabled:opacity-40"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-1">
                    <button
                      type="button"
                      onClick={() => run(() => removeProviderAction(eventId, l.providerId))}
                      disabled={busy}
                      className="text-destructive hover:underline text-xs disabled:opacity-40"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              );
            })}
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
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[12rem]">
            <label className="mb-1 block text-sm font-medium">Agregar prestador</label>
            <Select
              items={Object.fromEntries(unattached.map((p) => [p.id, `${p.name}${p.role ? ` (${p.role})` : ""}`]))}
              value={selectedId}
              onValueChange={(v) => {
                const id = (v as string) ?? "";
                setSelectedId(id);
                // Prefill the cost with the provider's catalog default; the user
                // can override it before adding, or leave it as a snapshot.
                const picked = unattached.find((p) => p.id === id);
                setPendingCost(picked ? String(centsToPesos(picked.cost)) : "");
              }}
            >
              <SelectTrigger className="w-full" aria-label="Agregar prestador">
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
          <div className="space-y-1">
            <label className="mb-1 block text-sm font-medium">Costo</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="w-32"
              placeholder="0"
              aria-label="Costo prestador"
              value={pendingCost}
              disabled={busy}
              onChange={(e) => setPendingCost(e.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={busy || !selectedId || invalidCost(pendingCost)}
            onClick={() => {
              if (invalidCost(pendingCost)) {
                setError("El costo es obligatorio (poné 0 si es gratis)");
                return;
              }
              run(async () => {
                const res = await addProviderAction(eventId, selectedId, parsePesosToCents(pendingCost));
                if (res.ok) {
                  setSelectedId("");
                  setPendingCost("");
                }
                return res;
              });
            }}
            aria-label="Agregar prestador"
          >
            Agregar
          </Button>
        </div>
      )}
    </div>
  );
}
