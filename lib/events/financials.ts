// Single source of truth for an event's financial summary.
// Pure function over line items — no Prisma dependency, so it is reused by the
// reports service, the event detail page, the presupuesto page, and the edit
// page, and is unit-testable in isolation.

export type ServiceLineInput = { qty: number; service: { cost: number; price: number } };
export type ProviderLineInput = { provider: { cost: number } };
export type BonificadoLineInput = { qty: number; service: { price: number } };

export type EventLines = {
  services: ServiceLineInput[];
  providers: ProviderLineInput[];
  bonificados: BonificadoLineInput[];
};

export type EventFinancials = {
  servicePrice: number;   // sum of service price * qty
  serviceCost: number;    // sum of service cost * qty
  providerCost: number;   // sum of provider cost
  totalBonificado: number; // sum of waived service price * qty
  subtotal: number;       // servicePrice - totalBonificado (what the client pays)
  totalCost: number;      // serviceCost + providerCost (what the venue spends)
  profit: number;         // subtotal - totalCost
};

export function computeEventFinancials(lines: EventLines): EventFinancials {
  const servicePrice = lines.services.reduce((s, l) => s + l.service.price * l.qty, 0);
  const serviceCost = lines.services.reduce((s, l) => s + l.service.cost * l.qty, 0);
  const providerCost = lines.providers.reduce((s, l) => s + l.provider.cost, 0);
  const totalBonificado = lines.bonificados.reduce((s, l) => s + l.service.price * l.qty, 0);
  const subtotal = servicePrice - totalBonificado;
  const totalCost = serviceCost + providerCost;
  return {
    servicePrice,
    serviceCost,
    providerCost,
    totalBonificado,
    subtotal,
    totalCost,
    profit: subtotal - totalCost,
  };
}
