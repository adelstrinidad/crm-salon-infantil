"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { statusBadgeLabel } from "@/components/ui/status-badge";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "es": es },
});

// Soft palette aligned with StatusBadge soft hues (linen-cream compatible).
// Inline hex required: react-big-calendar passes styles via eventPropGetter.
const STATE_COLORS: Record<string, string> = {
  PRESUPUESTADO: "#ede9fe",
  RESERVADO:     "#dbeafe",
  SENADO:        "#fef3c7",
  PAGADO:        "#d1fae5",
  CERRADO:       "#e7e5e4",
  SUSPENDIDO:    "#ffe4e6",
};

const STATE_TEXT: Record<string, string> = {
  PRESUPUESTADO: "#4c1d95",
  RESERVADO:     "#1e3a8a",
  SENADO:        "#78350f",
  PAGADO:        "#064e3b",
  CERRADO:       "#1c1917",
  SUSPENDIDO:    "#881337",
};

const STATES = ["PRESUPUESTADO", "RESERVADO", "SENADO", "PAGADO", "CERRADO", "SUSPENDIDO"] as const;

const MESSAGES = {
  allDay:     "Todo el día",
  previous:   "Anterior",
  next:       "Siguiente",
  today:      "Hoy",
  month:      "Mes",
  week:       "Semana",
  day:        "Día",
  agenda:     "Lista",
  date:       "Fecha",
  time:       "Hora",
  event:      "Evento",
  noEventsInRange: "No hay eventos en este período.",
  showMore:   (total: number) => `+${total} más`,
};

type RawEvent = {
  id: string;
  title: string;
  startMs: number;
  endMs: number;
  state: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  state: string;
};

type Props = {
  events: RawEvent[];
  defaultDateMs: number;
};

export function CalendarClient({ events, defaultDateMs }: Props) {
  const router = useRouter();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(() => new Date(defaultDateMs));

  const calendarEvents: CalendarEvent[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: new Date(e.startMs),
    end: new Date(e.endMs),
    state: e.state,
  }));
  const [miniOpen, setMiniOpen] = useState(false);

  const eventStyleGetter = useCallback((event: object) => {
    const e = event as CalendarEvent;
    return {
      style: {
        backgroundColor: STATE_COLORS[e.state] ?? "#e5e7eb",
        color: STATE_TEXT[e.state] ?? "#111827",
        border: "none",
        borderRadius: "4px",
        fontSize: "12px",
        padding: "1px 4px",
      },
    };
  }, []);

  const handleSelectEvent = useCallback((event: object) => {
    const e = event as CalendarEvent;
    router.push(`/eventos/${e.id}`);
  }, [router]);

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-heading font-medium">Calendario</h1>
        <div className="flex items-center gap-2">
          {/* Mini calendar picker */}
          <Popover open={miniOpen} onOpenChange={setMiniOpen}>
            <PopoverTrigger
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted/50 font-medium"
            >
              {format(date, "MMMM yyyy", { locale: es }).replace(/^\w/, c => c.toUpperCase())}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <MiniCalendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) { setDate(d); setMiniOpen(false); }
                }}
              />
            </PopoverContent>
          </Popover>
          <a
            href="/eventos/nuevo"
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            + Nuevo evento
          </a>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-3">
        {STATES.map((state) => (
          <span
            key={state}
            className="text-xs px-2 py-0.5 rounded-full border border-border/60"
            style={{ backgroundColor: STATE_COLORS[state], color: STATE_TEXT[state] }}
          >
            {statusBadgeLabel(state)}
          </span>
        ))}
      </div>

      {/* Calendar */}
      <div className="flex-1 min-h-0" style={{ height: "calc(100vh - 220px)" }}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          view={view}
          date={date}
          onView={setView}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={MESSAGES}
          culture="es"
          style={{ height: "100%" }}
          popup
        />
      </div>
    </div>
  );
}
