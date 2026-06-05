import { prisma } from "@/lib/prisma";

export { prisma };

// Wipe every table between tests so each test starts from a known-empty DB.
// Order matters: delete children (rows with foreign keys) before their parents.
//   Movement → eventId/accountId    EventService/Bonificado/Provider → eventId/serviceId/providerId
//   Event → clientId                 Service → proveedorId
export async function resetDb() {
  await prisma.movement.deleteMany();
  await prisma.eventService.deleteMany();
  await prisma.eventBonificado.deleteMany();
  await prisma.eventProvider.deleteMany();
  await prisma.event.deleteMany();
  await prisma.service.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.account.deleteMany();
  await prisma.client.deleteMany();
  await prisma.eventType.deleteMany();
}

// ── Factories ──────────────────────────────────────────────────────────────
// Insert a minimal valid row; accept overrides for the fields a test cares
// about. All money is in integer cents. Each returns the created row.

let seq = 0;
const uniq = () => `${Date.now()}-${seq++}`;

export function makeAccount(overrides: Partial<{ name: string; description: string }> = {}) {
  return prisma.account.create({
    data: { name: `Caja ${uniq()}`, ...overrides },
  });
}

export function makeProveedor(overrides: Partial<{ name: string }> = {}) {
  return prisma.proveedor.create({
    data: { name: `Proveedor ${uniq()}`, ...overrides },
  });
}

export function makeService(
  overrides: Partial<{ name: string; cost: number; price: number; proveedorId: string }> = {}
) {
  return prisma.service.create({
    data: { name: `Servicio ${uniq()}`, cost: 0, price: 0, ...overrides },
  });
}

export function makeProvider(overrides: Partial<{ name: string; cost: number; role: string }> = {}) {
  return prisma.provider.create({
    data: { name: `Prestador ${uniq()}`, cost: 0, ...overrides },
  });
}

type EventOverrides = Partial<{
  name: string;
  eventType: string;
  clientName: string;
  startAt: Date;
  endAt: Date;
  state:
    | "PRESUPUESTADO"
    | "RESERVADO"
    | "SENADO"
    | "PAGADO"
    | "CERRADO"
    | "SUSPENDIDO";
  totalPrice: number;
}>;

export function makeEvent(overrides: EventOverrides = {}) {
  const startAt = overrides.startAt ?? new Date("2026-06-01T15:00:00");
  return prisma.event.create({
    data: {
      name: `Evento ${uniq()}`,
      eventType: "Cumpleaños",
      clientName: "Cliente Test",
      startAt,
      endAt: overrides.endAt ?? new Date(startAt.getTime() + 3 * 60 * 60 * 1000),
      totalPrice: 0,
      ...overrides,
    },
  });
}

export function makeMovement(
  accountId: string,
  overrides: Partial<{
    type:
      | "INGRESO"
      | "EGRESO"
      | "TRANSFERENCIA"
      | "ARQUEO"
      | "INVERSION"
      | "RETIRO";
    amount: number;
    date: Date;
    toAccountId: string;
    eventId: string;
  }> = {}
) {
  return prisma.movement.create({
    data: {
      accountId,
      type: "INGRESO",
      amount: 0,
      date: new Date("2026-06-01"),
      ...overrides,
    },
  });
}
