"use client";
// EventForm: RHF handles field state + instant validation feedback.
// On submit, sends raw EventFormInput (strings) to a Server Action.
// The Server Action is the trust boundary — it validates + parses strings → Dates.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import {
  eventFormInputSchema,
  EventFormInput,
  EventState,
} from "@/lib/events/schema";
import type { ClientFormInput } from "@/lib/clients/schema";
import { formatMoney } from "@/lib/money";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AddClientModal } from "@/components/clientes/AddClientModal";
import { ClientCombobox } from "@/components/clientes/ClientCombobox";
import { statusBadgeLabel } from "@/components/ui/status-badge";
import { Money } from "@/components/ui/money";

type ServiceLine = { serviceId: string; qty: number };
type EventLines = { services: ServiceLine[]; providerIds: string[] };

type AvailableService = { id: string; name: string; cost: number; price: number };
type AvailableProvider = { id: string; name: string; role: string | null; cost: number };
type AvailableEventType = { id: string; name: string };
type AvailableClient = { id: string; name: string };

type CreateClientResult =
  | { ok: true; client: { id: string; name: string } }
  | { ok: false; error: string };

type EventFormProps = {
  onSubmit: (data: EventFormInput, lines?: EventLines) => Promise<{ ok: boolean; id?: string; error?: string }>;
  defaultValues?: Partial<EventFormInput>;
  submitLabel?: string;
  submitVariant?: "create" | "edit";
  stickyBar?: boolean;
  hideActions?: boolean;
  formId?: string;
  availableServices?: AvailableService[];
  availableProviders?: AvailableProvider[];
  eventTypes?: AvailableEventType[];
  clients?: AvailableClient[];
  createClient?: (data: ClientFormInput) => Promise<CreateClientResult>;
};

export function EventForm({
  onSubmit,
  defaultValues,
  submitLabel = "Guardar",
  submitVariant = "edit",
  stickyBar = true,
  hideActions = false,
  formId,
  availableServices,
  availableProviders,
  eventTypes,
  clients,
  createClient,
}: EventFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  // Inline service picker state
  const [selectedServices, setSelectedServices] = useState<ServiceLine[]>([]);
  const [pendingServiceId, setPendingServiceId] = useState("");
  const [pendingQty, setPendingQty] = useState(1);

  // Inline provider picker state
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);
  const [pendingProviderId, setPendingProviderId] = useState("");

  // Client selector state
  const [localClients, setLocalClients] = useState<AvailableClient[]>(clients ?? []);
  const [selectedClientId, setSelectedClientId] = useState(defaultValues?.clientId ?? "");

  // Client creation modal state
  const [showAddClient, setShowAddClient] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormInputSchema),
    defaultValues: {
      state: EventState.PRESUPUESTADO,
      totalPrice: "0",
      startAt: "",
      endAt: "",
      ...defaultValues,
    },
  });

  const handleClientCreated = (c: { id: string; name: string }) => {
    setLocalClients((prev) => [...prev, c]);
    setSelectedClientId(c.id);
    setValue("clientId", c.id);
    setValue("clientName", c.name, { shouldValidate: true });
    setShowAddClient(false);
  };

  const addService = () => {
    if (!pendingServiceId) return;
    setSelectedServices((prev) => {
      const existing = prev.find((l) => l.serviceId === pendingServiceId);
      if (existing) return prev.map((l) => l.serviceId === pendingServiceId ? { ...l, qty: pendingQty } : l);
      return [...prev, { serviceId: pendingServiceId, qty: pendingQty }];
    });
    setPendingServiceId("");
    setPendingQty(1);
  };

  const removeService = (serviceId: string) =>
    setSelectedServices((prev) => prev.filter((l) => l.serviceId !== serviceId));

  const addProvider = () => {
    if (!pendingProviderId || selectedProviderIds.includes(pendingProviderId)) return;
    setSelectedProviderIds((prev) => [...prev, pendingProviderId]);
    setPendingProviderId("");
  };

  const removeProvider = (id: string) =>
    setSelectedProviderIds((prev) => prev.filter((p) => p !== id));

  const buildSubmit = (overrideState?: EventState) =>
    handleSubmit(async (formInput) => {
      setServerError(null);
      const data = overrideState ? { ...formInput, state: overrideState } : formInput;
      const lines: EventLines = { services: selectedServices, providerIds: selectedProviderIds };
      const result = await onSubmit(data, lines);
      if (result.ok) {
        router.push(result.id ? `/eventos/${result.id}/editar` : "/eventos");
        router.refresh();
      } else {
        setServerError(result.error ?? "Error al guardar");
      }
    });

  const serviceMap = Object.fromEntries((availableServices ?? []).map((s) => [s.id, s]));
  const providerMap = Object.fromEntries((availableProviders ?? []).map((p) => [p.id, p]));
  const unaddedServices = (availableServices ?? []).filter(
    (s) => !selectedServices.some((l) => l.serviceId === s.id)
  );
  const unaddedProviders = (availableProviders ?? []).filter(
    (p) => !selectedProviderIds.includes(p.id)
  );

  // Live financial summary
  const servicePrice = selectedServices.reduce((s, l) => s + (serviceMap[l.serviceId]?.price ?? 0) * l.qty, 0);
  const serviceCost = selectedServices.reduce((s, l) => s + (serviceMap[l.serviceId]?.cost ?? 0) * l.qty, 0);
  const providerCost = selectedProviderIds.reduce((s, pid) => s + (providerMap[pid]?.cost ?? 0), 0);
  const profit = servicePrice - serviceCost - providerCost;

  const fmt = formatMoney;

  return (
    <form id={formId} onSubmit={buildSubmit()} className={cn("space-y-6 max-w-2xl", stickyBar && "pb-20")}>
      <div className="space-y-1">
        <Label htmlFor="name">Nombre del evento</Label>
        <Input id="name" {...register("name")} placeholder="Cumpleaños de Sofía" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center h-6">
            <Label htmlFor="eventType">Tipo de evento</Label>
          </div>
          {eventTypes && eventTypes.length > 0 ? (
            <div className="w-full">
              <input type="hidden" {...register("eventType")} />
              <Select
                defaultValue={defaultValues?.eventType ?? ""}
                onValueChange={(v) => setValue("eventType", (v as string) ?? "", { shouldValidate: true })}
              >
                <SelectTrigger className="w-full" aria-label="Tipo de evento">
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => (
                    <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Input id="eventType" {...register("eventType")} placeholder="Cumpleaños" />
          )}
          {errors.eventType && <p className="text-sm text-destructive">{errors.eventType.message}</p>}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2 h-6">
            <Label>Cliente</Label>
            {createClient && !showAddClient && (
              <button
                type="button"
                onClick={() => setShowAddClient(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Plus className="size-3.5" />
                Agregar cliente
              </button>
            )}
          </div>

          {createClient && (
            <AddClientModal
              open={showAddClient}
              onClose={() => setShowAddClient(false)}
              onCreated={handleClientCreated}
              createClient={createClient}
            />
          )}

          <ClientCombobox
            clients={localClients}
            value={selectedClientId}
            onChange={(id, name) => {
              setSelectedClientId(id);
              setValue("clientId", id);
              setValue("clientName", name, { shouldValidate: true });
            }}
          />
          <input type="hidden" {...register("clientName")} />
          {errors.clientName && (
            <p className="text-sm text-destructive">Seleccioná un cliente o creá uno nuevo</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="startAt">Inicio</Label>
          <Input id="startAt" type="datetime-local" {...register("startAt")} />
          {errors.startAt && <p className="text-sm text-destructive">{errors.startAt.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="endAt">Fin</Label>
          <Input id="endAt" type="datetime-local" {...register("endAt")} />
          {errors.endAt && <p className="text-sm text-destructive">{errors.endAt.message}</p>}
        </div>
      </div>

      {/* Estado only shown in edit mode — create mode uses Presupuestar/Reservar buttons */}
      {submitVariant === "edit" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Estado</Label>
            <Select
              items={Object.fromEntries(Object.values(EventState).map((s) => [s, statusBadgeLabel(s)]))}
              defaultValue={defaultValues?.state ?? EventState.PRESUPUESTADO}
              onValueChange={(v) => setValue("state", v as EventState)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione estado" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(EventState).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusBadgeLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="totalPrice">Precio total</Label>
            <Input id="totalPrice" type="number" step="0.01" {...register("totalPrice")} />
            {errors.totalPrice && <p className="text-sm text-destructive">{errors.totalPrice.message}</p>}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="details">Detalles</Label>
        <Textarea id="details" {...register("details")} rows={8} placeholder="Información del evento…" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Notas internas</Label>
        <Textarea id="notes" {...register("notes")} rows={2} placeholder="Solo visible para el equipo…" />
      </div>

      {/* Inline service picker */}
      {availableServices && availableServices.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <p className="font-medium">Servicios</p>
          {selectedServices.length > 0 && (
            <ul className="space-y-1">
              {selectedServices.map((l) => (
                <li key={l.serviceId} className="flex items-center justify-between text-sm bg-muted rounded px-3 py-1.5">
                  <span>{serviceMap[l.serviceId]?.name} × {l.qty}</span>
                  <button type="button" onClick={() => removeService(l.serviceId)} className="text-muted-foreground hover:text-destructive ml-4">✕</button>
                </li>
              ))}
            </ul>
          )}
          {unaddedServices.length > 0 && (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="mb-1 block">Agregar servicio</Label>
                <Select
                  items={Object.fromEntries(unaddedServices.map((s) => [s.id, s.name]))}
                  value={pendingServiceId}
                  onValueChange={(v) => setPendingServiceId((v as string) ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar…" />
                  </SelectTrigger>
                  <SelectContent>
                    {unaddedServices.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20 space-y-1">
                <Label>Cant.</Label>
                <Input
                  type="number"
                  min={1}
                  value={pendingQty}
                  onChange={(e) => setPendingQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <Button type="button" variant="secondary" onClick={addService} disabled={!pendingServiceId}>
                Agregar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Inline provider picker */}
      {availableProviders && availableProviders.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <p className="font-medium">Prestadores</p>
          {selectedProviderIds.length > 0 && (
            <ul className="space-y-1">
              {selectedProviderIds.map((pid) => (
                <li key={pid} className="flex items-center justify-between text-sm bg-muted rounded px-3 py-1.5">
                  <span>{providerMap[pid]?.name}{providerMap[pid]?.role ? ` (${providerMap[pid].role})` : ""}</span>
                  <button type="button" onClick={() => removeProvider(pid)} className="text-muted-foreground hover:text-destructive ml-4">✕</button>
                </li>
              ))}
            </ul>
          )}
          {unaddedProviders.length > 0 && (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="mb-1 block">Agregar prestador</Label>
                <Select
                  items={Object.fromEntries(unaddedProviders.map((p) => [p.id, `${p.name}${p.role ? ` (${p.role})` : ""}`]))}
                  value={pendingProviderId}
                  onValueChange={(v) => setPendingProviderId((v as string) ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar…" />
                  </SelectTrigger>
                  <SelectContent>
                    {unaddedProviders.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}{p.role ? ` (${p.role})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="secondary" onClick={addProvider} disabled={!pendingProviderId}>
                Agregar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Live Resumen — only on create when pickers present */}
      {submitVariant === "create" && (availableServices || availableProviders) && (
        <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
          <p className="font-medium text-sm">Resumen</p>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio servicios</span>
              <span>{fmt(servicePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo servicios</span>
              <span>{fmt(serviceCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo prestadores</span>
              <span>{fmt(providerCost)}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-2 mt-1">
              <span>Ganancia estimada</span>
              <Money value={profit} signed>{fmt(profit)}</Money>
            </div>
          </div>
        </div>
      )}

      {/* Sticky action bar — stays visible on short viewports so the submit
          buttons are always reachable without scrolling to the page bottom. */}
      {!hideActions && (
        <div className={cn("flex gap-3 border-t px-4 py-3", stickyBar ? "sticky bottom-0 z-10 -mx-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80" : "mt-2")}>
          {submitVariant === "create" ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={buildSubmit(EventState.PRESUPUESTADO)}
                className="border-yellow-400 text-yellow-700 hover:bg-yellow-50"
              >
                {isSubmitting ? "Guardando…" : "Presupuestar"}
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={buildSubmit(EventState.RESERVADO)}
              >
                {isSubmitting ? "Guardando…" : "Reservar"}
              </Button>
            </>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando…" : submitLabel}
            </Button>
          )}
          <Link href="/eventos" className={cn(buttonVariants({ variant: "outline" }))}>
            Cancelar
          </Link>
        </div>
      )}

      {/* Submit errors (e.g. double-booking) surface as a modal alert. */}
      <Dialog open={!!serverError} onOpenChange={(open) => !open && setServerError(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No se pudo guardar el evento</DialogTitle>
            <DialogDescription>{serverError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button />}>Entendido</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
