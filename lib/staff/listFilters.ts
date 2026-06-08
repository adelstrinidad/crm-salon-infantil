// Pure helpers for the staff (Personal) list page: sort whitelist + parser.
// Kept Prisma-free so they're unit-testable apart from the DB query.

export type StaffSortField = "name" | "hourlyRate" | "createdAt";
export type SortDir = "asc" | "desc";
export type StaffSort = { field: StaffSortField; dir: SortDir };

// Single source of truth for the sort dropdown: each option's `value` is the
// `field:dir` string submitted in the URL, paired with its Spanish label.
export const STAFF_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name:asc", label: "Nombre — A→Z" },
  { value: "name:desc", label: "Nombre — Z→A" },
  { value: "hourlyRate:desc", label: "Costo/hora — mayor" },
  { value: "hourlyRate:asc", label: "Costo/hora — menor" },
  { value: "createdAt:desc", label: "Creación — reciente" },
];

export const DEFAULT_STAFF_SORT = "name:asc";

const ALLOWED_FIELDS: StaffSortField[] = ["name", "hourlyRate", "createdAt"];

// Parse a `field:dir` URL value into a validated sort. Falls back to the default
// (name, A→Z) for anything unrecognized — never trusts raw input as a column name.
export function parseStaffSort(value: string | undefined): StaffSort {
  const [field, dir] = (value ?? "").split(":");
  if (!ALLOWED_FIELDS.includes(field as StaffSortField)) {
    return { field: "name", dir: "asc" };
  }
  const safeDir: SortDir = dir === "desc" ? "desc" : "asc";
  return { field: field as StaffSortField, dir: safeDir };
}
