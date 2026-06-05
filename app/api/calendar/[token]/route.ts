// Read-only iCalendar (.ics) subscription feed.
// Guarded by an unguessable token (CALENDAR_FEED_TOKEN) rather than a session,
// so phone/desktop calendar apps can poll it. No session = no PII beyond event
// name/type/state. Returns 404 (not 401) on bad token to avoid confirming the URL.
import type { NextRequest } from "next/server";
import { listEvents } from "@/lib/events/eventService";
import { buildIcs } from "@/lib/calendar/ics";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/calendar/[token]">) {
  const { token } = await ctx.params;
  const expected = process.env.CALENDAR_FEED_TOKEN;

  if (!expected || token !== expected) {
    return new Response("Not found", { status: 404 });
  }

  const events = await listEvents();
  const ics = buildIcs(
    events.map((e) => ({
      id: e.id,
      name: e.name,
      startAt: e.startAt,
      endAt: e.endAt,
      state: e.state,
      eventType: e.eventType,
    })),
    new Date(),
  );

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="salon-infantil.ics"',
      "Cache-Control": "no-store",
    },
  });
}
