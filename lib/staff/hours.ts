// Pure helpers for staff working time. Hours are entered in the UI as hh:mm
// with minutes restricted to 00 or 30 (half-hour granularity, no partials), and
// stored as integer minutes — mirroring the money-in-cents convention. Kept
// Prisma-free so they're unit-testable in isolation.

// Smallest allowed step, in minutes. Hours must land on a half-hour boundary.
export const HALF_HOUR = 30;

// True when `minutes` is a non-negative multiple of 30 (a valid half-hour value).
export function isHalfHourMinutes(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 0 && minutes % HALF_HOUR === 0;
}

// Combine an hours + minutes pair into total minutes for storage.
// e.g. parseHHMM(5, 30) → 330.
export function parseHHMM(hours: number, minutes: number): number {
  const h = Number.isFinite(hours) ? Math.trunc(hours) : 0;
  const m = Number.isFinite(minutes) ? Math.trunc(minutes) : 0;
  return Math.max(0, h) * 60 + Math.max(0, m);
}

// Format stored minutes as hh:mm for display. e.g. 330 → "5:30", 300 → "5:00".
export function formatHHMM(minutes: number | null | undefined): string {
  const total = Math.max(0, Math.trunc(minutes ?? 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

// Cost of one staff line: hourly rate (cents/hour) × minutes / 60, rounded to
// the nearest cent. Single source of truth for staff cost, reused by the event
// financial summary.
export function staffLineCost(hourlyRate: number, minutes: number): number {
  return Math.round((hourlyRate * minutes) / 60);
}

// The effective minutes used for costing/paying a staff assignment: the real
// logged hours once known, otherwise the estimate, otherwise zero.
export function effectiveMinutes(
  estMinutes: number | null | undefined,
  actualMinutes: number | null | undefined,
): number {
  return actualMinutes ?? estMinutes ?? 0;
}
