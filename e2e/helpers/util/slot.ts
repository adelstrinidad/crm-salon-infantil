// Timestamp-derived, never a fixed calendar date. Each call books a DISTINCT
// future day so events never overlap: the run seed (now, ms) maps to one of many
// day-buckets for cross-run uniqueness against the stateful dev.db, and a
// per-call counter adds a further day within the run. Events are 09:00–12:00, so
// different days can never trip the venue's double-booking guard.
const RUN_SEED = Date.now();
const DAY_BUCKETS = 100_000; // ~273 years of distinct start days
let callIndex = 0;

/**
 * A unique, always-future, non-overlapping datetime-local slot per call,
 * computed from the current timestamp (no hardcoded date).
 * @returns `{ start, end }` as `YYYY-MM-DDTHH:mm` strings, 3h apart.
 */
export function uniqueSlot(): { start: string; end: string } {
  const dayOffset = 30 + (RUN_SEED % DAY_BUCKETS) + callIndex++;
  const start = new Date();
  start.setDate(start.getDate() + dayOffset);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  return { start: fmt(start), end: fmt(end) };
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
