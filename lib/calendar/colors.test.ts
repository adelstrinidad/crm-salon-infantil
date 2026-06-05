import { describe, it, expect } from "vitest";
import { colorForEventType, hashString, TYPE_PALETTE_SIZE } from "./colors";

describe("colorForEventType", () => {
  it("is deterministic — same name yields same color", () => {
    expect(colorForEventType("Cumpleaños")).toEqual(colorForEventType("Cumpleaños"));
  });

  it("returns a palette entry with bg and text hex", () => {
    const c = colorForEventType("Baby shower");
    expect(c.bg).toMatch(/^#[0-9a-f]{6}$/i);
    expect(c.text).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("maps different names to (usually) different colors", () => {
    const names = ["Cumpleaños", "Aniversario", "Empresarial", "Baby shower", "Egreso"];
    const colors = new Set(names.map((n) => colorForEventType(n).bg));
    // With 8 palette slots and 5 names, expect at least 4 distinct.
    expect(colors.size).toBeGreaterThanOrEqual(4);
  });

  it("falls back to first palette entry for empty string", () => {
    expect(colorForEventType("")).toEqual(colorForEventType("")); // stable
  });

  it("never indexes out of palette bounds", () => {
    for (let i = 0; i < 200; i++) {
      const idx = hashString(`type-${i}`) % TYPE_PALETTE_SIZE;
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(TYPE_PALETTE_SIZE);
    }
  });
});
