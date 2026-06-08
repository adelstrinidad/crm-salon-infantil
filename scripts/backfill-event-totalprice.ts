// One-off backfill: recompute every event's stored totalPrice from its service
// lines minus bonificados. Run after the change that makes price derived rather
// than hand-entered, so existing rows (which may hold stale manual prices) get
// brought in sync.
//
//   npx tsx scripts/backfill-event-totalprice.ts
//
// Idempotent — safe to run more than once.
import path from "path";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { computeEventFinancials } from "../lib/events/financials";

const dbUrl = `file:${path.resolve("dev.db")}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const events = await prisma.event.findMany({
    include: {
      services: { include: { service: true } },
      bonificados: { include: { service: true } },
    },
  });

  let changed = 0;
  for (const event of events) {
    const { subtotal } = computeEventFinancials({
      services: event.services,
      providers: [],
      bonificados: event.bonificados,
      staff: [],
    });
    if (subtotal !== event.totalPrice) {
      await prisma.event.update({ where: { id: event.id }, data: { totalPrice: subtotal } });
      console.log(`  ${event.name}: ${event.totalPrice} → ${subtotal}`);
      changed += 1;
    }
  }

  console.log(`Backfill complete: ${changed}/${events.length} event(s) updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
