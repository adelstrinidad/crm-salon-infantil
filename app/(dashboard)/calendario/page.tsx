import { listEventsInRange } from "@/lib/events/eventService";
import { CalendarGrid } from "@/components/calendario/CalendarGrid";

type Props = { searchParams: Promise<{ year?: string; month?: string }> };

export default async function CalendarioPage({ searchParams }: Props) {
  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ? parseInt(sp.year) : now.getFullYear();
  const month = sp.month !== undefined ? parseInt(sp.month) : now.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  const events = await listEventsInRange(start, end);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Calendario</h1>
      <CalendarGrid year={year} month={month} events={events} />
    </div>
  );
}
