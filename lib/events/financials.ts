// Single source of truth for an event's financial summary.
// Pure function over line items — no Prisma dependency, so it is reused by the
// reports service, the event detail page, the presupuesto page, and the edit
// page, and is unit-testable in isolation.

import { staffLineCost, effectiveMinutes } from "@/lib/staff/hours";

export type ServiceLineInput = { qty: number; service: { cost: number; price: number } };
// A provider line carries an explicit per-event cost in cents (never null —
// snapshotted from the catalog on assign, overridable per event).
export type ProviderLineInput = { cost: number };

// The cost charged for this provider on this event. Always the explicit
// per-event cost. Kept as a named accessor so callers read intent, not a field.
export function effectiveProviderCost(line: ProviderLineInput): number {
  return line.cost;
}
export type BonificadoLineInput = { qty: number; service: { price: number } };
// Internal hourly staff: a venue cost (never billed to the client). The line
// carries estimated + actual minutes; cost uses the real hours once logged.
export type StaffLineInput = {
  estMinutes: number | null;
  actualMinutes: number | null;
  staff: { hourlyRate: number };
};

export type EventLines = {
  services: ServiceLineInput[];
  providers: ProviderLineInput[];
  bonificados: BonificadoLineInput[];
  staff: StaffLineInput[];
};

export type EventFinancials = {
  servicePrice: number;   // sum of service price * qty
  serviceCost: number;    // sum of service cost * qty
  providerCost: number;   // sum of provider cost
  staffCost: number;      // sum of hourly staff cost (venue only — not billed to client)
  totalBonificado: number; // sum of waived service price * qty
  subtotal: number;       // servicePrice - totalBonificado (what the client pays)
  totalCost: number;      // serviceCost + providerCost + staffCost (what the venue spends)
  profit: number;         // subtotal - totalCost
};

export function computeEventFinancials(lines: EventLines): EventFinancials {
  const servicePrice = lines.services.reduce((s, l) => s + l.service.price * l.qty, 0);
  const serviceCost = lines.services.reduce((s, l) => s + l.service.cost * l.qty, 0);
  const providerCost = lines.providers.reduce((s, l) => s + effectiveProviderCost(l), 0);
  // Staff hours are a venue cost only: they raise totalCost / lower profit but
  // never touch servicePrice or subtotal (the client doesn't pay for them).
  const staffCost = (lines.staff ?? []).reduce(
    (s, l) => s + staffLineCost(l.staff.hourlyRate, effectiveMinutes(l.estMinutes, l.actualMinutes)),
    0,
  );
  const totalBonificado = lines.bonificados.reduce((s, l) => s + l.service.price * l.qty, 0);
  const subtotal = servicePrice - totalBonificado;
  const totalCost = serviceCost + providerCost + staffCost;
  return {
    servicePrice,
    serviceCost,
    providerCost,
    staffCost,
    totalBonificado,
    subtotal,
    totalCost,
    profit: subtotal - totalCost,
  };
}
