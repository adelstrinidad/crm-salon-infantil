import { describe, it, expect } from "vitest";
import { findOverlappingIds, overlapsAny } from "./overlap";

const span = (id: string, startMs: number, endMs: number) => ({ id, startMs, endMs });
const H = 60 * 60 * 1000;

describe("findOverlappingIds", () => {
  it("returns empty set for non-overlapping events", () => {
    const r = findOverlappingIds([span("a", 0, H), span("b", 2 * H, 3 * H)]);
    expect(r.size).toBe(0);
  });

  it("flags both events of an overlapping pair", () => {
    const r = findOverlappingIds([span("a", 0, 2 * H), span("b", H, 3 * H)]);
    expect(r).toEqual(new Set(["a", "b"]));
  });

  it("touching edges do NOT overlap (half-open)", () => {
    const r = findOverlappingIds([span("a", 0, H), span("b", H, 2 * H)]);
    expect(r.size).toBe(0);
  });

  it("flags all three when one event spans two others", () => {
    const r = findOverlappingIds([
      span("big", 0, 5 * H),
      span("x", H, 2 * H),
      span("y", 3 * H, 4 * H),
    ]);
    expect(r).toEqual(new Set(["big", "x", "y"]));
  });

  it("leaves a non-conflicting event out of a mixed set", () => {
    const r = findOverlappingIds([
      span("a", 0, 2 * H),
      span("b", H, 3 * H),
      span("solo", 10 * H, 11 * H),
    ]);
    expect(r.has("solo")).toBe(false);
    expect(r.has("a")).toBe(true);
  });
});

describe("overlapsAny", () => {
  const others = [span("a", 0, 2 * H), span("b", 5 * H, 6 * H)];

  it("detects intersection", () => {
    expect(overlapsAny({ startMs: H, endMs: 3 * H }, others)).toBe(true);
  });

  it("returns false when clear", () => {
    expect(overlapsAny({ startMs: 3 * H, endMs: 4 * H }, others)).toBe(false);
  });

  it("excludes the event being moved", () => {
    expect(overlapsAny({ startMs: 0, endMs: 2 * H }, others, "a")).toBe(false);
  });
});
