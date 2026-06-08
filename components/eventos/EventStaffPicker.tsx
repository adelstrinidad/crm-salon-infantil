"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { HoursInput } from "@/components/ui/hours-input";
import { formatMoney } from "@/lib/money";
import { formatHHMM, staffLineCost, effectiveMinutes } from "@/lib/staff/hours";
import {
  addStaffAction,
  removeStaffAction,
  setStaffActualAction,
} from "@/app/(dashboard)/eventos/[id]/staff-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StaffLine = {
  staffId: string;
  estMinutes: number | null;
  actualMinutes: number | null;
  paid: boolean;
  paidAt: Date | null;
  staff: { name: string; role: string | null; hourlyRate: number };
};

type AvailableStaff = { id: string; name: string; role: string | null; hourlyRate: number };

type Props = {
  eventId: string;
  lines: StaffLine[];
  available: AvailableStaff[];
};

export function EventStaffPicker({ eventId, lines, available }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [pendingMinutes, setPendingMinutes] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-row local state for editing actual hours.
  const [actualDraft, setActualDraft] = useState<Record<string, number>>({});

  const attachedIds = new Set(lines.map((l) => l.staffId));
  const unattached = available.filter((s) => !attachedIds.has(s.id));

  const totalCost = lines.reduce(
    (s, l) => s + staffLineCost(l.staff.hourlyRate, effectiveMinutes(l.estMinutes, l.actualMinutes)),
    0,
  );
  const pendingRegistro = lines.some((l) => l.actualMinutes == null);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    const res = await fn();
    if (!res.ok) setError(res.error ?? "Error");
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Personal del evento</SectionTitle>
      <p className="text-sm text-muted-foreground">
        Empleados internos por hora. Su costo no se cobra al cliente. Las horas se estiman al asignar
        y se ajustan al finalizar el evento.
      </p>

      {pendingRegistro && (
        <p className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-3 py-1 text-xs font-medium">
          Falta registro de empleados
        </p>
      )}

      {error && <p className="text-sm text-destructive font-medium">{error}</p>}

      {lines.length > 0 ? (
        <>
          {/* One card per assignment — too many controls (real-hours editor +
              pay flow) to fit a single wide table row inside the form column. */}
          <ul className="space-y-2">
            {lines.map((l) => {
              const minutes = effectiveMinutes(l.estMinutes, l.actualMinutes);
              const cost = staffLineCost(l.staff.hourlyRate, minutes);
              const draft = actualDraft[l.staffId] ?? l.actualMinutes ?? l.estMinutes ?? 0;
              return (
                <li key={l.staffId} className="rounded-lg border border-border bg-card p-3 space-y-3">
                  {/* Header: name/role + cost + remove */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-medium">{l.staff.name}</span>
                      {l.staff.role && (
                        <span className="text-muted-foreground"> · {l.staff.role}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-medium whitespace-nowrap">{formatMoney(cost)}</span>
                      <button
                        type="button"
                        onClick={() => run(() => removeStaffAction(eventId, l.staffId))}
                        disabled={busy || l.paid}
                        className="text-destructive hover:underline text-xs disabled:opacity-40"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>

                  {/* Hours + pay controls wrap on narrow widths */}
                  <div className="flex flex-wrap items-end gap-x-4 gap-y-3 text-sm">
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Estimado</p>
                      <p className="h-9 flex items-center">
                        {l.estMinutes != null ? `${formatHHMM(l.estMinutes)} hs` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Horas reales</p>
                      <div className="flex items-end gap-1">
                        <HoursInput
                          minutes={draft}
                          disabled={busy || l.paid}
                          onChange={(m) => setActualDraft((p) => ({ ...p, [l.staffId]: m }))}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          // Stay disabled until a non-zero time is selected — no
                          // point logging 0 real hours.
                          disabled={busy || l.paid || draft === 0}
                          onClick={() => run(() => setStaffActualAction(eventId, l.staffId, draft))}
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Pago</p>
                      {l.paid ? (
                        <span className="inline-flex h-9 items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 text-xs font-medium">
                          Pagado {l.paidAt ? new Date(l.paidAt).toLocaleDateString("es-AR") : ""}
                        </span>
                      ) : (
                        <span className="inline-flex h-9 items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 text-xs font-medium">
                          Pendiente — pagar en Pago personal
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-between border-t pt-2 text-sm font-medium">
            <span>Total personal</span>
            <span>{formatMoney(totalCost)}</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Sin personal asignado.</p>
      )}

      {unattached.length > 0 && (
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[12rem]">
            <label className="mb-1 block text-sm font-medium">Agregar empleado</label>
            <Select
              items={Object.fromEntries(unattached.map((s) => [s.id, `${s.name}${s.role ? ` (${s.role})` : ""}`]))}
              value={selectedId}
              onValueChange={(v) => setSelectedId((v as string) ?? "")}
            >
              <SelectTrigger className="w-full" aria-label="Agregar empleado">
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {unattached.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}{s.role ? ` (${s.role})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="mb-1 block text-sm font-medium">Horas est.</label>
            <HoursInput minutes={pendingMinutes} onChange={setPendingMinutes} disabled={busy} />
          </div>
          <Button
            type="button"
            disabled={busy || !selectedId}
            onClick={() =>
              run(async () => {
                const res = await addStaffAction(eventId, selectedId, pendingMinutes);
                if (res.ok) {
                  setSelectedId("");
                  setPendingMinutes(0);
                }
                return res;
              })
            }
          >
            Agregar
          </Button>
        </div>
      )}
    </div>
  );
}
