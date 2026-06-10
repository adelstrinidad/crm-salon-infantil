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

  // Security: a lone CR (or a CRLF) in user input must not survive into the
  // output, or it could inject a new ICS content line (a forged property).
  it("neutralises lone carriage returns and CRLF", () => {
    expect(escapeIcsText("a\rb")).toBe("a\\nb");
    expect(escapeIcsText("a\r\nb")).toBe("a\\nb");
    const bad = escapeIcsText("SUMMARY:x\r\nDESCRIPTION:evil");
    expect(bad).not.toContain("\r");
    expect(bad).not.toContain("\n");
  });

  // Colons are legal literals in a TEXT value and must be left intact.
  it("does not escape colons", () => {
    expect(escapeIcsText("Fiesta: Mateo")).toBe("Fiesta: Mateo");
  });
});

// An attacker-controlled event name with a line break must not break out of
// the SUMMARY line into a forged property; the feed stays well-formed.
describe("buildIcs — injection resistance", () => {
  it("keeps a malicious event name on a single SUMMARY line", () => {
    const ics = buildIcs(
      [
        {
          id: "x",
          name: "Hack\r\nATTENDEE:mailto:evil@x.com",
          startAt: new Date(Date.UTC(2026, 0, 1, 0, 0, 0)),
          endAt: new Date(Date.UTC(2026, 0, 1, 1, 0, 0)),
          state: "PAGADO",
          eventType: "Cumpleaños",
        },
      ],
      STAMP,
    );
    // No content line is a forged ATTENDEE property — the break was escaped, so
    // the malicious text stays inside the SUMMARY value on one line.
    const lines = ics.split("\r\n");
    expect(lines.some((l) => l.startsWith("ATTENDEE"))).toBe(false);
    expect(lines).toContain("SUMMARY:Hack\\nATTENDEE:mailto:evil@x.com");
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
