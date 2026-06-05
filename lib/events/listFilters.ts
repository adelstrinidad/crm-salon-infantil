// Pure helpers for the events list page: sort whitelist + parser.
// Kept Prisma-free so they're unit-testable apart from the DB query.

export type EventSortField = "startAt" | "name" | "totalPrice" | "createdAt";
export type SortDir = "asc" | "desc";
export type EventSort = { field: EventSortField; dir: SortDir };

// Single source of truth for the sort dropdown: each option's `value` is the
// `field:dir` string submitted in the URL, paired with its Spanish label.
export const EVENT_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "startAt:desc", label: "Fecha — más reciente" },
  { value: "startAt:asc", label: "Fecha — más antigua" },
  { value: "name:asc", label: "Nombre — A→Z" },
  { value: "name:desc", label: "Nombre — Z→A" },
  { value: "totalPrice:desc", label: "Precio — mayor" },
  { value: "totalPrice:asc", label: "Precio — menor" },
  { value: "createdAt:desc", label: "Creación — reciente" },
];

export const DEFAULT_EVENT_SORT = "startAt:desc";

const ALLOWED_FIELDS: EventSortField[] = ["startAt", "name", "totalPrice", "createdAt"];

// Parse a `field:dir` URL value into a validated sort. Falls back to the default
// (start date, newest first) for anything unrecognized — never trusts raw input
// as a column name.
export function parseEventSort(value: string | undefined): EventSort {
  const [field, dir] = (value ?? "").split(":");
  const safeField = ALLOWED_FIELDS.includes(field as EventSortField)
    ? (field as EventSortField)
    : "startAt";
  const safeDir: SortDir = dir === "asc" ? "asc" : "desc";
  // Guard: only honor dir for recognized fields; otherwise force the default.
  if (!ALLOWED_FIELDS.includes(field as EventSortField)) {
    return { field: "startAt", dir: "desc" };
  }
  return { field: safeField, dir: safeDir };
}
