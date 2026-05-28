import { listEventsInRange } from "@/lib/events/eventService";
import { CalendarClient } from "@/components/calendario/CalendarClient";

type Props = { searchParams: Promise<{ year?: string }> };

export default async function CalendarioPage({ searchParams }: Props) {
  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ? parseInt(sp.year) : now.getFullYear();

  // Load full year ± 1 month buffer so client-side navigation feels instant
  const start = new Date(year - 1, 11, 1);
  const end = new Date(year + 1, 0, 31, 23, 59, 59);
  const events = await listEventsInRange(start, end);

  return (
    <CalendarClient
      events={events.map((e) => ({
        id: e.id,
        title: e.name,
        startMs: new Date(e.startAt).getTime(),
        endMs: new Date(e.endAt).getTime(),
        state: e.state,
      }))}
      defaultDateMs={new Date(year, now.getMonth(), 1).getTime()}
    />
  );
}
