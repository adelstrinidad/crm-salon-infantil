// Pure consumption-bill math — no Prisma, unit-testable in isolation.
// All money in integer cents.

export type ConsumoLine = {
  tableNumber: number;
  qty: number;
  unitPrice: number; // cents, snapshot at capture time
};

export function consumoLineTotal(line: { qty: number; unitPrice: number }): number {
  return line.unitPrice * line.qty;
}

export type ConsumosSummary = {
  total: number; // grand total of the bill, cents
  totalQty: number; // units consumed across all tables
  byTable: { tableNumber: number; qty: number; total: number }[]; // only tables with lines, ascending
};

// A line with payment ownership, as stored. Generic over the base line so the
// helpers work with both plain calc inputs and Prisma rows.
export type PayerInfo = {
  payerType: string; // "CLIENTE" | "INVITADO"
  payerLabel: string | null;
  paid: boolean;
  paidAt?: Date | null;
};

export type GuestGroup<T> = {
  label: string;
  lines: T[];
  total: number; // cents
  pendingTotal: number; // cents still unpaid for this guest
  paid: boolean; // every line settled
};

// Split a bill into the organizer's lines and per-guest groups (insertion
// order, label-keyed). The CLIENTE side keeps the existing single-payment flow;
// each guest group is charged independently.
export function splitConsumosByPayer<T extends ConsumoLine & PayerInfo>(
  lines: T[],
): { cliente: T[]; invitados: GuestGroup<T>[] } {
  const cliente: T[] = [];
  const byGuest = new Map<string, T[]>();
  for (const line of lines) {
    if (line.payerType === "INVITADO" && line.payerLabel) {
      const group = byGuest.get(line.payerLabel) ?? [];
      group.push(line);
      byGuest.set(line.payerLabel, group);
    } else {
      cliente.push(line);
    }
  }
  const invitados = [...byGuest.entries()].map(([label, groupLines]) => {
    const total = groupLines.reduce((s, l) => s + consumoLineTotal(l), 0);
    const pendingTotal = groupLines
      .filter((l) => !l.paid)
      .reduce((s, l) => s + consumoLineTotal(l), 0);
    return { label, lines: groupLines, total, pendingTotal, paid: pendingTotal === 0 };
  });
  return { cliente, invitados };
}

// The organizer's outstanding amount (unpaid CLIENTE lines).
export function pendingClientTotal<T extends ConsumoLine & PayerInfo>(lines: T[]): number {
  return splitConsumosByPayer(lines)
    .cliente.filter((l) => !l.paid)
    .reduce((s, l) => s + consumoLineTotal(l), 0);
}

// Bill money split by payment status, for the event-detail summary. `vendido`
// is everything captured (stock already left the shelf, so it's owed);
// `cobrado` is only the settled lines (those that produced an INGRESO consumo
// movement); `pendiente` is the gap still to collect. Cost/margin are
// deliberately left out — an insumo has no purchase cost on record (only a sale
// `eventPrice`), so a margin here would be guesswork (see event-detail design).
export type ConsumosFinancials = {
  vendido: number; // cents, all lines
  cobrado: number; // cents, paid lines
  pendiente: number; // cents, vendido − cobrado
};

export function computeConsumosFinancials(
  lines: { qty: number; unitPrice: number; paid: boolean }[],
): ConsumosFinancials {
  let vendido = 0;
  let cobrado = 0;
  for (const line of lines) {
    const lineTotal = consumoLineTotal(line);
    vendido += lineTotal;
    if (line.paid) cobrado += lineTotal;
  }
  return { vendido, cobrado, pendiente: vendido - cobrado };
}

export function computeConsumosSummary(lines: ConsumoLine[]): ConsumosSummary {
  const perTable = new Map<number, { qty: number; total: number }>();
  let total = 0;
  let totalQty = 0;
  for (const line of lines) {
    const lineTotal = consumoLineTotal(line);
    total += lineTotal;
    totalQty += line.qty;
    const acc = perTable.get(line.tableNumber) ?? { qty: 0, total: 0 };
    acc.qty += line.qty;
    acc.total += lineTotal;
    perTable.set(line.tableNumber, acc);
  }
  const byTable = [...perTable.entries()]
    .map(([tableNumber, acc]) => ({ tableNumber, ...acc }))
    .sort((a, b) => a.tableNumber - b.tableNumber);
  return { total, totalQty, byTable };
}
