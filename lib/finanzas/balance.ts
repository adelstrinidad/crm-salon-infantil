// Pure money-math for accounts and movements, extracted from the service layer
// so it can be unit-tested without a database. All amounts are integer cents.
//
// The service functions (getAccountsWithBalance, listMovementsFiltered,
// reports.getMovementSummary) call these; they do the DB I/O, these do the math.
import { MOVEMENT_SIGN, MOVEMENT_FLOW, type MovementType } from "./schema";

// Minimal shape we need off a movement — keeps these helpers decoupled from
// the full Prisma row so tests can pass plain objects.
export type SignedMovement = { type: MovementType | string; amount: number };

// Signed sum of an account's OUTBOUND movements (rows where this account is
// `accountId`). Each movement adds or subtracts per MOVEMENT_SIGN; a
// TRANSFERENCIA has sign -1, so it debits the source account here. The matching
// credit to the destination is added separately — see computeAccountBalance.
export function computeBalance(movements: SignedMovement[]): number {
  return movements.reduce(
    (sum, m) => sum + m.amount * MOVEMENT_SIGN[m.type as MovementType],
    0
  );
}

// Full balance for one account: its outbound movements (signed) PLUS the
// inbound transfers it received (rows where this account is `toAccountId`).
// A TRANSFERENCIA is money-neutral overall — it debits the source (handled in
// `outbound` via MOVEMENT_SIGN = -1) and credits the destination (+amount,
// handled here) — so total balance across all accounts is preserved.
export function computeAccountBalance(
  outbound: SignedMovement[],
  inbound: { amount: number }[]
): number {
  const inboundCredit = inbound.reduce((sum, m) => sum + m.amount, 0);
  return computeBalance(outbound) + inboundCredit;
}

export type MovementTotals = {
  totalIngreso: number;
  totalEgreso: number;
  net: number;
};

// Split a set of movements into ingreso (income) and egreso (expense) totals by
// MOVEMENT_FLOW. `totalEgreso` is reported as a positive magnitude; `net` is
// ingreso minus egreso. "neutral" types (TRANSFERENCIA, ARQUEO) are excluded —
// they move balance but aren't real income/expense. Used by the movements list
// summary and reports.
export function summarizeMovements(movements: SignedMovement[]): MovementTotals {
  let totalIngreso = 0;
  let totalEgreso = 0;
  for (const m of movements) {
    const flow = MOVEMENT_FLOW[m.type as MovementType];
    if (flow === "income") totalIngreso += m.amount;
    else if (flow === "expense") totalEgreso += m.amount;
    // "neutral" (internal transfers, cash-count arqueo) excluded from P&L totals
  }
  return { totalIngreso, totalEgreso, net: totalIngreso - totalEgreso };
}

// Same split but from a pre-aggregated groupBy result (type → summed amount),
// as Prisma returns from movement.groupBy. Avoids re-loading every row.
// Classifies by MOVEMENT_FLOW; "neutral" types are excluded (see summarizeMovements).
export function summarizeGroupedByType(
  groups: { type: MovementType | string; sum: number }[]
): { totalIngreso: number; totalEgreso: number } {
  let totalIngreso = 0;
  let totalEgreso = 0;
  for (const g of groups) {
    const flow = MOVEMENT_FLOW[g.type as MovementType];
    if (flow === "income") totalIngreso += g.sum;
    else if (flow === "expense") totalEgreso += g.sum;
  }
  return { totalIngreso, totalEgreso };
}
