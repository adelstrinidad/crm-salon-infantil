import { prisma } from "@/lib/prisma";
import type { AccountFormInput, MovementFormValues } from "./schema";
import { computeAccountBalance, summarizeGroupedByType } from "./balance";

// ── Accounts ──────────────────────────────────────────────────────────────────

export async function listAccounts() {
  return prisma.account.findMany({ orderBy: { name: "asc" } });
}

export async function getAccount(id: string) {
  return prisma.account.findUniqueOrThrow({ where: { id } });
}

export async function createAccount(data: AccountFormInput) {
  return prisma.account.create({ data });
}

export async function updateAccount(id: string, data: AccountFormInput) {
  return prisma.account.update({ where: { id }, data });
}

export async function deleteAccount(id: string) {
  return prisma.account.delete({ where: { id } });
}

// ── Movements ────────────────────────────────────────────────────────────────

export async function listMovements(limit = 50) {
  return prisma.movement.findMany({
    orderBy: { date: "desc" },
    take: limit,
    include: { account: true, toAccount: true },
  });
}

export async function listMovementsFiltered(opts: {
  from?: Date;
  to?: Date;
  accountId?: string;
  type?: string;
  skip?: number;
  take?: number;
}) {
  const where = {
    ...(opts.from || opts.to
      ? { date: { ...(opts.from ? { gte: opts.from } : {}), ...(opts.to ? { lte: opts.to } : {}) } }
      : {}),
    ...(opts.accountId ? { accountId: opts.accountId } : {}),
    ...(opts.type ? { type: opts.type as MovementFormValues["type"] } : {}),
  };
  const paginate = opts.skip !== undefined && opts.take !== undefined;
  const [rows, total, byType] = await Promise.all([
    prisma.movement.findMany({
      where,
      orderBy: { date: "desc" },
      include: { account: true, toAccount: true },
      ...(paginate ? { skip: opts.skip, take: opts.take } : {}),
    }),
    prisma.movement.count({ where }),
    // Aggregate over the FULL filtered set (not just the page) so the summary
    // row stays correct regardless of pagination.
    prisma.movement.groupBy({ by: ["type"], where, _sum: { amount: true } }),
  ]);

  const { totalIngreso, totalEgreso } = summarizeGroupedByType(
    byType.map((g) => ({ type: g.type, sum: g._sum.amount ?? 0 }))
  );

  return { rows, total, totalIngreso, totalEgreso };
}

export async function getMovement(id: string) {
  return prisma.movement.findUniqueOrThrow({ where: { id }, include: { account: true } });
}

export async function createMovement(data: MovementFormValues) {
  return prisma.movement.create({ data });
}

export async function updateMovement(id: string, data: MovementFormValues) {
  return prisma.movement.update({ where: { id }, data });
}

export async function deleteMovement(id: string) {
  return prisma.movement.delete({ where: { id } });
}

export async function getMovementsByEvent(eventId: string) {
  return prisma.movement.findMany({
    where: { eventId },
    orderBy: { date: "asc" },
    include: { account: true },
  });
}

// ── Balance computation ───────────────────────────────────────────────────────

export async function getAccountsWithBalance() {
  const accounts = await prisma.account.findMany({
    orderBy: { name: "asc" },
    // `movements` = outbound (this account as source); `inbound` = transfers
    // received (this account as toAccountId). Both feed the balance.
    include: { movements: true, inbound: true },
  });

  return accounts.map((acc) => ({
    ...acc,
    balance: computeAccountBalance(acc.movements, acc.inbound),
  }));
}
