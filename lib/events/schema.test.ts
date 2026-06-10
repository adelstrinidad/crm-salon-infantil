import { describe, it, expect } from "vitest";
import { cobroSchema } from "./schema";

// The cobro (event payment) input is validated at the Server Action boundary:
// integer positive cents, a chosen account, and a parseable date.

describe("cobroSchema", () => {
  const valid = {
    accountId: "acc-1",
    amount: 50000,
    description: " Seña ",
    date: "2026-06-10",
  };

  it("accepts a valid cobro and transforms the date string into a Date", () => {
    const parsed = cobroSchema.parse(valid);
    expect(parsed.accountId).toBe("acc-1");
    expect(parsed.amount).toBe(50000);
    expect(parsed.description).toBe("Seña"); // trimmed
    expect(parsed.date).toBeInstanceOf(Date);
  });

  it("rejects a missing account", () => {
    const r = cobroSchema.safeParse({ ...valid, accountId: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Seleccioná una cuenta");
  });

  it("rejects zero, negative, and non-integer amounts", () => {
    for (const amount of [0, -100, 100.5]) {
      const r = cobroSchema.safeParse({ ...valid, amount });
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.issues[0].message).toBe("Ingresá un importe válido");
    }
    // NaN fails the number check itself (different message, still rejected).
    expect(cobroSchema.safeParse({ ...valid, amount: NaN }).success).toBe(false);
  });

  it("rejects an empty date", () => {
    const r = cobroSchema.safeParse({ ...valid, date: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("La fecha es requerida");
  });

  it("allows an empty description (the service defaults it)", () => {
    const parsed = cobroSchema.parse({ ...valid, description: "" });
    expect(parsed.description).toBe("");
  });
});
