// Pure helpers for the proveedores list page: sort whitelist + parser.
// Kept Prisma-free so they're unit-testable apart from the DB query.

export type ProveedorSortField = "name" | "createdAt";
export type SortDir = "asc" | "desc";
export type ProveedorSort = { field: ProveedorSortField; dir: SortDir };

// Single source of truth for the sort dropdown: each option's `value` is the
// `field:dir` string submitted in the URL, paired with its Spanish label.
export const PROVEEDOR_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name:asc", label: "Nombre — A→Z" },
  { value: "name:desc", label: "Nombre — Z→A" },
  { value: "createdAt:desc", label: "Creación — reciente" },
  { value: "createdAt:asc", label: "Creación — antigua" },
];

export const DEFAULT_PROVEEDOR_SORT = "name:asc";

const ALLOWED_FIELDS: ProveedorSortField[] = ["name", "createdAt"];

// Parse a `field:dir` URL value into a validated sort. Falls back to the default
// (name, A→Z) for anything unrecognized — never trusts raw input as a column name.
export function parseProveedorSort(value: string | undefined): ProveedorSort {
  const [field, dir] = (value ?? "").split(":");
  // Guard: only honor a recognized field; otherwise force the default.
  if (!ALLOWED_FIELDS.includes(field as ProveedorSortField)) {
    return { field: "name", dir: "asc" };
  }
  const safeDir: SortDir = dir === "desc" ? "desc" : "asc";
  return { field: field as ProveedorSortField, dir: safeDir };
}
