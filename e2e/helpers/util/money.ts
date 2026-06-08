/**
 * Format a peso amount the way the app renders it (es-AR: "$10.000", dot
 * thousands separator, no decimals for whole amounts). Use to build expected
 * money strings instead of hardcoding "$10.000" in specs.
 * @param pesos - Whole-peso amount (the app stores cents; the UI shows pesos).
 * @returns Formatted string, e.g. "$12.500".
 */
export function money(pesos: number): string {
  return `$${pesos.toLocaleString("es-AR")}`;
}
