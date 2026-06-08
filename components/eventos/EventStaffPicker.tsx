"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { HoursInput } from "@/components/ui/hours-input";
import { formatMoney } from "@/lib/money";
import { formatHHMM, staffLineCost, effectiveMinutes } from "@/lib/staff/hours";
import { useAutosave } from "@/components/eventos/autosave";
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
  const { run: autosaveRun } = useAutosave();

  // Per-row local state for editing actual hours.
  const [actualDraft, setActualDraft] = useState<Record<string, number>>({});
  // Rows whose real-hours editor is open. A row with no logged hours yet is
  // always open (it must be registered); a registered row opens only on "Editar".
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());

  const attachedIds = new Set(lines.map((l) => l.staffId));
  const unattached = available.filter((s) => !attachedIds.has(s.id));

  const totalCost = lines.reduce(
    (s, l) => s + staffLineCost(l.staff.hourlyRate, effectiveMinutes(l.estMinutes, l.actualMinutes)),
    0,
  );
  const pendingRegistro = lines.some((l) => l.actualMinutes == null);

  function startEditHours(staffId: string, currentMinutes: number) {
    setError(null);
    setActualDraft((p) => ({ ...p, [staffId]: currentMinutes }));
    setEditingIds((prev) => new Set(prev).add(staffId));
  }

  function cancelEditHours(staffId: string) {
    setError(null);
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(staffId);
      return next;
    });
    setActualDraft((p) => {
      const next = { ...p };
      delete next[staffId];
      return next;
    });
  }

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
                      {l.actualMinutes != null && !editingIds.has(l.staffId) ? (
                        // Registered: show the logged hours + a confirmation, with
                        // an Editar to reopen the editor. No more permanent input.
                        <div className="flex items-center gap-3 h-9">
                          <span className="font-medium">{formatHHMM(l.actualMinutes)} hs</span>
                          <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2 py-0.5 text-xs font-medium">
                            Registrado
                          </span>
                          {!l.paid && (
                            <button
                              type="button"
                              onClick={() => startEditHours(l.staffId, l.actualMinutes ?? 0)}
                              disabled={busy}
                              className="text-primary hover:underline text-xs disabled:opacity-40"
                            >
                              Editar
                            </button>
                          )}
                        </div>
                      ) : (
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
                            onClick={async () => {
                              const res = await run(() =>
                                setStaffActualAction(eventId, l.staffId, draft),
                              );
                              if (res.ok) cancelEditHours(l.staffId);
                            }}
                          >
                            Guardar
                          </Button>
                          {/* Cancel only makes sense once hours exist to revert to. */}
                          {l.actualMinutes != null && (
                            <button
                              type="button"
                              onClick={() => cancelEditHours(l.staffId)}
                              disabled={busy}
                              className="text-muted-foreground hover:underline text-xs disabled:opacity-40 ml-1 self-center"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      )}
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
