import { describe, it, expect } from "vitest";
import { pesosToCents, parsePesosToCents, centsToPesos, formatMoney } from "./money";

// Money is stored as integer cents everywhere. These tests lock the boundary
// conversions (pesos string ↔ cents) and the display formatter so a rounding
// regression can't silently corrupt every financial figure in the app.

describe("pesosToCents", () => {
  it("converts whole pesos to cents", () => {
    expect(pesosToCents(150)).toBe(15000);
  });

  it("converts decimal pesos to cents", () => {
    expect(pesosToCents(15.5)).toBe(1550);
  });

  it("rounds to the nearest cent (no float drift)", () => {
    // 19.99 * 100 = 1998.9999... in float; must round to 1999.
    expect(pesosToCents(19.99)).toBe(1999);
    expect(pesosToCents(0.1 + 0.2)).toBe(30); // 0.30000000000000004 → 30
  });

  it("handles zero", () => {
    expect(pesosToCents(0)).toBe(0);
  });
});

describe("parsePesosToCents", () => {
  it("parses a numeric string", () => {
    expect(parsePesosToCents("150")).toBe(15000);
    expect(parsePesosToCents("15.5")).toBe(1550);
  });

  it("returns 0 for undefined / null / empty", () => {
    expect(parsePesosToCents(undefined)).toBe(0);
    expect(parsePesosToCents(null)).toBe(0);
    expect(parsePesosToCents("")).toBe(0);
  });

  it("returns 0 for non-numeric input instead of NaN cents", () => {
    expect(parsePesosToCents("abc")).toBe(0);
  });

  it("parses leading-numeric strings like parseFloat does", () => {
    expect(parsePesosToCents("12.50 pesos")).toBe(1250);
  });
});

describe("centsToPesos", () => {
  it("is the inverse of pesosToCents for clean values", () => {
    expect(centsToPesos(15000)).toBe(150);
    expect(centsToPesos(1550)).toBe(15.5);
  });
});

describe("formatMoney", () => {
  it("formats whole amounts with the peso sign", () => {
    // es-AR uses '.' as thousands separator.
    expect(formatMoney(1500000)).toBe("$15.000");
  });

  it("shows decimals only when present", () => {
    expect(formatMoney(1550050)).toBe("$15.500,5");
  });

  it("formats zero", () => {
    expect(formatMoney(0)).toBe("$0");
  });
});
