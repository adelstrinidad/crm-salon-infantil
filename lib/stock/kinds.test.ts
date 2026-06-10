import { describe, it, expect } from "vitest";
import { resolveAdjust } from "./kinds";

describe("resolveAdjust", () => {
  it("consumo and merma subtract", () => {
    expect(resolveAdjust("consumo", 3)).toEqual({ kind: "consumo", delta: -3 });
    expect(resolveAdjust("merma", 2)).toEqual({ kind: "merma", delta: -2 });
  });

  it("ajuste can add or subtract", () => {
    expect(resolveAdjust("ajuste-sumar", 5)).toEqual({ kind: "ajuste", delta: 5 });
    expect(resolveAdjust("ajuste-restar", 4)).toEqual({ kind: "ajuste", delta: -4 });
  });
});
