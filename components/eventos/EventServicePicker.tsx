"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addServiceAction, removeServiceAction } from "@/app/(dashboard)/eventos/[id]/services-actions";
import { SectionTitle } from "@/components/ui/section-title";

type ServiceLine = {
  serviceId: string;
  qty: number;
  service: { name: string; cost: number; price: number };
};

type AvailableService = { id: string; name: string; cost: number; price: number };

type Props = {
  eventId: string;
  lines: ServiceLine[];
  available: AvailableService[];
};

export function EventServicePicker({ eventId, lines, available }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  const attachedIds = new Set(lines.map((l) => l.serviceId));
  const unattached = available.filter((s) => !attachedIds.has(s.id));

  async function handleAdd() {
    if (!selectedId) return;
    setBusy(true);
    await addServiceAction(eventId, selectedId, qty);
    setSelectedId("");
    setQty(1);
    setBusy(false);
  }

  async function handleRemove(serviceId: string) {
    setBusy(true);
    await removeServiceAction(eventId, serviceId);
    setBusy(false);
  }

  const totalCost = lines.reduce((s, l) => s + l.service.cost * l.qty, 0);
  const totalPrice = lines.reduce((s, l) => s + l.service.price * l.qty, 0);

  return (
    <div className="space-y-4">
      <SectionTitle>Servicios del evento</SectionTitle>

      {lines.length > 0 ? (
        <table className="w-full text-sm mb-2 border border-border">
          <thead>
            <tr className="border-b text-left">
              <th className="py-1 pr-4">Servicio</th>
              <th className="py-1 pr-4">Cant.</th>
              <th className="py-1 pr-4">Costo</th>
              <th className="py-1 pr-4">Precio</th>
              <th className="py-1"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.serviceId} className="border-b">
                <td className="py-1 pr-4">{l.service.name}</td>
                <td className="py-1 pr-4">{l.qty}</td>
                <td className="py-1 pr-4">${(l.service.cost * l.qty).toFixed(2)}</td>
                <td className="py-1 pr-4">${(l.service.price * l.qty).toFixed(2)}</td>
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
              <td colSpan={2} className="pt-2">Total</td>
              <td className="pt-2 pr-4">${totalCost.toFixed(2)}</td>
              <td className="pt-2 pr-4">${totalPrice.toFixed(2)}</td>
              <td />
            </tr>
            <tr className="text-sm text-muted-foreground">
              <td colSpan={2} />
              <td colSpan={2} className="pb-1">
                Ganancia: ${(totalPrice - totalCost).toFixed(2)}
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted-foreground">Sin servicios asignados.</p>
      )}

      {unattached.length > 0 && (
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Agregar servicio</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
            >
              <option value="">Seleccionar…</option>
              {unattached.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (${s.price.toFixed(2)})
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
