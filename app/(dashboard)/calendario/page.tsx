import { listEventsInRange } from "@/lib/events/eventService";
import { fetchArgentineHolidaysForYears } from "@/lib/calendar/holidays";
import { CalendarClient } from "@/components/calendario/CalendarClient";

type Props = { searchParams: Promise<{ year?: string }> };

export default async function CalendarioPage({ searchParams }: Props) {
  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ? parseInt(sp.year) : now.getFullYear();

  // Load full year ± 1 month buffer so client-side navigation feels instant
  const start = new Date(year - 1, 11, 1);
  const end = new Date(year + 1, 0, 31, 23, 59, 59);
  // Holidays span the same year buffer; the fetch degrades to [] on failure.
  const [events, holidays] = await Promise.all([
    listEventsInRange(start, end),
    fetchArgentineHolidaysForYears([year - 1, year, year + 1]),
  ]);

  return (
    <CalendarClient
      events={events.map((e) => ({
        id: e.id,
        title: e.name,
        startMs: new Date(e.startAt).getTime(),
        endMs: new Date(e.endAt).getTime(),
        state: e.state,
        eventType: e.eventType,
      }))}
      holidays={holidays}
      defaultDateMs={new Date(year, now.getMonth(), now.getDate()).getTime()}
    />
  );
}
