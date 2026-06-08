import { describe, it, expect } from "vitest";
import {
  isHalfHourMinutes,
  parseHHMM,
  formatHHMM,
  staffLineCost,
  effectiveMinutes,
} from "./hours";

describe("isHalfHourMinutes", () => {
  it("accepts non-negative multiples of 30", () => {
    expect(isHalfHourMinutes(0)).toBe(true);
    expect(isHalfHourMinutes(30)).toBe(true);
    expect(isHalfHourMinutes(300)).toBe(true);
    expect(isHalfHourMinutes(330)).toBe(true);
  });
  it("rejects non-multiples of 30, negatives, and non-integers", () => {
    expect(isHalfHourMinutes(45)).toBe(false);
    expect(isHalfHourMinutes(31)).toBe(false);
    expect(isHalfHourMinutes(-30)).toBe(false);
    expect(isHalfHourMinutes(30.5)).toBe(false);
  });
});

describe("parseHHMM / formatHHMM round-trip", () => {
  it("combines hours and minutes into total minutes", () => {
    expect(parseHHMM(5, 30)).toBe(330);
    expect(parseHHMM(0, 30)).toBe(30);
    expect(parseHHMM(4, 0)).toBe(240);
  });
  it("formats stored minutes as hh:mm", () => {
    expect(formatHHMM(330)).toBe("5:30");
    expect(formatHHMM(300)).toBe("5:00");
    expect(formatHHMM(90)).toBe("1:30");
    expect(formatHHMM(0)).toBe("0:00");
    expect(formatHHMM(null)).toBe("0:00");
  });
  it("round-trips through parse → format", () => {
    for (const [h, m] of [[5, 30], [2, 0], [0, 30], [10, 30]]) {
      expect(formatHHMM(parseHHMM(h, m))).toBe(`${h}:${String(m).padStart(2, "0")}`);
    }
  });
});

describe("staffLineCost", () => {
  it("computes rate × minutes / 60 rounded to the nearest cent", () => {
    // $2.500,00/h = 250000 cents/h. 5h = 1.250.000 cents.
    expect(staffLineCost(250000, 300)).toBe(1250000);
    // 4:30 at 250000 = 250000 * 270 / 60 = 1.125.000.
    expect(staffLineCost(250000, 270)).toBe(1125000);
  });
  it("rounds half-hour fractions of an odd rate", () => {
    // odd rate 333 cents/h for 30 min = 333 * 30 / 60 = 166.5 → 167.
    expect(staffLineCost(333, 30)).toBe(167);
  });
  it("is zero when minutes are zero", () => {
    expect(staffLineCost(250000, 0)).toBe(0);
  });
});

describe("effectiveMinutes", () => {
  it("prefers actual over estimate", () => {
    expect(effectiveMinutes(300, 330)).toBe(330);
  });
  it("falls back to the estimate when actual is null", () => {
    expect(effectiveMinutes(300, null)).toBe(300);
  });
  it("is zero when neither is set", () => {
    expect(effectiveMinutes(null, null)).toBe(0);
  });
});
