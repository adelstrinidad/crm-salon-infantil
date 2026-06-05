// Double-booking detection. The venue has no room/sala model, so any two
// events whose time ranges intersect are a potential conflict to flag.
// Ranges are half-open [startMs, endMs): touching edges do NOT overlap.

export type TimeSpan = { id: string; startMs: number; endMs: number };

// Returns the set of ids that intersect at least one other span.
export function findOverlappingIds(spans: TimeSpan[]): Set<string> {
  const sorted = [...spans].sort((a, b) => a.startMs - b.startMs);
  const overlapping = new Set<string>();
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      // sorted by start: once j starts at/after i ends, no later j can overlap i.
      if (sorted[j].startMs >= sorted[i].endMs) break;
      // i.start <= j.start < i.end here, so they intersect.
      overlapping.add(sorted[i].id);
      overlapping.add(sorted[j].id);
    }
  }
  return overlapping;
}

// Does a candidate span intersect any of the others (optionally excluding one id)?
// Used to warn before committing a drag-reschedule.
export function overlapsAny(
  span: { startMs: number; endMs: number },
  others: TimeSpan[],
  excludeId?: string,
): boolean {
  return others.some(
    (o) => o.id !== excludeId && span.startMs < o.endMs && o.startMs < span.endMs,
  );
}
