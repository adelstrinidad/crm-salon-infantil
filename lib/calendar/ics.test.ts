import { describe, it, expect } from "vitest";
import { buildIcs, escapeIcsText, formatIcsDate } from "./ics";

const STAMP = new Date(Date.UTC(2026, 5, 5, 12, 0, 0));

describe("formatIcsDate", () => {
  it("formats UTC as YYYYMMDDTHHMMSSZ", () => {
    expect(formatIcsDate(new Date(Date.UTC(2026, 8, 15, 17, 30, 0)))).toBe("20260915T173000Z");
  });

  it("zero-pads single digits", () => {
    expect(formatIcsDate(new Date(Date.UTC(2026, 0, 3, 4, 5, 6)))).toBe("20260103T040506Z");
  });
});

describe("escapeIcsText", () => {
  it("escapes commas, semicolons, backslashes, newlines", () => {
    expect(escapeIcsText("a, b; c\\d\ne")).toBe("a\\, b\\; c\\\\d\\ne");
  });
});

describe("buildIcs", () => {
  const events = [
    {
      id: "evt1",
      name: "Cumple, Mateo",
      startAt: new Date(Date.UTC(2026, 8, 15, 17, 0, 0)),
      endAt: new Date(Date.UTC(2026, 8, 15, 20, 0, 0)),
      state: "PAGADO",
      eventType: "Cumpleaños",
    },
  ];

  it("wraps events in a VCALENDAR with CRLF endings", () => {
    const ics = buildIcs(events, STAMP);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("\r\n");
  });

  it("emits one VEVENT per event with escaped summary", () => {
    const ics = buildIcs(events, STAMP);
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(1);
    expect(ics).toContain("SUMMARY:Cumple\\, Mateo");
    expect(ics).toContain("DTSTART:20260915T170000Z");
    expect(ics).toContain("DTEND:20260915T200000Z");
    expect(ics).toContain("UID:evt1@crm-salon-infantil");
  });

  it("produces a valid empty calendar for no events", () => {
    const ics = buildIcs([], STAMP);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).not.toContain("BEGIN:VEVENT");
  });
});
