import { describe, expect, it } from "vitest";
import { reversalSchema } from "./schema";

const base = {
  kind: "event-provider" as const,
  id: "ep_1",
  managerCode: "1234",
  reason: "pago-duplicado" as const,
};

describe("reversalSchema", () => {
  it("accepts a valid reversal without free text", () => {
    expect(reversalSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a missing manager code", () => {
    const r = reversalSchema.safeParse({ ...base, managerCode: "" });
    expect(r.success).toBe(false);
  });

  it("requires free text when reason is 'otro'", () => {
    const r = reversalSchema.safeParse({ ...base, reason: "otro" });
    expect(r.success).toBe(false);
    const ok = reversalSchema.safeParse({
      ...base,
      reason: "otro",
      reasonText: "ajuste manual",
    });
    expect(ok.success).toBe(true);
  });

  it("rejects an unknown kind", () => {
    const r = reversalSchema.safeParse({ ...base, kind: "bonificado" });
    expect(r.success).toBe(false);
  });
});
