// Money is stored everywhere as integer cents (centavos) to avoid floating-point
// rounding errors in accounting. Convert at the I/O boundaries only:
//   - form input (pesos string) → pesosToCents → store
//   - stored cents → formatMoney → display
//   - stored cents → centsToPesos → prefill a number input
// All internal arithmetic (financial summaries, balances) runs on integer cents.

export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100);
}

export function parsePesosToCents(value: string | undefined | null): number {
  const pesos = Number.parseFloat(value ?? "0");
  return Number.isFinite(pesos) ? pesosToCents(pesos) : 0;
}

export function centsToPesos(cents: number): number {
  return cents / 100;
}

// Format cents as an Argentine-peso string, e.g. 1550050 → "$15.500,5".
export function formatMoney(cents: number): string {
  return `$${centsToPesos(cents).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
