// Pure helpers for the providers list page: sort whitelist + parser.
// Kept Prisma-free so they're unit-testable apart from the DB query.

export type ProviderSortField = "name" | "cost" | "createdAt";
export type SortDir = "asc" | "desc";
export type ProviderSort = { field: ProviderSortField; dir: SortDir };

// Single source of truth for the sort dropdown: each option's `value` is the
// `field:dir` string submitted in the URL, paired with its Spanish label.
export const PROVIDER_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name:asc", label: "Nombre — A→Z" },
  { value: "name:desc", label: "Nombre — Z→A" },
  { value: "cost:desc", label: "Costo — mayor" },
  { value: "cost:asc", label: "Costo — menor" },
  { value: "createdAt:desc", label: "Creación — reciente" },
];

export const DEFAULT_PROVIDER_SORT = "name:asc";

const ALLOWED_FIELDS: ProviderSortField[] = ["name", "cost", "createdAt"];

// Parse a `field:dir` URL value into a validated sort. Falls back to the default
// (name, A→Z) for anything unrecognized — never trusts raw input as a column name.
export function parseProviderSort(value: string | undefined): ProviderSort {
  const [field, dir] = (value ?? "").split(":");
  // Guard: only honor recognized fields; otherwise force the default — this
  // keeps arbitrary user input out of the Prisma orderBy key.
  if (!ALLOWED_FIELDS.includes(field as ProviderSortField)) {
    return { field: "name", dir: "asc" };
  }
  const safeDir: SortDir = dir === "desc" ? "desc" : "asc";
  return { field: field as ProviderSortField, dir: safeDir };
}
