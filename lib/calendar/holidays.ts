// Argentine public holidays from the free, key-less Nager.Date API.
// Network failures degrade gracefully to an empty list so the calendar still
// renders. Parsing is split out (pure) so it can be unit-tested without fetch.

export type Holiday = { dateMs: number; name: string };

type NagerHoliday = { date?: string; localName?: string; name?: string };

// Parse a Nager.Date response into local-midnight ms + Spanish name.
// Uses local Date(y, m, d) so the holiday lands on the same calendar day the
// grid renders (avoids the UTC-midnight-shifts-to-previous-day trap, GMT-3).
export function parseHolidays(data: unknown): Holiday[] {
  if (!Array.isArray(data)) return [];
  const out: Holiday[] = [];
  for (const h of data as NagerHoliday[]) {
    const m = h && typeof h.date === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(h.date) : null;
    if (!m) continue;
    const dateMs = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
    out.push({ dateMs, name: h.localName || h.name || "Feriado" });
  }
  return out;
}

export async function fetchArgentineHolidays(year: number): Promise<Holiday[]> {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/AR`, {
      // Cache for a day — holidays rarely change.
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    return parseHolidays(await res.json());
  } catch {
    return [];
  }
}

export async function fetchArgentineHolidaysForYears(years: number[]): Promise<Holiday[]> {
  const all = await Promise.all(years.map(fetchArgentineHolidays));
  return all.flat();
}
