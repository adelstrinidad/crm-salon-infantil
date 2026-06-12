"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  dateFnsLocalizer,
  View,
  Views,
  type ToolbarProps,
} from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Coins,
  CalendarCheck2,
  FileText,
  Lock,
  Ban,
  TriangleAlert,
  PartyPopper,
  Play,
  type LucideIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { statusBadgeLabel } from "@/components/ui/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { colorForEventType } from "@/lib/calendar/colors";
import { findOverlappingIds, overlapsAny } from "@/lib/calendar/overlap";
import { rescheduleEventAction } from "@/app/(dashboard)/eventos/actions";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { es: es },
});

// Soft palette aligned with StatusBadge soft hues (linen-cream compatible).
// Inline hex required: react-big-calendar passes styles via eventPropGetter.
const STATE_COLORS: Record<string, string> = {
  PRESUPUESTADO: "#ede9fe",
  RESERVADO: "#dbeafe",
  SENADO: "#fef3c7",
  PAGADO: "#d1fae5",
  EN_CURSO: "#cffafe",
  CERRADO: "#e7e5e4",
  SUSPENDIDO: "#ffe4e6",
};

const STATE_TEXT: Record<string, string> = {
  PRESUPUESTADO: "#4c1d95",
  RESERVADO: "#1e3a8a",
  SENADO: "#78350f",
  PAGADO: "#064e3b",
  EN_CURSO: "#164e63",
  CERRADO: "#1c1917",
  SUSPENDIDO: "#881337",
};

// Border per state so pale fills still read on the cream background.
const STATE_BORDER: Record<string, string> = {
  PRESUPUESTADO: "#c4b5fd",
  RESERVADO: "#93c5fd",
  SENADO: "#fcd34d",
  PAGADO: "#6ee7b7",
  EN_CURSO: "#67e8f9",
  CERRADO: "#d6d3d1",
  SUSPENDIDO: "#fda4af",
};

// One meaningful icon per state — replaces the easy-to-miss colored dot.
const STATE_ICON: Record<string, LucideIcon> = {
  PRESUPUESTADO: FileText, // a quote/budget
  RESERVADO: CalendarCheck2, // booked
  SENADO: Coins, // deposit paid
  PAGADO: CheckCircle2, // paid in full
  EN_CURSO: Play, // running right now
  CERRADO: Lock, // closed/settled
  SUSPENDIDO: Ban, // cancelled/on hold
};

const STATES = ["PRESUPUESTADO", "RESERVADO", "SENADO", "PAGADO", "EN_CURSO", "CERRADO", "SUSPENDIDO"] as const;

// Only confirmed bookings occupy the venue, so only these flag a visual
// double-booking — mirrors the server-side guard (BLOCKING_STATES in eventService).
const CONFLICT_STATES = new Set(["RESERVADO", "SENADO", "PAGADO", "EN_CURSO", "CERRADO"]);

const HOLIDAY_COLOR = { bg: "#ffedd5", text: "#9a3412", border: "#fb923c" };

const VIEW_LABELS: Record<string, string> = {
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Lista",
};

const MESSAGES = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Lista",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay eventos en este período.",
  showMore: (total: number) => `+${total} más`,
};

type RawEvent = {
  id: string;
  title: string;
  startMs: number;
  endMs: number;
  state: string;
  eventType: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  state: string;
  eventType: string;
  isHoliday?: boolean;
  allDay?: boolean;
};

type Holiday = { dateMs: number; name: string };

type Props = {
  events: RawEvent[];
  holidays?: Holiday[];
  defaultDateMs: number;
};

const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

// `YYYY-MM-DDTHH:mm` for datetime-local prefill on the new-event form.
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CalendarClient({ events, holidays = [], defaultDateMs }: Props) {
  const router = useRouter();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(() => new Date(defaultDateMs));
  const [miniOpen, setMiniOpen] = useState(false);
  // Legend doubles as a state filter: a state in the set is shown. All on by default.
  const [activeStates, setActiveStates] = useState<Set<string>>(() => new Set(STATES));
  // Color chips by event state (default) or by event type.
  const [colorBy, setColorBy] = useState<"state" | "type">("state");
  // Optimistic reschedule positions, keyed by event id; cleared when fresh
  // server data arrives (events prop identity changes after router.refresh()).
  const [overrides, setOverrides] = useState<Record<string, { startMs: number; endMs: number }>>({});
  // Reset overrides when the server sends new event data — the canonical
  // "adjust state during render when a prop changes" pattern (no effect).
  const [prevEvents, setPrevEvents] = useState(events);
  if (prevEvents !== events) {
    setPrevEvents(events);
    setOverrides({});
  }
  // Drag onto an occupied slot: park the move here and ask through the themed
  // dialog (never window.confirm) before committing it.
  const [pendingMove, setPendingMove] = useState<{
    event: CalendarEvent;
    startMs: number;
    endMs: number;
  } | null>(null);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // On small screens the month grid is cramped — default to the agenda/list view.
  // Viewport is unknown during SSR, so this must run post-mount; the one-shot
  // setState is intentional (external-system sync), hence the disable below.
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time viewport-based default
      setView(Views.AGENDA);
    }
  }, []);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const real = events
      .filter((e) => activeStates.has(e.state))
      .map((e) => {
        const o = overrides[e.id];
        return {
          id: e.id,
          title: e.title,
          start: new Date(o?.startMs ?? e.startMs),
          end: new Date(o?.endMs ?? e.endMs),
          state: e.state,
          eventType: e.eventType,
        };
      });
    // Argentine holidays rendered as all-day markers (not draggable/clickable).
    const holidayEvents: CalendarEvent[] = holidays.map((h) => ({
      id: `holiday-${h.dateMs}`,
      title: h.name,
      start: new Date(h.dateMs),
      end: new Date(h.dateMs),
      state: "DIA_FESTIVO",
      eventType: "",
      isHoliday: true,
      allDay: true,
    }));
    return [...holidayEvents, ...real];
  }, [events, activeStates, overrides, holidays]);

  // Ids of real events whose time ranges collide — possible double-bookings.
  // Holidays are excluded (they don't occupy the venue).
  const overlappingIds = useMemo(
    () =>
      findOverlappingIds(
        calendarEvents
          .filter((e) => !e.isHoliday && CONFLICT_STATES.has(e.state))
          .map((e) => ({
            id: e.id,
            startMs: e.start.getTime(),
            endMs: e.end.getTime(),
          })),
      ),
    [calendarEvents],
  );

  // Event types present (for the type-color legend).
  const typesPresent = useMemo(() => {
    const seen = new Set<string>();
    for (const e of events) if (e.eventType) seen.add(e.eventType);
    return [...seen].sort((a, b) => a.localeCompare(b, "es"));
  }, [events]);

  const toggleState = useCallback((state: string) => {
    setActiveStates((prev) => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });
  }, []);

  const eventStyleGetter = useCallback(
    (event: object) => {
      const e = event as CalendarEvent;
      if (e.isHoliday) {
        return {
          style: {
            backgroundColor: HOLIDAY_COLOR.bg,
            color: HOLIDAY_COLOR.text,
            border: `1px solid ${HOLIDAY_COLOR.border}`,
            borderRadius: "4px",
            fontSize: "12px",
            padding: "1px 4px",
          },
        };
      }
      const color =
        colorBy === "type"
          ? colorForEventType(e.eventType)
          : {
              bg: STATE_COLORS[e.state] ?? "#e5e7eb",
              text: STATE_TEXT[e.state] ?? "#111827",
              border: STATE_BORDER[e.state] ?? "#9ca3af",
            };
      const isQuote = e.state === "PRESUPUESTADO";
      const isConflict = overlappingIds.has(e.id);
      return {
        style: {
          // Quotes (presupuestos) render as a dashed outline vs solid sold events.
          backgroundColor: isQuote ? "transparent" : color.bg,
          color: color.text,
          border: isQuote ? `1px dashed ${color.text}` : `1px solid ${color.border}`,
          borderRadius: "4px",
          fontSize: "12px",
          padding: "1px 4px",
          boxShadow: isConflict ? "0 0 0 2px #dc2626" : undefined,
        },
      };
    },
    [colorBy, overlappingIds],
  );

  // Quiet weekend shading so booking density reads at a glance.
  const dayStyleGetter = useCallback((d: Date) => {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return { style: { backgroundColor: "rgba(120,113,108,0.06)" } };
    return {};
  }, []);

  const handleSelectEvent = useCallback(
    (event: object) => {
      const e = event as CalendarEvent;
      if (e.isHoliday) return; // holidays aren't real events
      router.push(`/eventos/${e.id}`);
    },
    [router],
  );

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  // Click a day cell/number (month or week) → open that day in Day view.
  const handleDrillDown = useCallback((newDate: Date) => {
    setDate(newDate);
    setView(Views.DAY);
  }, []);

  // Click/drag an empty slot → create a new event prefilled with that range.
  const handleSelectSlot = useCallback(
    (slot: { start: Date; end: Date }) => {
      const start = slot.start;
      // Month all-day selections span ≥24h; default such picks to a 3h party.
      const spanMs = slot.end.getTime() - start.getTime();
      const end = spanMs >= 24 * 60 * 60 * 1000 ? new Date(start.getTime() + 3 * 60 * 60 * 1000) : slot.end;
      router.push(
        `/eventos/nuevo?start=${encodeURIComponent(toDatetimeLocal(start))}&end=${encodeURIComponent(toDatetimeLocal(end))}`,
      );
    },
    [router],
  );

  // Commit a reschedule: optimistic position, server action, rollback + themed
  // error notice on failure.
  const applyReschedule = useCallback(
    async (eventId: string, startMs: number, endMs: number) => {
      setOverrides((prev) => ({ ...prev, [eventId]: { startMs, endMs } }));
      const res = await rescheduleEventAction(eventId, startMs, endMs);
      if (!res.ok) {
        setOverrides((prev) => {
          const next = { ...prev };
          delete next[eventId];
          return next;
        });
        setRescheduleError(res.error ?? "No se pudo reprogramar el evento.");
        return;
      }
      router.refresh();
    },
    [router],
  );

  // Drag-to-reschedule (and resize). Asks (themed dialog) before creating a
  // double-booking; dropping the dialog leaves the event where it was.
  const handleReschedule = useCallback<NonNullable<withDragAndDropProps<CalendarEvent>["onEventDrop"]>>(
    async ({ event, start, end }) => {
      const s = start instanceof Date ? start : new Date(start);
      const en = end instanceof Date ? end : new Date(end);
      const others = events
        .filter((x) => x.id !== event.id && activeStates.has(x.state))
        .map((x) => ({ id: x.id, startMs: x.startMs, endMs: x.endMs }));
      if (overlapsAny({ startMs: s.getTime(), endMs: en.getTime() }, others)) {
        setPendingMove({ event, startMs: s.getTime(), endMs: en.getTime() });
        return;
      }
      await applyReschedule(event.id, s.getTime(), en.getTime());
    },
    [events, activeStates, applyReschedule],
  );

  // Custom chip: a per-state icon (paid → check, deposit → coins, etc.) plus a
  // distinct conflict warning icon for possible double-bookings, then the title.
  const EventChip = useCallback(
    ({ event }: { event: CalendarEvent }) => {
      if (event.isHoliday) {
        return (
          <span className="flex items-center gap-1 overflow-hidden">
            <PartyPopper className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{event.title}</span>
          </span>
        );
      }
      const StateIcon = STATE_ICON[event.state];
      const conflict = overlappingIds.has(event.id);
      return (
        <span className="flex items-center gap-1 overflow-hidden">
          {StateIcon && (
            <StateIcon className="size-3 shrink-0" aria-label={statusBadgeLabel(event.state)} />
          )}
          {conflict && (
            <TriangleAlert
              className="size-3 shrink-0 text-red-600"
              aria-label="Posible doble reserva"
            />
          )}
          <span className="truncate">{event.title}</span>
        </span>
      );
    },
    [overlappingIds],
  );

  // Custom toolbar: a single month label (the mini-calendar trigger), today/prev/next,
  // and h-9 view buttons matching the app control system. Replaces rbc's default
  // toolbar so there is no duplicate month label.
  const renderToolbar = useCallback(
    (tb: ToolbarProps<CalendarEvent, object>) => (
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => tb.onNavigate("TODAY")}>
            Hoy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="px-2"
            aria-label="Mes anterior"
            onClick={() => tb.onNavigate("PREV")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="px-2"
            aria-label="Mes siguiente"
            onClick={() => tb.onNavigate("NEXT")}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Popover open={miniOpen} onOpenChange={setMiniOpen}>
            <PopoverTrigger className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted/50">
              {format(date, "MMMM yyyy", { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <MiniCalendar
                mode="single"
                selected={date}
                defaultMonth={date}
                captionLayout="dropdown"
                startMonth={new Date(2020, 0)}
                endMonth={new Date(2035, 11)}
                locale={es}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setMiniOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-1">
          {(tb.views as string[]).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={tb.view === v ? "default" : "outline"}
              onClick={() => tb.onView(v as View)}
            >
              {VIEW_LABELS[v] ?? v}
            </Button>
          ))}
        </div>
      </div>
    ),
    [date, miniOpen],
  );

  const components = useMemo(
    () => ({ toolbar: renderToolbar, event: EventChip }),
    [renderToolbar, EventChip],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium">Calendario</h1>
        <Link href="/eventos/nuevo" className={buttonVariants({ size: "sm" })}>
          <Plus className="size-4" /> Nuevo evento
        </Link>
      </div>

      {/* Legend = state filter. Click a tag to show/hide that state. */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {STATES.map((state) => {
          const active = activeStates.has(state);
          return (
            <button
              key={state}
              type="button"
              onClick={() => toggleState(state)}
              aria-pressed={active}
              title={active ? "Ocultar" : "Mostrar"}
              className={`cursor-pointer rounded-full border px-2 py-0.5 text-xs transition-opacity ${
                active ? "border-border/60" : "border-dashed border-border opacity-40 line-through"
              }`}
              style={{ backgroundColor: STATE_COLORS[state], color: STATE_TEXT[state] }}
            >
              {statusBadgeLabel(state)}
            </button>
          );
        })}
        {activeStates.size < STATES.length && (
          <button
            type="button"
            onClick={() => setActiveStates(new Set(STATES))}
            className="cursor-pointer rounded-full border border-border/60 px-2 py-0.5 text-xs hover:bg-muted/50"
          >
            Mostrar todos
          </button>
        )}
        {holidays.length > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
            style={{ backgroundColor: HOLIDAY_COLOR.bg, color: HOLIDAY_COLOR.text, borderColor: HOLIDAY_COLOR.border }}
            title="Feriado nacional (Argentina)"
          >
            <PartyPopper className="size-3" /> Feriado
          </span>
        )}
      </div>

      {/* Color mode toggle (recolors chips — NOT a filter) + type-color key */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Colorear por:</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={colorBy === "state" ? "default" : "outline"}
            onClick={() => setColorBy("state")}
          >
            Estado
          </Button>
          <Button
            type="button"
            size="sm"
            variant={colorBy === "type" ? "default" : "outline"}
            onClick={() => setColorBy("type")}
          >
            Tipo
          </Button>
        </div>
        {colorBy === "type" && typesPresent.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {typesPresent.map((t) => {
              const c = colorForEventType(t);
              return (
                <span
                  key={t}
                  className="rounded-full border border-border/60 px-2 py-0.5 text-xs"
                  style={{ backgroundColor: c.bg, color: c.text }}
                >
                  {t}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule failure notice (replaces window.alert) */}
      {rescheduleError && (
        <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>{rescheduleError}</span>
          <button
            type="button"
            onClick={() => setRescheduleError(null)}
            aria-label="Cerrar aviso"
            className="font-medium hover:underline"
          >
            ×
          </button>
        </div>
      )}

      {/* Calendar */}
      <div className="min-h-0 flex-1" style={{ height: "calc(100vh - 260px)" }}>
        <DnDCalendar
          localizer={localizer}
          events={calendarEvents}
          view={view}
          date={date}
          views={["month", "week", "day", "agenda"]}
          onView={setView}
          onNavigate={handleNavigate}
          onDrillDown={handleDrillDown}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleReschedule}
          onEventResize={handleReschedule}
          draggableAccessor={(e) => !(e as CalendarEvent).isHoliday}
          selectable
          resizable
          popup
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayStyleGetter}
          components={components}
          messages={MESSAGES}
          culture="es"
          style={{ height: "100%" }}
        />
      </div>

      {/* Double-booking confirmation for drag-to-reschedule */}
      <ConfirmDialog
        open={pendingMove !== null}
        title="Posible superposición"
        description="Este horario se superpone con otro evento. ¿Mover de todas formas?"
        confirmLabel="Mover de todas formas"
        onConfirm={() => {
          if (pendingMove) {
            void applyReschedule(pendingMove.event.id, pendingMove.startMs, pendingMove.endMs);
          }
          setPendingMove(null);
        }}
        onCancel={() => setPendingMove(null)}
      />
    </div>
  );
}
