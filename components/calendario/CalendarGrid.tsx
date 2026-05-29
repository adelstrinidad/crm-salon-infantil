import Link from "next/link";
import { statusBadgeClass, statusBadgeLabel } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

type CalendarEvent = {
  id: string;
  name: string;
  startAt: Date;
  state: string;
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const LEGEND_STATES = ["PRESUPUESTADO", "RESERVADO", "SENADO", "PAGADO", "CERRADO", "SUSPENDIDO"];

type Props = {
  year: number;
  month: number; // 0-indexed
  events: CalendarEvent[];
};

export function CalendarGrid({ year, month, events }: Props) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0 … Sun=6

  const cells: (number | null)[] = [
    ...Array<null>(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  for (const ev of events) {
    const day = new Date(ev.startAt).getDate();
    (eventsByDay[day] ??= []).push(ev);
  }

  const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
  const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
  const today = new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/calendario?year=${prev.year}&month=${prev.month}`}
          className="px-3 py-1 rounded-md border border-border text-sm hover:bg-muted"
        >
          ← Anterior
        </Link>
        <h2 className="font-heading text-lg font-medium tracking-tight">
          {MONTH_NAMES[month]} {year}
        </h2>
        <Link
          href={`/calendario?year=${next.year}&month=${next.month}`}
          className="px-3 py-1 rounded-md border border-border text-sm hover:bg-muted"
        >
          Siguiente →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {LEGEND_STATES.map((state) => (
          <span
            key={state}
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              statusBadgeClass(state),
            )}
          >
            {statusBadgeLabel(state)}
          </span>
        ))}
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="grid grid-cols-7 bg-muted/60">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-medium py-2 text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-t border-border/60">
            {week.map((day, di) => {
              const isToday =
                day !== null &&
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;
              return (
                <div
                  key={di}
                  className={cn(
                    "min-h-[80px] p-1 border-l border-border/60 first:border-l-0",
                    day === null && "bg-muted/30",
                  )}
                >
                  {day !== null && (
                    <>
                      <div
                        className={cn(
                          "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                          isToday && "bg-primary text-primary-foreground",
                        )}
                      >
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {(eventsByDay[day] ?? []).map((ev) => (
                          <Link
                            key={ev.id}
                            href={`/eventos/${ev.id}/editar`}
                            className={cn(
                              "block text-xs px-1 py-0.5 rounded truncate border",
                              statusBadgeClass(ev.state),
                            )}
                            title={ev.name}
                          >
                            {ev.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
