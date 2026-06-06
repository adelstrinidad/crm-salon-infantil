// Pure helpers for the services list page: sort whitelist + parser.
// Kept Prisma-free so they're unit-testable apart from the DB query.

export type ServiceSortField = "name" | "cost" | "price" | "createdAt";
export type SortDir = "asc" | "desc";
export type ServiceSort = { field: ServiceSortField; dir: SortDir };

// Single source of truth for the sort dropdown: each option's `value` is the
// `field:dir` string submitted in the URL, paired with its Spanish label.
export const SERVICE_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name:asc", label: "Nombre — A→Z" },
  { value: "name:desc", label: "Nombre — Z→A" },
  { value: "price:desc", label: "Precio — mayor" },
  { value: "price:asc", label: "Precio — menor" },
  { value: "cost:desc", label: "Costo — mayor" },
  { value: "cost:asc", label: "Costo — menor" },
  { value: "createdAt:desc", label: "Creación — reciente" },
];

export const DEFAULT_SERVICE_SORT = "name:asc";

const ALLOWED_FIELDS: ServiceSortField[] = ["name", "cost", "price", "createdAt"];

// Parse a `field:dir` URL value into a validated sort. Falls back to the default
// (name, A→Z) for anything unrecognized — never trusts raw input as a column name.
export function parseServiceSort(value: string | undefined): ServiceSort {
  const [field, dir] = (value ?? "").split(":");
  // Guard: only honor a recognized field; otherwise force the default.
  if (!ALLOWED_FIELDS.includes(field as ServiceSortField)) {
    return { field: "name", dir: "asc" };
  }
  const safeDir: SortDir = dir === "desc" ? "desc" : "asc";
  return { field: field as ServiceSortField, dir: safeDir };
}
