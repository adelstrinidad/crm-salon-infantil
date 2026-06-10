// Pure purchase math, kept Prisma-free so it's unit-testable apart from the DB.
// All money in integer cents.

export type CompraLineAmount = { qty: number; unitCost: number };

// A single line's subtotal: units bought × cost per unit (cents).
export function lineSubtotal(line: CompraLineAmount): number {
  return line.qty * line.unitCost;
}

// A Compra's total: sum of every line's subtotal (cents). Empty → 0.
export function computeCompraTotal(lines: CompraLineAmount[]): number {
  return lines.reduce((sum, l) => sum + lineSubtotal(l), 0);
}
