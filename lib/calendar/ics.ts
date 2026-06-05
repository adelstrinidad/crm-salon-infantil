// Minimal RFC 5545 iCalendar serializer — no external dependency.
// Feeds a read-only .ics subscription so staff see bookings in their phone
// calendar. `stamp` is passed in (not Date.now()) to keep this pure/testable.

export type IcsEvent = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  state: string;
  eventType: string;
};

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

// UTC form: YYYYMMDDTHHMMSSZ
export function formatIcsDate(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

// Escape per RFC 5545 §3.3.11: backslash, semicolon, comma, newline.
export function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function buildIcs(events: IcsEvent[], stamp: Date): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//crm-salon-infantil//Calendario//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Salón Infantil",
  ];
  const dtstamp = formatIcsDate(stamp);
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@crm-salon-infantil`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${formatIcsDate(e.startAt)}`,
      `DTEND:${formatIcsDate(e.endAt)}`,
      `SUMMARY:${escapeIcsText(e.name)}`,
      `DESCRIPTION:${escapeIcsText(`${e.eventType} — ${e.state}`)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  // RFC 5545 requires CRLF line endings.
  return lines.join("\r\n") + "\r\n";
}
