import { describe, it, expect } from "vitest";
import { resolvePaidState } from "./paymentState";

// Auto state-advance when a payment is recorded. Amounts in cents.
describe("resolvePaidState", () => {
  it("advances to PAGADO when fully paid", () => {
    expect(resolvePaidState("RESERVADO", 100_00, 100_00)).toBe("PAGADO");
  });

  it("advances to PAGADO when overpaid", () => {
    expect(resolvePaidState("RESERVADO", 150_00, 100_00)).toBe("PAGADO");
  });

  it("advances to PAGADO from PRESUPUESTADO and SENADO too", () => {
    expect(resolvePaidState("PRESUPUESTADO", 100_00, 100_00)).toBe("PAGADO");
    expect(resolvePaidState("SENADO", 100_00, 100_00)).toBe("PAGADO");
  });

  it("advances a quote/reservation to SENADO on a partial payment", () => {
    expect(resolvePaidState("PRESUPUESTADO", 40_00, 100_00)).toBe("SENADO");
    expect(resolvePaidState("RESERVADO", 40_00, 100_00)).toBe("SENADO");
  });

  it("does not change SENADO on a further partial payment (still owes)", () => {
    expect(resolvePaidState("SENADO", 60_00, 100_00)).toBeNull();
  });

  it("returns null when nothing has been collected", () => {
    expect(resolvePaidState("RESERVADO", 0, 100_00)).toBeNull();
  });

  it("returns null when already PAGADO", () => {
    expect(resolvePaidState("PAGADO", 100_00, 100_00)).toBeNull();
  });

  it("never auto-changes CERRADO, SUSPENDIDO or EN_CURSO", () => {
    expect(resolvePaidState("CERRADO", 100_00, 100_00)).toBeNull();
    expect(resolvePaidState("SUSPENDIDO", 100_00, 100_00)).toBeNull();
    // While running, the badge must keep saying "En curso" — staff closes it
    // manually after the party regardless of payments.
    expect(resolvePaidState("EN_CURSO", 100_00, 100_00)).toBeNull();
    expect(resolvePaidState("EN_CURSO", 40_00, 100_00)).toBeNull();
  });

  it("returns null when the event has no price", () => {
    expect(resolvePaidState("RESERVADO", 0, 0)).toBeNull();
  });
});
