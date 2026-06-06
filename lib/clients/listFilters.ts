// Pure helpers for the clients list page: sort whitelist + parser.
// Kept Prisma-free so they're unit-testable apart from the DB query.

export type ClientSortField = "name" | "createdAt";
export type SortDir = "asc" | "desc";
export type ClientSort = { field: ClientSortField; dir: SortDir };

// Single source of truth for the sort dropdown: each option's `value` is the
// `field:dir` string submitted in the URL, paired with its Spanish label.
export const CLIENT_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name:asc", label: "Nombre — A→Z" },
  { value: "name:desc", label: "Nombre — Z→A" },
  { value: "createdAt:desc", label: "Creación — reciente" },
  { value: "createdAt:asc", label: "Creación — antigua" },
];

export const DEFAULT_CLIENT_SORT = "name:asc";

const ALLOWED_FIELDS: ClientSortField[] = ["name", "createdAt"];

// Parse a `field:dir` URL value into a validated sort. Falls back to the default
// (name, A→Z) for anything unrecognized — never trusts raw input as a column name.
export function parseClientSort(value: string | undefined): ClientSort {
  const [field, dir] = (value ?? "").split(":");
  // Guard: only honor a recognized field; otherwise force the default.
  if (!ALLOWED_FIELDS.includes(field as ClientSortField)) {
    return { field: "name", dir: "asc" };
  }
  const safeField = field as ClientSortField;
  const safeDir: SortDir = dir === "desc" ? "desc" : "asc";
  return { field: safeField, dir: safeDir };
}
