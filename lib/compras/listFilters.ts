// Pure helpers for the compras list page: sort whitelist + parser.
// Kept Prisma-free so they're unit-testable apart from the DB query.

export type CompraSortField = "date" | "total" | "createdAt";
export type SortDir = "asc" | "desc";
export type CompraSort = { field: CompraSortField; dir: SortDir };

export const COMPRA_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "date:desc", label: "Fecha — reciente" },
  { value: "date:asc", label: "Fecha — antigua" },
  { value: "total:desc", label: "Total — mayor primero" },
  { value: "total:asc", label: "Total — menor primero" },
  { value: "createdAt:desc", label: "Creación — reciente" },
];

export const DEFAULT_COMPRA_SORT = "date:desc";

const ALLOWED_FIELDS: CompraSortField[] = ["date", "total", "createdAt"];

// Parse a `field:dir` URL value into a validated sort. Falls back to the default
// (date, reciente) for anything unrecognized — never trusts raw input as a column.
export function parseCompraSort(value: string | undefined): CompraSort {
  const [field, dir] = (value ?? "").split(":");
  if (!ALLOWED_FIELDS.includes(field as CompraSortField)) {
    return { field: "date", dir: "desc" };
  }
  const safeDir: SortDir = dir === "asc" ? "asc" : "desc";
  return { field: field as CompraSortField, dir: safeDir };
}
