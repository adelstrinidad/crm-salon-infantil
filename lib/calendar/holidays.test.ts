import { describe, it, expect } from "vitest";
import { parseHolidays } from "./holidays";

describe("parseHolidays", () => {
  it("maps date + localName to local-midnight ms", () => {
    const r = parseHolidays([{ date: "2026-05-25", localName: "Día de la Revolución", name: "May Revolution" }]);
    expect(r).toHaveLength(1);
    expect(r[0].name).toBe("Día de la Revolución");
    const d = new Date(r[0].dateMs);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4); // May = 4
    expect(d.getDate()).toBe(25);
    expect(d.getHours()).toBe(0); // local midnight
  });

  it("falls back to English name then 'Feriado'", () => {
    expect(parseHolidays([{ date: "2026-01-01", name: "New Year" }])[0].name).toBe("New Year");
    expect(parseHolidays([{ date: "2026-01-01" }])[0].name).toBe("Feriado");
  });

  it("skips malformed / non-array input", () => {
    expect(parseHolidays(null)).toEqual([]);
    expect(parseHolidays({})).toEqual([]);
    expect(parseHolidays([{ date: "not-a-date" }, { localName: "x" }])).toEqual([]);
  });

  it("parses a multi-entry list", () => {
    const r = parseHolidays([
      { date: "2026-01-01", localName: "Año Nuevo" },
      { date: "2026-12-25", localName: "Navidad" },
    ]);
    expect(r.map((h) => h.name)).toEqual(["Año Nuevo", "Navidad"]);
  });
});
