import Link from "next/link";

type CalendarEvent = {
  id: string;
  name: string;
  startAt: Date;
  state: string;
};

const STATE_COLORS: Record<string, string> = {
  PRESUPUESTADO: "bg-yellow-100 text-yellow-800 border-yellow-200",
  RESERVADO:     "bg-blue-100 text-blue-800 border-blue-200",
  SENADO:        "bg-orange-100 text-orange-800 border-orange-200",
  PAGADO:        "bg-green-100 text-green-800 border-green-200",
  CERRADO:       "bg-purple-100 text-purple-800 border-purple-200",
  SUSPENDIDO:    "bg-red-100 text-red-800 border-red-200",
};

const STATE_LABELS: Record<string, string> = {
  PRESUPUESTADO: "Presupuestado",
  RESERVADO:     "Reservado",
  SENADO:        "Señado",
  PAGADO:        "Pagado",
  CERRADO:       "Cerrado",
  SUSPENDIDO:    "Suspendido",
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

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
          className="px-3 py-1 rounded border text-sm hover:bg-muted"
        >
          ← Anterior
        </Link>
        <h2 className="text-lg font-semibold">{MONTH_NAMES[month]} {year}</h2>
        <Link
          href={`/calendario?year=${next.year}&month=${next.month}`}
          className="px-3 py-1 rounded border text-sm hover:bg-muted"
        >
          Siguiente →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(STATE_LABELS).map(([state, label]) => (
          <span key={state} className={`text-xs px-2 py-0.5 rounded border ${STATE_COLORS[state]}`}>
            {label}
          </span>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-medium py-2 text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-t">
            {week.map((day, di) => {
              const isToday =
                day !== null &&
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;
              return (
                <div
                  key={di}
                  className={`min-h-[80px] p-1 border-l first:border-l-0 ${day === null ? "bg-muted/30" : ""}`}
                >
                  {day !== null && (
                    <>
                      <div
                        className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday ? "bg-primary text-primary-foreground" : ""
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {(eventsByDay[day] ?? []).map((ev) => (
                          <Link
                            key={ev.id}
                            href={`/eventos/${ev.id}/editar`}
                            className={`block text-xs px-1 py-0.5 rounded truncate border ${
                              STATE_COLORS[ev.state] ?? "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
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
