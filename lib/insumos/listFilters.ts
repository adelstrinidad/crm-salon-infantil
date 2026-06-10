// Pure helpers for the insumos list page: sort whitelist + parser.
// Kept Prisma-free so they're unit-testable apart from the DB query.

export type InsumoSortField = "name" | "stockQty" | "createdAt";
export type SortDir = "asc" | "desc";
export type InsumoSort = { field: InsumoSortField; dir: SortDir };

// Single source of truth for the sort dropdown: each option's `value` is the
// `field:dir` string submitted in the URL, paired with its Spanish label.
export const INSUMO_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name:asc", label: "Nombre — A→Z" },
  { value: "name:desc", label: "Nombre — Z→A" },
  { value: "stockQty:asc", label: "Stock — menor primero" },
  { value: "stockQty:desc", label: "Stock — mayor primero" },
  { value: "createdAt:desc", label: "Creación — reciente" },
  { value: "createdAt:asc", label: "Creación — antigua" },
];

export const DEFAULT_INSUMO_SORT = "name:asc";

const ALLOWED_FIELDS: InsumoSortField[] = ["name", "stockQty", "createdAt"];

// Parse a `field:dir` URL value into a validated sort. Falls back to the default
// (name, A→Z) for anything unrecognized — never trusts raw input as a column name.
export function parseInsumoSort(value: string | undefined): InsumoSort {
  const [field, dir] = (value ?? "").split(":");
  if (!ALLOWED_FIELDS.includes(field as InsumoSortField)) {
    return { field: "name", dir: "asc" };
  }
  const safeDir: SortDir = dir === "desc" ? "desc" : "asc";
  return { field: field as InsumoSortField, dir: safeDir };
}
