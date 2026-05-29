import { describe, it, expect } from "vitest";
import { computeEventFinancials, type EventLines } from "./financials";

// The event financial summary is the core domain calculation: it drives the
// detail page, the presupuesto, the edit page, and every report. These tests
// lock down the formula across services, providers, and bonificados.

const empty: EventLines = { services: [], providers: [], bonificados: [] };

describe("computeEventFinancials", () => {
  it("returns all zeros for an empty event", () => {
    expect(computeEventFinancials(empty)).toEqual({
      servicePrice: 0,
      serviceCost: 0,
      providerCost: 0,
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
      providers: [{ provider: { cost: 500 } }, { provider: { cost: 300 } }],
    });
    expect(f.providerCost).toBe(800);
    expect(f.totalCost).toBe(800);
    expect(f.profit).toBe(-800);
  });

  it("subtracts bonificados from the subtotal but not from cost", () => {
    const f = computeEventFinancials({
      services: [{ qty: 1, service: { cost: 200, price: 1000 } }],
      providers: [],
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
      services: [
        { qty: 2, service: { cost: 100, price: 300 } }, // price 600, cost 200
        { qty: 1, service: { cost: 50, price: 200 } }, //  price 200, cost 50
      ],
      providers: [{ provider: { cost: 400 } }], // cost 400
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
      services: [{ qty: 1, service: { cost: 900, price: 1000 } }],
      providers: [{ provider: { cost: 500 } }],
      bonificados: [{ qty: 1, service: { price: 400 } }],
    });
    expect(f.subtotal).toBe(600); // 1000 - 400
    expect(f.totalCost).toBe(1400); // 900 + 500
    expect(f.profit).toBe(-800);
  });
});
