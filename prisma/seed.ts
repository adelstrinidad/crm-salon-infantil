import path from "path";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { computeEventFinancials } from "../lib/events/financials";

const dbUrl = `file:${path.resolve("dev.db")}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database…");

  // ─── Event types ──────────────────────────────────────────────────────────
  const eventTypes = ["Cumpleaños", "Aniversario", "Empresarial", "Baby shower", "Egreso"];
  for (const name of eventTypes) {
    await prisma.eventType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // ─── Accounts ─────────────────────────────────────────────────────────────
  const accountSeed = [
    { name: "Caja", description: "Efectivo en mano" },
    { name: "Banco", description: "Cuenta bancaria principal" },
    { name: "Mercado Pago", description: "Billetera virtual" },
  ];
  const accounts: Record<string, string> = {};
  for (const a of accountSeed) {
    const existing = await prisma.account.findFirst({ where: { name: a.name } });
    const acc = existing ?? (await prisma.account.create({ data: a }));
    accounts[a.name] = acc.id;
  }

  // ─── Proveedores (insumos — supplies not tied to events) ────────────────────
  // Suppliers of consumables (gaseosas, gas, baño). Their purchasing/stock flow
  // is a later phase; here they just seed the catalog. NOT linked to services.
  const proveedorSeed = [
    { name: "Distribuidora Gaseosas", phone: "+54 11 1111-1111" },
    { name: "Gas del Sur", phone: "+54 11 2222-2222" },
    { name: "Insumos Baño SRL", phone: "+54 11 3333-3333" },
  ];
  for (const p of proveedorSeed) {
    const existing = await prisma.proveedor.findFirst({ where: { name: p.name } });
    if (!existing) await prisma.proveedor.create({ data: p });
  }

  // ─── Prestadores (Provider — external service providers + direct assignees) ──
  // Includes both directly-assignable prestadores (DJ, animadora) and the ones
  // that back a service (catering, decoración, repostería). Created before
  // services because a service may reference its backing prestador.
  const providerSeed = [
    { name: "Lucas Pérez", role: "DJ", cost: 800000 },
    { name: "Mariana Gómez", role: "Animadora", cost: 700000 },
    { name: "Carlos Ruiz", role: "Fotógrafo", cost: 1000000 },
    { name: "Pastelería Dulce", role: "Repostería", cost: 800000 },
    { name: "Decoradora Magia", role: "Decoración", cost: 400000 },
    { name: "Catering Sabores", role: "Catering", cost: 600000 },
  ];
  const providers: Record<string, string> = {};
  for (const p of providerSeed) {
    const existing = await prisma.provider.findFirst({ where: { name: p.name } });
    const prov = existing ?? (await prisma.provider.create({ data: p }));
    providers[p.name] = prov.id;
  }

  // ─── Services ─────────────────────────────────────────────────────────────
  // Money is stored in cents (centavos). A service may be backed by a prestador
  // (its cost is what the venue owes that prestador when the service is used).
  const serviceSeed = [
    { name: "Salón (3 hs)", cost: 500000, price: 2500000, prestadorId: null },
    { name: "Torta temática", cost: 800000, price: 1800000, prestadorId: providers["Pastelería Dulce"] },
    { name: "Decoración con globos", cost: 400000, price: 1200000, prestadorId: providers["Decoradora Magia"] },
    { name: "Catering kids", cost: 600000, price: 1500000, prestadorId: providers["Catering Sabores"] },
    { name: "Animación", cost: 0, price: 1000000, prestadorId: null },
    { name: "Fotografía", cost: 0, price: 1400000, prestadorId: null },
  ];
  const services: Record<string, string> = {};
  for (const s of serviceSeed) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    const svc = existing ?? (await prisma.service.create({ data: s }));
    services[s.name] = svc.id;
  }

  // ─── Staff (internal hourly-paid employees) ───────────────────────────────
  // hourlyRate in cents/hour.
  const staffSeed = [
    { name: "Ana Torres", role: "Mozo", hourlyRate: 250000 },
    { name: "Diego Sosa", role: "Coordinador", hourlyRate: 400000 },
    { name: "Romina Díaz", role: "Limpieza", hourlyRate: 200000 },
  ];
  const staff: Record<string, string> = {};
  for (const s of staffSeed) {
    const existing = await prisma.staff.findFirst({ where: { name: s.name } });
    const row = existing ?? (await prisma.staff.create({ data: s }));
    staff[s.name] = row.id;
  }

  // ─── Clients ──────────────────────────────────────────────────────────────
  const clientSeed = [
    { name: "Familia García", phone: "+54 11 5555-1234", email: "garcia@example.com" },
    { name: "Familia López", phone: "+54 11 5555-5678", email: "lopez@example.com" },
    { name: "Familia Martínez", phone: "+54 11 5555-9999", email: "martinez@example.com" },
  ];
  const clients: Record<string, string> = {};
  for (const c of clientSeed) {
    const existing = await prisma.client.findFirst({ where: { name: c.name } });
    const cli = existing ?? (await prisma.client.create({ data: c }));
    clients[c.name] = cli.id;
  }

  // ─── Sample events (only if events table is empty) ────────────────────────
  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    const now = new Date();
    const day = (offset: number, h = 16) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      d.setHours(h, 0, 0, 0);
      return d;
    };

    await prisma.event.create({
      data: {
        name: "Cumple Mateo (5 años)",
        eventType: "Cumpleaños",
        clientName: "Familia García",
        clientId: clients["Familia García"],
        startAt: day(7, 15),
        endAt: day(7, 18),
        state: "RESERVADO",
        services: {
          create: [
            { serviceId: services["Salón (3 hs)"], qty: 1 },
            { serviceId: services["Torta temática"], qty: 1 },
            { serviceId: services["Animación"], qty: 1 },
          ],
        },
        providers: {
          create: [{ providerId: providers["Mariana Gómez"] }],
        },
        // Future event: hours only estimated → "falta registro de empleados".
        staff: {
          create: [
            { staffId: staff["Ana Torres"], estMinutes: 300 },
            { staffId: staff["Diego Sosa"], estMinutes: 240 },
          ],
        },
      },
    });

    await prisma.event.create({
      data: {
        name: "Baby shower Sofía",
        eventType: "Baby shower",
        clientName: "Familia López",
        clientId: clients["Familia López"],
        startAt: day(14, 17),
        endAt: day(14, 20),
        state: "PRESUPUESTADO",
        services: {
          create: [
            { serviceId: services["Salón (3 hs)"], qty: 1 },
            { serviceId: services["Catering kids"], qty: 1 },
          ],
        },
      },
    });

    await prisma.event.create({
      data: {
        name: "Cumple Lucía (3 años)",
        eventType: "Cumpleaños",
        clientName: "Familia Martínez",
        clientId: clients["Familia Martínez"],
        startAt: day(-7, 16),
        endAt: day(-7, 19),
        state: "PAGADO",
        services: {
          create: [
            { serviceId: services["Salón (3 hs)"], qty: 1 },
            { serviceId: services["Decoración con globos"], qty: 1 },
            { serviceId: services["Fotografía"], qty: 1 },
          ],
        },
        providers: {
          create: [{ providerId: providers["Carlos Ruiz"] }],
        },
        // Past event: real hours logged (registered).
        staff: {
          create: [
            { staffId: staff["Ana Torres"], estMinutes: 300, actualMinutes: 330 },
            { staffId: staff["Romina Díaz"], estMinutes: 120, actualMinutes: 120 },
          ],
        },
      },
    });
  }

  // Price is never set by hand — derive each event's totalPrice from its service
  // lines minus bonificados, mirroring recomputeEventTotalPrice() in the app.
  const allEvents = await prisma.event.findMany({
    include: {
      services: { include: { service: true } },
      bonificados: { include: { service: true } },
    },
  });
  for (const event of allEvents) {
    const { subtotal } = computeEventFinancials({
      services: event.services,
      providers: [],
      bonificados: event.bonificados,
      staff: [],
    });
    if (subtotal !== event.totalPrice) {
      await prisma.event.update({ where: { id: event.id }, data: { totalPrice: subtotal } });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
