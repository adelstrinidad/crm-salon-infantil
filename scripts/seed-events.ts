// One-off: bulk-inject events so the list page paginates / filters are testable.
// Run: npx tsx scripts/seed-events.ts [count]   (default 40)
import path from "path";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const dbUrl = `file:${path.resolve("dev.db")}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

const EVENT_TYPES = ["Cumpleaños", "Aniversario", "Empresarial", "Baby shower", "Egreso"];
const STATES = [
  "PRESUPUESTADO",
  "RESERVADO",
  "SENADO",
  "PAGADO",
  "CERRADO",
  "SUSPENDIDO",
] as const;
const CLIENTS = [
  "Familia García",
  "Familia Martínez",
  "Familia López",
  "Familia Fernández",
  "Familia Rodríguez",
  "Empresa Nortal",
];
const THEMES = [
  "Dinosaurios",
  "Princesas",
  "Superhéroes",
  "Espacio",
  "Unicornios",
  "Fútbol",
  "Selva",
  "Sirenas",
];

async function main() {
  const count = Number.parseInt(process.argv[2] ?? "40", 10);
  console.log(`Injecting ${count} test events into ${dbUrl}…`);

  const rows = Array.from({ length: count }, (_, i) => {
    // Spread events across ~5 months, deterministic (no Math.random) so reruns
    // are reproducible. Day cycles 1–28 to stay valid in every month.
    const monthOffset = i % 5; // 0..4
    const day = ((i * 3) % 28) + 1; // 1..28
    const hour = 10 + (i % 8); // 10..17
    const month = 2 + monthOffset; // Mar..Jul (0-based: 2..6)
    const startAt = new Date(2026, month, day, hour, 0, 0);
    const endAt = new Date(startAt.getTime() + 3 * 60 * 60 * 1000);

    const theme = THEMES[i % THEMES.length];
    const type = EVENT_TYPES[i % EVENT_TYPES.length];
    const client = CLIENTS[i % CLIENTS.length];
    const state = STATES[i % STATES.length];
    // Prices in cents: 80k..600k pesos.
    const totalPrice = (80_000 + (i % 13) * 40_000) * 100;

    return {
      name: `Evento ${theme} #${String(i + 1).padStart(3, "0")}`,
      eventType: type,
      clientName: client,
      startAt,
      endAt,
      state,
      totalPrice,
    };
  });

  const result = await prisma.event.createMany({ data: rows });
  const total = await prisma.event.count();
  console.log(`Inserted ${result.count}. Event table now has ${total} rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
