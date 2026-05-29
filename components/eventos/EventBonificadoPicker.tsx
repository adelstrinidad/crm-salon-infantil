"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addBonificadoAction, removeBonificadoAction } from "@/app/(dashboard)/eventos/[id]/bonificados-actions";
import { SectionTitle } from "@/components/ui/section-title";
import { formatMoney } from "@/lib/money";

type BonificadoLine = {
  serviceId: string;
  qty: number;
  service: { name: string; price: number };
};

type AvailableService = { id: string; name: string; price: number };

type Props = {
  eventId: string;
  lines: BonificadoLine[];
  available: AvailableService[];
};

export function EventBonificadoPicker({ eventId, lines, available }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  const attachedIds = new Set(lines.map((l) => l.serviceId));
  const unattached = available.filter((s) => !attachedIds.has(s.id));
  const totalBonificado = lines.reduce((s, l) => s + l.service.price * l.qty, 0);

  async function handleAdd() {
    if (!selectedId) return;
    setBusy(true);
    await addBonificadoAction(eventId, selectedId, qty);
    setSelectedId("");
    setQty(1);
    setBusy(false);
  }

  async function handleRemove(serviceId: string) {
    setBusy(true);
    await removeBonificadoAction(eventId, serviceId);
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Bonificados</SectionTitle>
      <p className="text-sm text-muted-foreground">Servicios entregados de forma gratuita al cliente.</p>

      {lines.length > 0 ? (
        <table className="w-full text-sm mb-2 border border-border">
          <thead>
            <tr className="border-b text-left">
              <th className="py-1 pr-4">Servicio</th>
              <th className="py-1 pr-4">Cant.</th>
              <th className="py-1 pr-4">Precio bonificado</th>
              <th className="py-1"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.serviceId} className="border-b">
                <td className="py-1 pr-4">{l.service.name}</td>
                <td className="py-1 pr-4">{l.qty}</td>
                <td className="py-1 pr-4 text-accent">{formatMoney(l.service.price * l.qty)}</td>
                <td className="py-1">
                  <button
                    onClick={() => handleRemove(l.serviceId)}
                    disabled={busy}
                    className="text-destructive hover:underline text-xs"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
            <tr className="font-medium">
              <td colSpan={2} className="pt-2">Total bonificado</td>
              <td className="pt-2 text-accent">{formatMoney(totalBonificado)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted-foreground">Sin bonificados.</p>
      )}

      {unattached.length > 0 && (
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Agregar bonificado</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
            >
              <option value="">Seleccionar…</option>
              {unattached.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatMoney(s.price)})
                </option>
              ))}
            </select>
          </div>
          <div className="w-20 space-y-1">
            <label className="text-sm font-medium">Cant.</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <Button onClick={handleAdd} disabled={busy || !selectedId} size="sm">
            Agregar
          </Button>
        </div>
      )}
    </div>
  );
}
