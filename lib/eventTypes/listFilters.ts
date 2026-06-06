// Pure helpers for the event-types list page: sort whitelist + parser.
// Kept Prisma-free so they're unit-testable apart from the DB query.

export type EventTypeSortField = "name" | "createdAt";
export type SortDir = "asc" | "desc";
export type EventTypeSort = { field: EventTypeSortField; dir: SortDir };

// Single source of truth for the sort dropdown: each option's `value` is the
// `field:dir` string submitted in the URL, paired with its Spanish label.
export const EVENT_TYPE_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name:asc", label: "Nombre — A→Z" },
  { value: "name:desc", label: "Nombre — Z→A" },
  { value: "createdAt:desc", label: "Creación — reciente" },
  { value: "createdAt:asc", label: "Creación — antigua" },
];

export const DEFAULT_EVENT_TYPE_SORT = "name:asc";

const ALLOWED_FIELDS: EventTypeSortField[] = ["name", "createdAt"];

// Parse a `field:dir` URL value into a validated sort. Falls back to the default
// (name, A→Z) for anything unrecognized — never trusts raw input as a column name.
export function parseEventTypeSort(value: string | undefined): EventTypeSort {
  const [field, dir] = (value ?? "").split(":");
  // Guard: only honor dir for recognized fields; otherwise force the default.
  if (!ALLOWED_FIELDS.includes(field as EventTypeSortField)) {
    return { field: "name", dir: "asc" };
  }
  const safeDir: SortDir = dir === "desc" ? "desc" : "asc";
  return { field: field as EventTypeSortField, dir: safeDir };
}
