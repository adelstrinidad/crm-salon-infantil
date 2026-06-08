import { describe, it, expect } from "vitest";
import { computeEventFinancials, effectiveProviderCost, type EventLines } from "./financials";

// The event financial summary is the core domain calculation: it drives the
// detail page, the presupuesto, the edit page, and every report. These tests
// lock down the formula across services, providers, bonificados, and hourly staff.

const empty: EventLines = { services: [], providers: [], bonificados: [], staff: [] };

describe("computeEventFinancials", () => {
  it("returns all zeros for an empty event", () => {
    expect(computeEventFinancials(empty)).toEqual({
      servicePrice: 0,
      serviceCost: 0,
      providerCost: 0,
      staffCost: 0,
      totalBonificado: 0,
      subtotal: 0,
      totalCost: 0,
      profit: 0,
    });
  });

  it("multiplies service price and cost by qty", () => {
    const f = computeEventFinancials({
      ...empty,
      services: [{ qty: 3, service: { cost: 100, price: 250 } }],
    });
    expect(f.servicePrice).toBe(750);
    expect(f.serviceCost).toBe(300);
    expect(f.subtotal).toBe(750);
    expect(f.totalCost).toBe(300);
    expect(f.profit).toBe(450);
  });

  it("sums provider cost into total cost (providers have no qty)", () => {
    const f = computeEventFinancials({
      ...empty,
      providers: [{ cost: 500 }, { cost: 300 }],
    });
    expect(f.providerCost).toBe(800);
    expect(f.totalCost).toBe(800);
    expect(f.profit).toBe(-800);
  });

  it("uses the explicit per-event provider cost", () => {
    expect(effectiveProviderCost({ cost: 900 })).toBe(900);
    expect(effectiveProviderCost({ cost: 0 })).toBe(0);

    const f = computeEventFinancials({
      ...empty,
      providers: [{ cost: 1200 }, { cost: 300 }],
    });
    expect(f.providerCost).toBe(1500); // 1200 + 300
  });

  it("subtracts bonificados from the subtotal but not from cost", () => {
    const f = computeEventFinancials({
      ...empty,
      services: [{ qty: 1, service: { cost: 200, price: 1000 } }],
      bonificados: [{ qty: 2, service: { price: 150 } }],
    });
    expect(f.servicePrice).toBe(1000);
    expect(f.totalBonificado).toBe(300);
    expect(f.subtotal).toBe(700); // 1000 - 300
    expect(f.totalCost).toBe(200);
    expect(f.profit).toBe(500); // 700 - 200
  });

  it("combines services, providers, and bonificados", () => {
    const f = computeEventFinancials({
      ...empty,
      services: [
        { qty: 2, service: { cost: 100, price: 300 } }, // price 600, cost 200
        { qty: 1, service: { cost: 50, price: 200 } }, //  price 200, cost 50
      ],
      providers: [{ cost: 400 }], // cost 400
      bonificados: [{ qty: 1, service: { price: 100 } }], // bonificado 100
    });
    expect(f.servicePrice).toBe(800);
    expect(f.serviceCost).toBe(250);
    expect(f.providerCost).toBe(400);
    expect(f.totalBonificado).toBe(100);
    expect(f.subtotal).toBe(700); // 800 - 100
    expect(f.totalCost).toBe(650); // 250 + 400
    expect(f.profit).toBe(50); // 700 - 650
  });

  it("can produce a negative profit when costs exceed the subtotal", () => {
    const f = computeEventFinancials({
      ...empty,
      services: [{ qty: 1, service: { cost: 900, price: 1000 } }],
      providers: [{ cost: 500 }],
      bonificados: [{ qty: 1, service: { price: 400 } }],
    });
    expect(f.subtotal).toBe(600); // 1000 - 400
    expect(f.totalCost).toBe(1400); // 900 + 500
    expect(f.profit).toBe(-800);
  });

  // ── Hourly staff: venue cost only, never billed to the client ──────────────
  it("adds staff cost to totalCost and lowers profit, never touching subtotal", () => {
    const f = computeEventFinancials({
      ...empty,
      services: [{ qty: 1, service: { cost: 0, price: 1000 } }],
      // 250000 cents/h × 300 min = 1.250.000 + 400000/h × 240 min = 1.600.000
      staff: [
        { estMinutes: 300, actualMinutes: null, staff: { hourlyRate: 250000 } },
        { estMinutes: 240, actualMinutes: null, staff: { hourlyRate: 400000 } },
      ],
    });
    expect(f.staffCost).toBe(1250000 + 1600000);
    expect(f.servicePrice).toBe(1000);
    expect(f.subtotal).toBe(1000); // unchanged by staff
    expect(f.totalCost).toBe(1250000 + 1600000);
    expect(f.profit).toBe(1000 - (1250000 + 1600000));
  });

  it("uses actual minutes over the estimate when logged", () => {
    const f = computeEventFinancials({
      ...empty,
      // estimate 300 min but real 330 min logged → bill the real hours.
      staff: [{ estMinutes: 300, actualMinutes: 330, staff: { hourlyRate: 250000 } }],
    });
    expect(f.staffCost).toBe(Math.round((250000 * 330) / 60)); // 1.375.000
  });

  it("treats unregistered staff (both minutes null) as zero cost", () => {
    const f = computeEventFinancials({
      ...empty,
      staff: [{ estMinutes: null, actualMinutes: null, staff: { hourlyRate: 250000 } }],
    });
    expect(f.staffCost).toBe(0);
  });
});
